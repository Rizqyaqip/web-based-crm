import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Utensils, HeartHandshake, ShieldCheck, ChevronRight, RefreshCw, Flame, ShoppingBag } from 'lucide-react';
import { getBestSellers, formatIDR } from '../../services/api';
import { useCart } from '../../context/cart_context';

export function LandingPage({ setPage }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function loadBestSellers() {
      try {
        setLoading(true);
        const res = await getBestSellers(6, { signal: controller.signal });
        if (res.success && res.data) {
          setBestSellers(res.data);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Gagal memuat produk terlaris dari database:', err);
        }
      } finally {
        setLoading(false);
      }
    }
    loadBestSellers();
    return () => controller.abort();
  }, []);

  const topProduct = bestSellers.length > 0 ? bestSellers[0] : null;

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 24px) clamp(48px, 6vw, 80px)',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(32px, 5vw, 48px)',
          alignItems: 'center'
        }}>
          {/* Hero Left Content */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              lineHeight: 1.18,
              marginBottom: '20px',
              fontWeight: 800
            }}>
              A Song Of <br />
              <span style={{ color: 'var(--accent-vermilion)' }}>Ice And Fire</span>.
            </h1>

            <p style={{
              fontSize: '15px',
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
              marginBottom: '28px',
              maxWidth: '480px'
            }}>
              Ketsai menghadirkan aneka menu mulai dari olahan original Ketsai, aneka Frozen Food, hingga kesegaran es krim. Nikmati kemudahan pesan langsung tanpa ribet
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button
                onClick={() => { setPage('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="zen-btn-primary"
                style={{ padding: '12px 26px', fontSize: '14px' }}
              >
                <span>Jelajahi Produk</span>
                <ArrowRight size={17} />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('story-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="zen-btn-secondary"
                style={{ padding: '12px 20px', fontSize: '14px' }}
              >
                <span>Filosofi Kami</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '18px',
              marginTop: '36px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                  100% Halal
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bahan Higienis & Aman</span>
              </div>
              <div className="hide-on-mobile" style={{ width: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                  Fresh Daily
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Dikemas Dengan Teliti</span>
              </div>
              <div className="hide-on-mobile" style={{ width: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                  Fast Checkout
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tanpa Perlu Login</span>
              </div>
            </div>
          </div>

          {/* Hero Right Media - Real Dynamic Top Product from Database */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '2px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-card)',
              minHeight: '280px'
            }}>
              {topProduct ? (
                <>
                  {(() => {
                    const isTopKetsai = topProduct.kategori?.toLowerCase().includes('ketsai') || topProduct.gambar?.includes('ketsaiOriginal');
                    return (
                      <div style={{
                        width: '100%',
                        height: 'clamp(280px, 42vw, 420px)',
                        backgroundColor: isTopKetsai ? 'var(--bg-card)' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={topProduct.gambar}
                          alt={topProduct.nama_produk}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: isTopKetsai ? 'cover' : 'contain',
                            objectPosition: 'center',
                            padding: isTopKetsai ? 0 : '16px',
                            display: 'block'
                          }}
                          onError={(e) => {
                            if (!e.currentTarget.src.includes('/src/assets')) {
                              e.currentTarget.src = `/src${topProduct.gambar}`;
                            }
                          }}
                        />
                      </div>
                    );
                  })()}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '24px',
                    background: 'linear-gradient(to top, rgba(43,42,40,0.92) 0%, rgba(43,42,40,0.6) 70%, rgba(43,42,40,0) 100%)',
                    color: '#ffffff'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#f6f1e6',
                      backgroundColor: 'rgba(176, 58, 46, 0.85)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      marginBottom: '6px'
                    }}>
                      <Flame size={12} />
                      {topProduct.total_terjual > 0
                        ? `TERLARIS #1`
                        : 'MENU UNGGULAN KETSAI'}
                    </span>
                    <h3 style={{ color: '#fff', fontSize: '22px', margin: '4px 0' }}>
                      {topProduct.nama_produk}
                    </h3>
                    {topProduct.deskripsi && (
                      <p style={{ color: '#e5ddcd', fontSize: '12px', margin: '4px 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {topProduct.deskripsi}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div>
                        <span style={{ color: '#e5ddcd', fontSize: '13px', display: 'block', textTransform: 'capitalize' }}>
                          {topProduct.kategori}
                        </span>
                        <strong style={{ color: '#fff', fontSize: '18px', fontFamily: 'var(--font-serif)' }}>
                          {formatIDR(topProduct.harga)}
                        </strong>
                      </div>
                      <button
                        onClick={() => {
                          addToCart(topProduct, 1);
                          setIsCartOpen(true);
                        }}
                        className="zen-btn-primary"
                        style={{ padding: '8px 18px', fontSize: '13px' }}
                      >
                        + Pesan Menu Ini
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={28} className="animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE DISHES / BEST SELLERS - 100% REAL FROM DATABASE */}
      <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 24px)', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '36px',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '28px', marginTop: '6px' }}>
              Best Seller
            </h2>
            <p style={{ fontSize: '14px', margin: 0 }}>
              All time best seller from ketsai
            </p>
          </div>

          <button
            onClick={() => { setPage('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-vermilion)',
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            <span>Buka Semua Menu</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Best Sellers Grid - Real Data */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px' }}>Memuat data menu terfavorit dari database...</p>
          </div>
        ) : bestSellers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p>Belum ada data menu tersedia di database.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: '24px'
          }}>
            {bestSellers.map((item, index) => {
              const stockAvailable = Number(item.jumlah_stok !== undefined ? item.jumlah_stok : item.jumlahStok) || 0;
              const isOutOfStock = stockAvailable <= 0;

              const isItemKetsai = item.kategori?.toLowerCase().includes('ketsai') || item.gambar?.includes('ketsaiOriginal');

              return (
                <div
                  key={item.id}
                  className="zen-card"
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{
                    position: 'relative',
                    height: '210px',
                    overflow: 'hidden',
                    backgroundColor: isItemKetsai ? 'var(--bg-card)' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}>
                    <img
                      src={item.gambar}
                      alt={item.nama_produk}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: isItemKetsai ? 'cover' : 'contain',
                        objectPosition: 'center',
                        padding: isItemKetsai ? 0 : '10px',
                        display: 'block',
                        transition: 'transform 0.4s ease'
                      }}
                      onMouseOver={(e) => {
                        if (isItemKetsai) e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseOut={(e) => {
                        if (isItemKetsai) e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onError={(e) => {
                        if (!e.currentTarget.src.includes('/src/assets')) {
                          e.currentTarget.src = `/src${item.gambar}`;
                        }
                      }}
                    />

                    {/* Category Chip */}
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(246, 241, 230, 0.95)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textTransform: 'capitalize',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {item.kategori}
                    </span>

                    {/* Sales Badge */}
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: item.total_terjual > 0 ? 'var(--accent-vermilion)' : 'rgba(43, 42, 40, 0.75)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {item.total_terjual > 0 ? (
                        <>
                          <Flame size={12} />
                          Terjual {item.total_terjual}x
                        </>
                      ) : (
                        `#${index + 1}`
                      )}
                    </span>
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>{item.nama_produk}</h3>

                    {item.deskripsi && (
                      <p style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        marginBottom: '12px',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.deskripsi}
                      </p>
                    )}

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      {isOutOfStock ? (
                        <span style={{ color: 'var(--accent-vermilion)', fontWeight: 600 }}>Stok Habis</span>
                      ) : (
                        <span>Stok tersedia: <strong>{stockAvailable}</strong> porsi</span>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-card)',
                      marginTop: 'auto'
                    }}>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: 'var(--accent-vermilion)',
                        fontFamily: 'var(--font-serif)'
                      }}>
                        {formatIDR(item.harga)}
                      </span>

                      <button
                        onClick={() => addToCart(item, 1)}
                        disabled={isOutOfStock}
                        className="zen-btn-primary"
                        style={{
                          padding: '8px 16px',
                          fontSize: '13px',
                          opacity: isOutOfStock ? 0.5 : 1,
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isOutOfStock ? 'Habis' : '+ Tambah'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. PHILOSOPHY & VALUES SECTION */}
      <section id="story-section" style={{
        backgroundColor: 'var(--bg-card)',
        padding: 'clamp(44px, 6vw, 72px) clamp(16px, 4vw, 24px)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span className="hanko-stamp">MOTTO</span>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 30px)', margin: '8px 0 12px' }}>
              For Such as Hold True Relish Dear.
            </h2>
            <p style={{ fontSize: '14px' }}>
              Kami percaya bahwa makanan lezat bermula dari rasa hormat terhadap bahan alami dan ketulusan hati saat meraciknya.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '24px'
          }}>
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-vermilion-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Utensils size={22} color="var(--accent-vermilion)" />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Authentic</h3>
              <p style={{ fontSize: '13px', lineHeight: 1.7 }}>
                Dibuat mengikuti resep original yang diturunkan dari generasi ke generasi.
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--status-success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <ShieldCheck size={22} color="var(--status-success-text)" />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Hygiene</h3>
              <p style={{ fontSize: '13px', lineHeight: 1.7 }}>
                Dipersiapkan segar dengan standar kebersihan ketat dan kemasan aman siap saji.
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--status-info-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <HeartHandshake size={22} color="var(--status-info-text)" />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Sincerity</h3>
              <p style={{ fontSize: '13px', lineHeight: 1.7 }}>
                Dukungan pemesanan cepat tanpa kewajiban mendaftar dan pengantaran tepat waktu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAST CTA CALLOUT */}
      <section style={{ padding: 'clamp(36px, 5vw, 60px) clamp(16px, 4vw, 24px)', textAlign: 'center' }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: 'clamp(28px, 4vw, 44px) clamp(18px, 4vw, 32px)',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <span className="hanko-stamp" style={{ marginBottom: '10px' }}>PESAN SEKARANG</span>
          <h2 style={{ fontSize: '26px', margin: '10px 0 12px' }}>
            Stand’st Thou Ready to Braue the Day?
          </h2>
          <p style={{ fontSize: '14px', maxWidth: '460px', margin: '0 auto 24px' }}>
            Pilih menu favorit Anda dan nikmati proses checkout yang cepat, transparan, serta langsung menerbitkan invoice resmi.
          </p>
          <button
            onClick={() => { setPage('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="zen-btn-primary"
            style={{ padding: '13px 32px', fontSize: '15px' }}
          >
            <span>Ke Halaman Produk</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
