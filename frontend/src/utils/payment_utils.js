// Utility to resolve and format payment methods returned by Midtrans Snap

export function formatMidtransPaymentMethod(orderOrResult) {
  if (!orderOrResult) return 'Midtrans';

  const result = orderOrResult.payment_result || orderOrResult;
  const paymentType = result.payment_type || result.paymentType;

  if (paymentType) {
    const type = String(paymentType).toLowerCase();
    if (type === 'qris') {
      return 'QRIS';
    }
    if (type === 'bank_transfer') {
      const bank = result.va_numbers?.[0]?.bank || result.bank || '';
      return bank ? `Transfer Virtual Account (${bank.toUpperCase()})` : 'Transfer Virtual Account';
    }
    if (type === 'echannel') {
      return 'Mandiri Bill Payment (Virtual Account)';
    }
    if (type === 'gopay') {
      return 'GoPay';
    }
    if (type === 'shopeepay') {
      return 'ShopeePay';
    }
    if (type === 'credit_card') {
      const bank = result.bank ? ` (${result.bank.toUpperCase()})` : '';
      return `Kartu Kredit${bank}`;
    }
    if (type === 'cstore') {
      const store = result.store ? ` (${result.store.toUpperCase()})` : '';
      return `Gerai Retail${store}`;
    }
    if (type === 'akulaku') {
      return 'Akulaku PayLater';
    }
    if (type === 'kredivo') {
      return 'Kredivo';
    }
    return paymentType.toUpperCase();
  }

  const rawMethod = orderOrResult.metode_pembayaran || orderOrResult.metode || '';
  if (rawMethod) {
    const match = rawMethod.match(/Midtrans \((.+)\)/i);
    if (match && match[1]) {
      const channel = match[1].toLowerCase();
      if (channel === 'qris') return 'QRIS';
      if (channel === 'bank_transfer') return 'Transfer Virtual Account';
      if (channel === 'echannel') return 'Mandiri Bill Payment';
      if (channel === 'gopay') return 'GoPay';
      if (channel === 'shopeepay') return 'ShopeePay';
      return match[1].toUpperCase();
    }
    if (rawMethod === 'Midtrans Snap' || rawMethod === 'Midtrans') {
      return 'Midtrans';
    }
    return rawMethod;
  }

  return 'Midtrans';
}

