import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Printer,
  ShoppingBag,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  RefreshCw,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useCart } from '../../context/cart_context';
import { formatIDR, formatDate, formatMidtransPaymentMethod, updateOrderPayment, getOrderById, checkOrderPaymentStatus } from '../../services/api';
import { Logo } from '../../components';

export function InvoiceView({ setPage }) {
  const { latestOrder, recordCheckoutSuccess } = useCart();
  const [order, setOrder] = useState(latestOrder);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState(null);

  useEffect(() => {
    let currentOrder = order;
    if (!currentOrder) {
      try {
        const saved = sessionStorage.getItem('ketsai_last_order');
        if (saved) {
          currentOrder = JSON.parse(saved);
          setOrder(currentOrder);
        }
      } catch (err) {
        console.error('Gagal memuat cache pesanan:', err);
      }
    }

    const orderId = currentOrder?.order_id || currentOrder?.id || currentOrder?.orderId;
    if (!orderId) return;

    // Polling function untuk auto-update status pesanan secara real-time
    const syncLatestOrder = async () => {
      try {
        const res = await getOrderById(orderId);
        if (res.success && res.data) {
          setOrder((prev) => {
            const updated = {
              ...prev,
              ...res.data,
              items: (res.data.items && res.data.items.length > 0) ? res.data.items : (prev?.items || [])
            };
            try {
              sessionStorage.setItem('ketsai_last_order', JSON.stringify(updated));
            } catch {
              // ignore
            }
            return updated;
          });
        }
      } catch {
        // silent polling catch
      }
    };

    // Panggil segera saat halaman dimuat
    syncLatestOrder();

    // Auto-update berkala setiap 3.5 detik agar perubahan dari staf langsung tampil
    const intervalId = setInterval(syncLatestOrder, 3500);
    return () => clearInterval(intervalId);
  }, []);

  const handleCheckPaymentStatus = async () => {
    const orderId = order?.order_id || order?.id || order?.orderId;
    if (!orderId) return;
    try {
      setCheckingPayment(true);
      setCheckFeedback(null);
      const res = await checkOrderPaymentStatus(orderId);
      if (res.success && res.data) {
        const updated = {
          ...order,
          ...res.data,
          items: (res.data.items && res.data.items.length > 0) ? res.data.items : (order?.items || [])
        };
        setOrder(updated);
        recordCheckoutSuccess(updated);

        if (res.data.status_pembayaran === 'Lunas') {
          setCheckFeedback({ type: 'success', text: 'Pembayaran terkonfirmasi Lunas! Pesanan sedang diproses.' });
        } else {
          setCheckFeedback({ type: 'info', text: 'Status pembayaran belum terverifikasi lunas. Silakan selesaikan transaksi.' });
        }
      }
    } catch (err) {
      setCheckFeedback({ type: 'error', text: err.message || 'Gagal mengecek status pembayaran' });
    } finally {
      setCheckingPayment(false);
    }
  };

  const handlePayNow = () => {
    const snapToken = order?.snap_token || order?.snapToken;
    if (snapToken && typeof window !== 'undefined' && window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          const resolvedMethod = formatMidtransPaymentMethod(result);
          const targetOrderId = order?.order_id || order?.id || order?.orderId;
          try {
            updateOrderPayment(targetOrderId, { metode: resolvedMethod, status: 'Lunas' });
          } catch (e) {
            console.warn('Gagal update pembayaran di backend:', e);
          }
          const updated = {
            ...order,
            payment_result: result,
            metode_pembayaran: resolvedMethod,
            status_pembayaran: 'Lunas',
            status_pesanan: 'Diproses'
          };
          setOrder(updated);
          recordCheckoutSuccess(updated);
        },
        onPending: (result) => {
          const resolvedMethod = formatMidtransPaymentMethod(result);
          const targetOrderId = order?.order_id || order?.id || order?.orderId;
          try {
            updateOrderPayment(targetOrderId, { metode: resolvedMethod, status: 'Menunggu Pembayaran' });
          } catch (e) {
            console.warn('Gagal update pembayaran di backend:', e);
          }
          const updated = {
            ...order,
            payment_result: result,
            metode_pembayaran: resolvedMethod,
            status_pembayaran: 'Menunggu Pembayaran'
          };
          setOrder(updated);
          recordCheckoutSuccess(updated);
        },
        onError: () => {
          alert('Terjadi kesalahan atau pembayaran belum selesai. Silakan coba kembali.');
        }
      });
    } else if (order?.snap_redirect_url || order?.snapRedirectUrl) {
      window.open(order.snap_redirect_url || order.snapRedirectUrl, '_blank');
    } else {
      alert('Token Midtrans tidak tersedia. Silakan hubungi admin kasir.');
    }
  };

  if (!order) {
    return (
      <div className="zen-container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '460px',
          margin: '0 auto',
          padding: '36px 24px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <ShoppingBag size={44} color="var(--accent-vermilion)" style={{ margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            Belum Ada Data Pesanan
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Anda belum melakukan pemesanan apapun atau sesi invoice telah berakhir.
          </p>
          <button
            onClick={() => setPage('catalog')}
            className="zen-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
          >
            <ShoppingBag size={16} />
            <span>Mulai Pesan Menu</span>
          </button>
        </div>
      </div>
    );
  }

  const isPaid = order.status_pembayaran === 'Lunas';
  const isFailed = order.status_pembayaran === 'Gagal';
  const items = order.items || [];
  const displayPaymentMethod = formatMidtransPaymentMethod(order);

  const generateWhatsAppUrl = () => {
    if (!order) return '#';
    const invoiceNum = order.invoice_number || order.invoiceNumber || `INV-KETSAI-${order.order_id || order.id}`;
    const custName = order.customer?.nama || order.nama_customer || '-';
    const custPhone = order.customer?.no_hp || order.no_hp || '-';
    const custAddress = order.customer?.alamat || order.alamat || '-';
    const paymentMethod = displayPaymentMethod;
    const totalAmount = formatIDR(order.total_harga || order.totalHarga || 0);

    let itemsList = '';
    if (Array.isArray(order.items) && order.items.length > 0) {
      itemsList = order.items
        .map(
          (itm) =>
            `• ${itm.jumlah || itm.quantity}x ${itm.nama_produk || itm.namaProduk} (${formatIDR(
              (itm.harga || 0) * (itm.jumlah || itm.quantity || 1)
            )})`
        )
        .join('\n');
    }

    const message = [
      'Haloo, saya ingin konfirmasi pesanan saya yang telah lunas:',
      '',
      `*No. Invoice:* ${invoiceNum}`,
      `*Nama:* ${custName}`,
      `*No. WhatsApp:* ${custPhone}`,
      `*Alamat Pengiriman:* ${custAddress}`,
      `*Metode Pembayaran:* ${paymentMethod}`,
      `*Status:* Lunas`,
      '',
      '*Rincian Pesanan:*',
      itemsList || '- (Data menu tidak tersedia)',
      '',
      `*Total Tagihan:* ${totalAmount}`,
      '',
      'Mohon segera diproses ya, terima kasih!'
    ].join('\n');

    return `https://wa.me/6285117354040?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="zen-container" style={{ padding: '24px 16px 48px' }}>
      {/* Top Bar Actions (Hidden on Print) */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '680px',
        margin: '0 auto 16px'
      }}>
        <button
          onClick={() => setPage('catalog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Menu</span>
        </button>

        <button
          onClick={() => window.print()}
          className="zen-btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '13px' }}
        >
          <Printer size={15} />
          <span>Cetak Bukti</span>
        </button>
      </div>

      {/* Invoice Card Container (With id="printable-invoice" for single page printing) */}
      <div
        id="printable-invoice"
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        {/* Header Invoice */}
        <div style={{
          padding: 'clamp(14px, 3vw, 20px) clamp(16px, 4vw, 24px)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Logo height="28px" style={{ borderRadius: '3px' }} />
              <span className="hanko-stamp">INVOICE</span>
            </div>
            <h1 style={{ fontSize: '19px', fontWeight: 700, margin: '2px 0' }}>
              {order.invoice_number || order.invoiceNumber || `INV-KETSAI-${order.order_id || order.id}`}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Tanggal: {formatDate(order.tanggal || new Date())}
            </p>
          </div>

          {/* Status Badge */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: isPaid ? 'rgba(46, 125, 50, 0.12)' : isFailed ? 'rgba(198, 40, 40, 0.12)' : 'rgba(239, 108, 0, 0.12)',
              color: isPaid ? '#2e7d32' : isFailed ? '#c62828' : '#ef6c00',
              border: `1px solid ${isPaid ? '#2e7d32' : isFailed ? '#c62828' : '#ef6c00'}`
            }}>
              {isPaid ? <CheckCircle2 size={14} /> : isFailed ? <AlertCircle size={14} /> : <Clock size={14} />}
              <span>{order.status_pembayaran || 'Menunggu Pembayaran'}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Status Pesanan: <strong>{isPaid ? (order.status === 'Pending' ? 'Diproses' : (order.status || 'Diproses')) : (order.status || 'Pending')}</strong>
            </div>
          </div>
        </div>

        {/* Informasi Pelanggan & Pengiriman */}
        <div style={{
          padding: 'clamp(14px, 3vw, 18px) clamp(16px, 4vw, 24px)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '16px',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
              Tujuan Pengiriman
            </span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px' }}>
              {order.customer?.nama || order.nama_customer || '-'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              WhatsApp: {order.customer?.no_hp || order.no_hp || '-'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
              {order.customer?.alamat || order.alamat || '-'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
              Metode Pembayaran
            </span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={15} color="var(--accent-vermilion)" />
              <span>{displayPaymentMethod}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
              Staf Pengelola
            </span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {order.staff_nama ? (
                <>
                  <UserCheck size={16} color="#2e7d32" />
                  <span style={{ color: '#2e7d32' }}>{order.staff_nama}</span>
                </>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 500 }}>
                  Menunggu penugasan staf
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rincian Menu Pesanan */}
        <div style={{ padding: '16px 24px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Rincian Hidangan
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item, idx) => {
              const itemTotal = (item.harga || 0) * (item.jumlah || item.quantity || 1);
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--accent-vermilion-light)',
                      color: 'var(--accent-vermilion)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {item.jumlah || item.quantity}x
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>
                        {item.nama_produk || item.namaProduk}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        @{formatIDR(item.harga || 0)}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
                    {formatIDR(itemTotal)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kalkulasi Total Tagihan */}
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              Total Tagihan Pembayaran
            </span>
            <span style={{
              fontSize: '18px',
              fontWeight: 800,
              fontFamily: 'var(--font-serif)',
              color: 'var(--accent-vermilion)'
            }}>
              {formatIDR(order.total_harga || order.totalHarga || 0)}
            </span>
          </div>

          {/* Banner Aksi Pembayaran Midtrans jika belum lunas (Hidden on Print) */}
          {!isPaid && (
            <div className="no-print" style={{
              marginTop: '18px',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 108, 0, 0.06)',
              border: '1.5px solid rgba(239, 108, 0, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                <ShieldCheck size={20} color="#ef6c00" />
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#ef6c00' }}>
                  Melengkapi Pembayaran yang Belum Selesai
                </h4>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.5 }}>
                Pesanan Anda telah tercatat dengan aman. Silakan selesaikan pembayaran melalui Midtrans atau verifikasi status pembayaran:
              </p>

              {checkFeedback && (
                <div style={{
                  maxWidth: '480px',
                  margin: '0 auto 14px',
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: checkFeedback.type === 'success' ? 'rgba(46, 125, 50, 0.12)' : 'rgba(239, 108, 0, 0.12)',
                  color: checkFeedback.type === 'success' ? '#2e7d32' : '#ef6c00',
                  border: `1px solid ${checkFeedback.type === 'success' ? 'rgba(46, 125, 50, 0.3)' : 'rgba(239, 108, 0, 0.3)'}`
                }}>
                  {checkFeedback.text}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  onClick={handlePayNow}
                  className="zen-btn-primary"
                  style={{
                    padding: '9px 20px',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CreditCard size={15} />
                  <span>Bayar Sekarang via Midtrans</span>
                  <ExternalLink size={13} />
                </button>

                <button
                  onClick={handleCheckPaymentStatus}
                  disabled={checkingPayment}
                  className="zen-btn-secondary"
                  style={{
                    padding: '9px 18px',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: checkingPayment ? 'not-allowed' : 'pointer'
                  }}
                >
                  <RefreshCw size={14} className={checkingPayment ? 'animate-spin' : ''} />
                  <span>{checkingPayment ? 'Memeriksa...' : 'Cek Status Pembayaran'}</span>
                </button>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef6c00', display: 'inline-block' }} />
                <span>Halaman invoice memantau status pesanan secara otomatis</span>
              </div>
            </div>
          )}

          {isPaid && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
                border: '1px solid rgba(46, 125, 50, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={20} color="#2e7d32" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#2e7d32' }}>
                    Pembayaran Terkonfirmasi Lunas
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Dapur Ketsai sedang menyiapkan pesanan Anda dengan higienis dan cermat.
                  </div>
                </div>
              </div>

              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="no-print"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  padding: '11px 18px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '13px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <MessageCircle size={18} />
                <span>Konfirmasi Pesanan ke WhatsApp (+62 851-1735-4040)</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoiceView;
