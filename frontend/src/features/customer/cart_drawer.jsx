import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/cart_context';
import { formatIDR } from '../../services/api';
import { Logo } from '../../components';

export function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalPrice,
    totalItems,
    setIsCheckoutModalOpen
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(43, 42, 40, 0.45)',
      backdropFilter: 'blur(4px)',
      transition: 'all 0.3s ease'
    }}>
      {/* Backdrop click to close */}
      <div 
        onClick={() => setIsCartOpen(false)}
        style={{ position: 'absolute', inset: 0 }} 
      />

      {/* Drawer content */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        height: '100%',
        backgroundColor: 'var(--bg-primary)',
        boxShadow: 'var(--shadow-modal)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 101,
        borderLeft: '1px solid var(--border-subtle)'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: 'clamp(14px, 3vw, 20px) clamp(16px, 4vw, 24px)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo height="24px" style={{ borderRadius: '3px' }} />
            <h3 style={{ fontSize: '16px', margin: 0, fontWeight: 700 }}>
              Keranjang Pesanan ({totalItems})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              transition: 'background 0.15s',
              cursor: 'pointer'
            }}
            aria-label="Tutup keranjang"
          >
            <X size={20} />
          </button>
        </div>

        {/* Item List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'clamp(16px, 3vw, 20px) clamp(14px, 4vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {cartItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)'
            }}>
              <ShoppingBag size={48} strokeWidth={1} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Keranjang masih kosong
              </p>
              <p style={{ fontSize: '13px', maxWidth: '240px', margin: '0 auto' }}>
                Pilih menu artisanal favorit Anda dari katalog untuk mulai memesan.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  backgroundColor: 'var(--bg-card)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-card)'
                }}
              >
                {/* Image */}
                {(() => {
                  const isCartKetsai = item.kategori?.toLowerCase().includes('ketsai') || item.gambar?.includes('ketsaiOriginal');
                  return (
                    <div style={{
                      width: '68px',
                      height: '68px',
                      backgroundColor: isCartKetsai ? 'var(--bg-card)' : '#ffffff',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <img
                        src={item.gambar || '/src/assets/ketsaiOriginal/dimsum.png'}
                        alt={item.nama_produk}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: isCartKetsai ? 'cover' : 'contain',
                          objectPosition: 'center',
                          padding: isCartKetsai ? 0 : '4px',
                          display: 'block'
                        }}
                        onError={(e) => {
                          if (!e.currentTarget.src.includes('/src/assets')) {
                            e.currentTarget.src = `/src${item.gambar}`;
                          }
                        }}
                      />
                    </div>
                  );
                })()}

                {/* Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px', lineHeight: 1.3 }}>
                      {item.nama_produk}
                    </h4>
                    <span style={{ fontSize: '13px', color: 'var(--accent-vermilion)', fontWeight: 700 }}>
                      {formatIDR(item.harga)}
                    </span>
                  </div>

                  {/* Quantity & Remove */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-subtle)',
                      padding: '2px 6px'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{ padding: '3px', color: 'var(--text-primary)' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: 700 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.quantity >= (item.jumlah_stok !== undefined ? item.jumlah_stok : item.jumlahStok)}
                        style={{ padding: '3px', color: item.quantity >= (item.jumlah_stok !== undefined ? item.jumlah_stok : item.jumlahStok) ? '#ccc' : 'var(--text-primary)' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ color: 'var(--text-muted)', padding: '4px', transition: 'color 0.15s' }}
                      title="Hapus dari keranjang"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal Produk:</span>
              <span style={{ fontWeight: 600 }}>{formatIDR(totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '16px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total Pembayaran:</span>
              <span style={{ fontWeight: 800, color: 'var(--accent-vermilion)', fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                {formatIDR(totalPrice)}
              </span>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutModalOpen(true);
              }}
              className="zen-btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              <span>Lanjut ke Checkout</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
