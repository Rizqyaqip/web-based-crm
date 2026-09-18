const midtransClient = require('midtrans-client');
const crypto = require('crypto');
const { envConfig } = require('../../config');

class MidtransService {
  constructor() {
    const serverKey = envConfig.midtrans?.serverKey || envConfig.MIDTRANS?.SERVER_KEY;
    const clientKey = envConfig.midtrans?.clientKey || envConfig.MIDTRANS?.CLIENT_KEY;
    const isProduction = envConfig.midtrans?.isProduction || envConfig.MIDTRANS?.IS_PRODUCTION || false;

    this.serverKey = serverKey;
    this.clientKey = clientKey;
    this.isProduction = isProduction;

    this.snap = new midtransClient.Snap({
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey
    });
  }

  async createSnapTransaction({ orderId, totalHarga, customer = {}, items = [] }) {
    const uniqueMidtransOrderId = `KETSAI-${orderId}-${Date.now()}`;
    const grossAmount = Math.round(Number(totalHarga) || 0);

    const formattedItems = items.map((item) => {
      const price = Math.round(Number(item.harga) || 0);
      const qty = Number(item.jumlah || item.quantity) || 1;
      return {
        id: String(item.product_id || item.productId || item.id),
        price,
        quantity: qty,
        name: String(item.nama_produk || item.namaProduk || 'Menu Ketsai').slice(0, 50)
      };
    });

    const itemsSum = formattedItems.reduce((acc, itm) => acc + (itm.price * itm.quantity), 0);

    const parameter = {
      transaction_details: {
        order_id: uniqueMidtransOrderId,
        gross_amount: grossAmount
      },
      customer_details: {
        first_name: customer.nama || customer.nama_customer || 'Pelanggan',
        phone: customer.noHp || customer.no_hp || '',
        billing_address: {
          address: customer.alamat || ''
        },
        shipping_address: {
          address: customer.alamat || ''
        }
      }
    };

    // Pastikan item_details hanya dikirim jika jumlah total persis sama dengan gross_amount
    if (itemsSum === grossAmount && formattedItems.length > 0) {
      parameter.item_details = formattedItems;
    }

    try {
      const transaction = await this.snap.createTransaction(parameter);
      return {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
        redirect_url: transaction.redirect_url,
        midtransOrderId: uniqueMidtransOrderId,
        midtrans_order_id: uniqueMidtransOrderId
      };
    } catch (err) {
      console.error('Midtrans Snap Error:', err.message);
      throw new Error(`Gagal membuat transaksi Midtrans: ${err.message}`);
    }
  }

  verifySignature({ orderId, statusCode, grossAmount, signatureKey }) {
    if (!signatureKey || !orderId || !statusCode || !grossAmount) {
      return false;
    }
    const rawPayload = `${orderId}${statusCode}${grossAmount}${this.serverKey}`;
    const calculatedHash = crypto.createHash('sha512').update(rawPayload).digest('hex');
    return calculatedHash === signatureKey;
  }

  mapTransactionStatus(transactionStatus, fraudStatus) {
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        return { paymentStatus: 'Lunas', orderStatus: 'Diproses' };
      }
      return { paymentStatus: 'Tantangan Fraud', orderStatus: 'Pending' };
    }

    if (transactionStatus === 'settlement') {
      return { paymentStatus: 'Lunas', orderStatus: 'Diproses' };
    }

    if (transactionStatus === 'pending') {
      return { paymentStatus: 'Menunggu Pembayaran', orderStatus: 'Pending' };
    }

    if (['deny', 'cancel', 'expire'].includes(transactionStatus)) {
      return { paymentStatus: 'Gagal', orderStatus: 'Dibatalkan' };
    }

    if (['refund', 'partial_refund'].includes(transactionStatus)) {
      return { paymentStatus: 'Dikembalikan', orderStatus: 'Dibatalkan' };
    }

    return { paymentStatus: 'Menunggu Pembayaran', orderStatus: 'Pending' };
  }

}

module.exports = new MidtransService();

