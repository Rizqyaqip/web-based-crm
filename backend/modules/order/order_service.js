const orderRepository = require('./order_repository');
const midtransService = require('./midtrans_service');
const { BadRequestError, NotFoundError } = require('../../utils');
const { orderStatus, ORDER_STATUS } = require('../../constants');

class OrderService {
  async processCheckout(payload = {}) {
    const namaCustomer = payload.nama_customer || payload.namaCustomer;
    const noHp = payload.no_hp || payload.noHp;
    const alamat = payload.alamat;
    const metodePembayaran = payload.metode_pembayaran || payload.metodePembayaran || 'Midtrans Snap';
    const items = payload.items;
    const userId = payload.user_id !== undefined ? payload.user_id : (payload.userId !== undefined ? payload.userId : null);

    // 1. Validasi data checkout
    if (!namaCustomer || !noHp || !alamat) {
      throw new BadRequestError('Nama penerima, nomor telepon, dan alamat pengiriman wajib diisi');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Keranjang belanja tidak boleh kosong');
    }

    const conn = await orderRepository.getConnection();

    try {
      await conn.beginTransaction();

      // 2. Verifikasi ketersediaan stok produk & kalkulasi total harga
      let totalHarga = 0;
      const verifiedItems = [];

      for (const item of items) {
        const productId = item.product_id || item.productId;
        if (!productId) {
          throw new BadRequestError('Item tidak valid: ID produk wajib disertakan');
        }

        const product = await orderRepository.findProductForUpdate(conn, productId);
        if (!product) {
          throw new NotFoundError(`Produk ID ${productId} tidak ditemukan`);
        }

        const qty = Math.max(1, Number(item.jumlah || item.quantity) || 1);
        const availableStock = Number(product.jumlah_stok !== undefined ? product.jumlah_stok : product.jumlahStok) || 0;
        if (availableStock < qty) {
          throw new BadRequestError(`Stok produk "${product.nama_produk}" tidak mencukupi (Tersisa: ${availableStock})`);
        }

        const itemTotal = product.harga * qty;
        totalHarga += itemTotal;

        verifiedItems.push({
          product_id: product.id,
          nama_produk: product.nama_produk,
          harga: product.harga,
          jumlah: qty,
          total_harga: itemTotal
        });
      }

      // 3. Masukkan pesanan
      const tanggalPesan = new Date();
      const initialStatus = (orderStatus && orderStatus.pending) || ORDER_STATUS.PENDING || 'Pending';

      const orderId = await orderRepository.insertOrder(conn, {
        userId: userId || null,
        namaCustomer: namaCustomer.trim(),
        noHp: noHp.trim(),
        alamat: alamat.trim(),
        tanggalPesan,
        status: initialStatus,
        totalHarga
      });

      // 4. Masukkan item pesanan, kurangi stok, dan catat log mutasi stok penjualan (operator dikosongkan)
      for (const item of verifiedItems) {
        await orderRepository.insertOrderItem(conn, {
          orderId,
          productId: item.product_id,
          jumlah: item.jumlah,
          totalHarga: item.total_harga
        });

        await orderRepository.decreaseProductStock(conn, item.product_id, item.jumlah);

        await orderRepository.insertStockLog(conn, {
          productId: item.product_id,
          userId: null, // Operator staf dikosongkan saat pengurangan stok dari penjualan
          orderId,      // Relasi langsung ke transaksi pesanan
          jumlah: item.jumlah,
          jenis: 'penjualan',
          tanggal: tanggalPesan
        });
      }

      // 6. Buat pembayaran
      const paymentStatus = (metodePembayaran === 'Tunai' || metodePembayaran === 'COD')
        ? 'Menunggu Pembayaran saat COD'
        : 'Menunggu Pembayaran';

      await orderRepository.insertPayment(conn, {
        orderId,
        metode: metodePembayaran,
        totalHarga,
        status: paymentStatus,
        tanggalBayar: tanggalPesan
      });

      // 7. Buat invoice resmi
      const invoiceId = await orderRepository.insertInvoice(conn, {
        orderId,
        tanggalCetak: tanggalPesan,
        totalHarga
      });

      await conn.commit();

      const invoiceNumber = `INV-KETSAI-${String(orderId).padStart(5, '0')}`;

      // 8. Buat sesi transaksi Midtrans Snap
      let snapToken = null;
      let snapRedirectUrl = null;
      let midtransOrderId = null;

      try {
        const snapRes = await midtransService.createSnapTransaction({
          orderId,
          totalHarga,
          customer: {
            nama: namaCustomer.trim(),
            noHp: noHp.trim(),
            alamat: alamat.trim()
          },
          items: verifiedItems
        });
        snapToken = snapRes.token;
        snapRedirectUrl = snapRes.redirectUrl;
        midtransOrderId = snapRes.midtransOrderId;
      } catch (snapErr) {
        console.warn('[Midtrans] Gagal membuat Snap Token Midtrans:', snapErr.message);
      }

      return {
        order_id: orderId,
        orderId,
        invoice_id: invoiceId,
        invoiceId,
        invoice_number: invoiceNumber,
        invoiceNumber,
        tanggal: tanggalPesan.toISOString(),
        customer: {
          nama: namaCustomer.trim(),
          no_hp: noHp.trim(),
          alamat: alamat.trim()
        },
        metode_pembayaran: metodePembayaran,
        status_pesanan: initialStatus,
        status_pembayaran: paymentStatus,
        total_harga: totalHarga,
        totalHarga,
        snap_token: snapToken,
        snapToken,
        snap_redirect_url: snapRedirectUrl,
        snapRedirectUrl,
        midtrans_order_id: midtransOrderId,
        items: verifiedItems
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async getAllOrders(filters) {
    return await orderRepository.findAllOrders(filters);
  }

  async getOrderById(id) {
    const order = await orderRepository.findOrderById(id);
    if (!order) {
      throw new NotFoundError(`Pesanan ID ${id} tidak ditemukan`);
    }

    const items = await orderRepository.findOrderItems(id);
    order.items = items;
    order.invoice_number = `INV-KETSAI-${String(order.id).padStart(5, '0')}`;
    order.invoiceNumber = order.invoice_number;
    return order;
  }

  async updateStatus(id, status, staffId = null) {
    const validStatuses = Object.values(ORDER_STATUS || orderStatus);
    if (!status || !validStatuses.includes(status)) {
      throw new BadRequestError(`Status tidak valid. Pilihan status yang tersedia: ${validStatuses.join(', ')}`);
    }

    const existing = await orderRepository.findOrderById(id);
    if (!existing) {
      throw new NotFoundError(`Pesanan ID ${id} tidak ditemukan`);
    }

    await orderRepository.updateOrderStatus(id, status, staffId);

    const completedStatus = (orderStatus && orderStatus.completed) || ORDER_STATUS.COMPLETED || 'Selesai';
    if (status === completedStatus) {
      await orderRepository.updatePaymentStatusByOrderId(id, 'Lunas');
    }

    const updated = await orderRepository.findOrderById(id);

    return {
      orderId: Number(id),
      order_id: Number(id),
      status,
      user_id: updated?.user_id || null,
      staff_nama: updated?.staff_nama || null
    };
  }

  async findUserIdByName(name) {
    return await orderRepository.findUserIdByName(name);
  }

  async processMidtransWebhook(payload = {}) {
    const {
      order_id: midtransOrderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      payment_type: paymentType
    } = payload;

    // 1. Validasi keaslian payload dari Midtrans melalui SHA512 Signature Key
    const isValidSignature = midtransService.verifySignature({
      orderId: midtransOrderId,
      statusCode,
      grossAmount,
      signatureKey
    });

    if (!isValidSignature) {
      throw new BadRequestError('Signature key Midtrans tidak valid');
    }

    // 2. Ekstrak internal order_id (format: KETSAI-{orderId}-{timestamp})
    const match = String(midtransOrderId).match(/^KETSAI-(\d+)-/);
    const orderId = match ? Number(match[1]) : null;

    if (!orderId) {
      throw new BadRequestError(`Format order_id Midtrans tidak valid: ${midtransOrderId}`);
    }

    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw new NotFoundError(`Pesanan ID ${orderId} tidak ditemukan`);
    }

    // 3. Petakan status transaksi Midtrans ke status internal sistem Ketsai
    const { paymentStatus, orderStatus: newOrderStatus } = midtransService.mapTransactionStatus(
      transactionStatus,
      fraudStatus
    );

    // 4. Update status pesanan dan status pembayaran
    await orderRepository.updateOrderStatus(orderId, newOrderStatus);
    await orderRepository.updatePaymentStatusByOrderId(orderId, paymentStatus);

    if (paymentType) {
      const channelLabel = `Midtrans (${paymentType.toUpperCase()})`;
      await orderRepository.updatePaymentMethodByOrderId(orderId, channelLabel);
    }

    return {
      orderId,
      orderStatus: newOrderStatus,
      paymentStatus,
      transactionStatus,
      paymentType
    };
  }

  async updatePaymentDetails(orderId, { metode, status, paymentType } = {}) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw new NotFoundError(`Pesanan ID ${orderId} tidak ditemukan`);
    }

    const finalMetode = metode || (paymentType ? `Midtrans (${paymentType.toUpperCase()})` : null);
    if (finalMetode) {
      await orderRepository.updatePaymentMethodByOrderId(orderId, finalMetode);
    }

    if (status) {
      await orderRepository.updatePaymentStatusByOrderId(orderId, status);
      if (status === 'Lunas') {
        await orderRepository.updateOrderStatus(orderId, 'Diproses');
      }
    }

    return {
      orderId: Number(orderId),
      metode: finalMetode || order.metode_pembayaran,
      status: status || order.status_pembayaran
    };
  }

