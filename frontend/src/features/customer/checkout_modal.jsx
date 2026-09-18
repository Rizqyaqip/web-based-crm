import { useState } from 'react';
import { X, ShieldCheck, QrCode, CreditCard, Wallet, Loader2, Sparkles } from 'lucide-react';
import { useCart } from '../../context/cart_context';
import { createOrder, updateOrderPayment, formatMidtransPaymentMethod, formatIDR } from '../../services/api';
import { Logo } from '../../components';

export function CheckoutModal({ setPage }) {
  const {
    cartItems,
    totalPrice,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    recordCheckoutSuccess
  } = useCart();

  const [formData, setFormData] = useState({
    nama_customer: '',
    no_hp: '',
    alamat: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCheckoutModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nama_customer.trim() || !formData.no_hp.trim() || !formData.alamat.trim()) {
      setErrorMsg('Harap lengkapi semua data diri pengiriman.');
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        nama_customer: formData.nama_customer.trim(),
        no_hp: formData.no_hp.trim(),
        alamat: formData.alamat.trim(),
        metode_pembayaran: 'Midtrans Snap',
        items: cartItems.map((item) => ({
          product_id: item.id,
          jumlah: item.quantity
        }))
      };

      const res = await createOrder(payload);

      if (res.success && res.data) {
        const orderData = res.data;
        const snapToken = orderData.snap_token || orderData.snapToken;

        if (snapToken && typeof window !== 'undefined' && window.snap) {
          // Buka popup resmi Midtrans Snap
          window.snap.pay(snapToken, {
            onSuccess: (result) => {
              const resolvedMethod = formatMidtransPaymentMethod(result);
              const targetOrderId = orderData.order_id || orderData.id || orderData.orderId;
              try {
                updateOrderPayment(targetOrderId, { metode: resolvedMethod, status: 'Lunas' });
              } catch (e) {
                console.warn('Gagal sinkron status pembayaran:', e);
              }
              recordCheckoutSuccess({
                ...orderData,
                payment_result: result,
                metode_pembayaran: resolvedMethod,
                status_pembayaran: 'Lunas'
              });
              setIsCheckoutModalOpen(false);
              setPage('checkout-success');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onPending: (result) => {
              const resolvedMethod = formatMidtransPaymentMethod(result);
              const targetOrderId = orderData.order_id || orderData.id || orderData.orderId;
              try {
                updateOrderPayment(targetOrderId, { metode: resolvedMethod, status: 'Menunggu Pembayaran' });
              } catch (e) {
                console.warn('Gagal sinkron status pembayaran:', e);
              }
              recordCheckoutSuccess({
                ...orderData,
                payment_result: result,
                metode_pembayaran: resolvedMethod,
                status_pembayaran: 'Menunggu Pembayaran'
              });
              setIsCheckoutModalOpen(false);
              setPage('checkout-success');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onError: (result) => {
              const resolvedMethod = formatMidtransPaymentMethod(result);
              recordCheckoutSuccess({
                ...orderData,
                payment_result: result,
                metode_pembayaran: resolvedMethod,
                status_pembayaran: 'Gagal'
              });
              setIsCheckoutModalOpen(false);
              setPage('checkout-success');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onClose: () => {
              // Jika popup ditutup sebelum pembayaran selesai, arahkan tetap ke invoice
              recordCheckoutSuccess(orderData);
              setIsCheckoutModalOpen(false);
              setPage('checkout-success');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          });
        } else {
          // Fallback jika snap script belum terload
          recordCheckoutSuccess(orderData);
          setIsCheckoutModalOpen(false);
          setPage('checkout-success');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses pesanan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backgroundColor: 'rgba(43, 42, 40, 0.55)',
      backdropFilter: 'blur(6px)'
    }}>
      <div 
        onClick={() => !isLoading && setIsCheckoutModalOpen(false)}
        style={{ position: 'absolute', inset: 0 }}
      />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '92vh',
        overflowY: 'auto',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-modal)',
        border: '1px solid var(--border-card)',
        zIndex: 121
      }}>
        {/* Header Modal */}
        <div style={{
          padding: 'clamp(14px, 3vw, 20px) clamp(16px, 4vw, 24px)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <Logo height="24px" style={{ borderRadius: '3px' }} />
              <span className="hanko-stamp">CHECKOUT</span>
            </div>
            <h3 style={{ fontSize: '17px', margin: 0, fontWeight: 700 }}>
              Pengisian Informasi Pengantaran
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Isi data diri yang diperlukan untuk proses pengantaran
            </p>
          </div>

          <button
            onClick={() => !isLoading && setIsCheckoutModalOpen(false)}
            disabled={isLoading}
            style={{ color: 'var(--text-muted)', padding: '6px', cursor: 'pointer', background: 'none', border: 'none' }}
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 'clamp(16px, 4vw, 24px)' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: 'var(--status-danger-bg)',
              color: 'var(--status-danger-text)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              marginBottom: '18px',
              border: '1px solid rgba(176, 58, 46, 0.2)'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Section: Data Diri */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
            <div>
              <label className="zen-label">Nama Lengkap Penerima *</label>
              <input
                type="text"
                className="zen-input"
                placeholder="Contoh: Budi Santoso"
                value={formData.nama_customer}
                onChange={(e) => setFormData({ ...formData, nama_customer: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="zen-label">Nomor WhatsApp / Telepon Aktif *</label>
              <input
                type="tel"
                className="zen-input"
                placeholder="Contoh: 081234567890"
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="zen-label">Alamat Lengkap Pengiriman *</label>
              <textarea
                className="zen-input"
                rows={3}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota/kabupaten"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                required
                disabled={isLoading}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Section: Midtrans Information Badge */}
          <div style={{
            marginBottom: '22px',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--accent-vermilion-light)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <ShieldCheck size={18} color="var(--accent-vermilion)" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Pembayaran 
              </span>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Pilihan metode pembayaran (QRIS, Virtual Account Bank, E-Wallet, dan Kartu) akan muncul di layar setelah Anda menekan tombol konfirmasi.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                <QrCode size={14} color="var(--accent-vermilion)" />
                <span>QRIS All Bank</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                <CreditCard size={14} color="var(--accent-vermilion)" />
                <span>Virtual Account</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                <Wallet size={14} color="var(--accent-vermilion)" />
                <span>E-Wallet & Card</span>
              </div>
            </div>
          </div>

          {/* Ringkasan Biaya */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '22px',
            border: '1px solid var(--border-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span>Jumlah Item ({cartItems.length} menu)</span>
              <span>{formatIDR(totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700 }}>
              <span>Total Tagihan</span>
              <span style={{ color: 'var(--accent-vermilion)', fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                {formatIDR(totalPrice)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="zen-btn-primary"
            style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Menghubungkan...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Konfirmasi & Pilih Metode Pembayaran</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
