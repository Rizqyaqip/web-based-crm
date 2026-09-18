// Global application constants for Ketsai UMKM Web App

export const APP_NAME = 'KETSAI';
export const APP_TAGLINE = 'Artisanal Delicacies & Frozen Treats';
export const APP_PHILOSOPHY = '一期一会 ICHIGO ICHIE';

export const PAYMENT_METHODS = [
  { id: 'QRIS', label: 'QRIS (Semua Bank & E-Wallet)', iconName: 'QrCode' },
  { id: 'Transfer BCA', label: 'Transfer Virtual Bank BCA', iconName: 'CreditCard' },
  { id: 'GoPay / OVO', label: 'E-Wallet (GoPay / OVO / ShopeePay)', iconName: 'Wallet' },
  { id: 'COD / Tunai', label: 'Bayar di Tempat (COD / Tunai)', iconName: 'Banknote' }
];

export const ORDER_STATUSES = [
  'Semua',
  'Pending',
  'Diproses',
  'Dikirim',
  'Selesai',
  'Dibatalkan'
];