  async checkOrderPaymentStatus(orderId) {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new NotFoundError(`Pesanan ID ${orderId} tidak ditemukan`);
    }

    if (order.status_pembayaran === 'Lunas') {
      return order;
    }

    // Periksa status ke Midtrans API
    const candidates = [
      order.midtrans_order_id,
      `KETSAI-${orderId}`,
      String(orderId)
    ].filter(Boolean);

    let statusResponse = null;
    for (const cand of candidates) {
      statusResponse = await midtransService.getTransactionStatus(cand);
      if (statusResponse && statusResponse.transaction_status) {
        break;
      }
    }

    if (statusResponse && statusResponse.transaction_status) {
      const { transaction_status, fraud_status, payment_type } = statusResponse;
      const { paymentStatus } = midtransService.mapTransactionStatus(
        transaction_status,
        fraud_status
      );

      if (paymentStatus === 'Lunas') {
        await orderRepository.updatePaymentStatusByOrderId(orderId, 'Lunas');
        await orderRepository.updateOrderStatus(orderId, 'Diproses');
      } else if (paymentStatus) {
        await orderRepository.updatePaymentStatusByOrderId(orderId, paymentStatus);
      }

      if (payment_type) {
        const channelLabel = `Midtrans (${payment_type.toUpperCase()})`;
        await orderRepository.updatePaymentMethodByOrderId(orderId, channelLabel);
      }
    }

    return await this.getOrderById(orderId);
  }
}

module.exports = new OrderService();

