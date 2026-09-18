import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Search, Plus, Minus, AlertCircle, RefreshCw } from 'lucide-react';
import { getProducts, getProductCategories, formatIDR } from '../../services/api';
import { useCart } from '../../context/cart_context';
import { useDebounce } from '../../hooks';

// Kartu Produk Terisolasi (State Colocation & Memoized) agar pengubahan kuantitas tidak me-re-render seluruh katalog
const CatalogProductCard = memo(function CatalogProductCard({ product, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const isOutOfStock = product.jumlahStok <= 0;
  const isLowStock = product.jumlahStok > 0 && product.jumlahStok < 15;
  const isKetsaiOriginal =
    product.kategori?.toLowerCase().includes('ketsai') ||
    product.gambar?.includes('ketsaiOriginal');

  const handleMinus = () => setQty((prev) => Math.max(1, prev - 1));
  const handlePlus = () => setQty((prev) => Math.min(product.jumlahStok, prev + 1));
  const handleAdd = () => onAddToCart(product, qty);

  return (
    <div
      className="zen-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: isOutOfStock ? 0.75 : 1
      }}
    >
      {/* Gambar Produk */}
      <div
        style={{
          position: 'relative',
          height: '190px',
          overflow: 'hidden',
          backgroundColor: isKetsaiOriginal ? 'var(--bg-card)' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <img
          src={product.gambar || '/src/assets/ketsaiOriginal/dimsum.png'}
          alt={product.nama_produk}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: isKetsaiOriginal ? 'cover' : 'contain',
            objectPosition: 'center',
            padding: isKetsaiOriginal ? 0 : '8px',
            display: 'block',
            transition: 'transform 0.3s ease'
          }}
          onMouseOver={(e) => {
            if (isKetsaiOriginal) e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            if (isKetsaiOriginal) e.currentTarget.style.transform = 'scale(1)';
          }}
          onError={(e) => {
            if (!e.currentTarget.src.includes('/src/assets')) {
              e.currentTarget.src = `/src${product.gambar}`;
            }
          }}
        />

        {/* Badge Kategori */}
        <span
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(246, 241, 230, 0.95)',
            backdropFilter: 'blur(4px)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textTransform: 'capitalize',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {product.kategori}
        </span>

        {/* Badge Status Stok (< 15 atau habis) */}
        {(isOutOfStock || isLowStock) && (
          <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
            {isOutOfStock ? (
              <span className="badge-status badge-danger">Habis</span>
            ) : (
              <span className="badge-status badge-pending">Persediaan Menipis</span>
            )}
          </div>
        )}
      </div>

      {/* Informasi & Aksi */}
      <div
        style={{
          padding: '18px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '6px', lineHeight: 1.3 }}>
            {product.nama_produk}
          </h3>
          {product.deskripsi && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '10px',
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {product.deskripsi}
            </p>
          )}
          <p
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--accent-vermilion)',
              fontFamily: 'var(--font-serif)',
              margin: 0
            }}
          >
            {formatIDR(product.harga)}
          </p>
        </div>

        {/* Pengatur Kuantitas & Tombol Pesan */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isOutOfStock && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                padding: '2px 6px'
              }}
            >
              <button
                onClick={handleMinus}
                style={{ padding: '4px', color: 'var(--text-primary)', cursor: 'pointer' }}
                title="Kurangi"
              >
                <Minus size={13} />
              </button>
              <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: 700 }}>
                {qty}
              </span>
              <button
                onClick={handlePlus}
                disabled={qty >= product.jumlahStok}
                style={{
                  padding: '4px',
                  color: qty >= product.jumlahStok ? '#ccc' : 'var(--text-primary)',
                  cursor: qty >= product.jumlahStok ? 'not-allowed' : 'pointer'
                }}
                title="Tambah"
              >
                <Plus size={13} />
              </button>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="zen-btn-primary"
            style={{ flex: 1, padding: '9px 14px', fontSize: '13px' }}
          >
            <Plus size={15} />
            <span>{isOutOfStock ? 'Habis' : 'Pesan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

export function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(['Semua']);

  const { addToCart, totalItems, totalPrice, setIsCartOpen, setIsCheckoutModalOpen } = useCart();

  // Debounce search agar kalkulasi filter tidak memberatkan browser pada setiap keystroke
  const debouncedSearch = useDebounce(searchQuery, 250);

  const fetchProductList = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const [prodRes, catRes] = await Promise.all([
        getProducts({}, options),
        getProductCategories(options).catch(() => ({ success: false }))
      ]);

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      } else if (prodRes.success && prodRes.data) {
        setCategories(['Semua', ...Array.from(new Set(prodRes.data.map((p) => p.kategori).filter(Boolean)))]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Gagal memuat katalog menu.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProductList({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchProductList]);

  // Handler add to cart stabil untuk anak komponen memoized
  const handleAddToCart = useCallback((product, qty) => {
    addToCart(product, qty);
  }, [addToCart]);

  // Filter produk dengan useMemo (hanya dihitung ulang saat dependencies berubah)
  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return products.filter((item) => {
      const matchCat = selectedCategory === 'Semua' || item.kategori === selectedCategory;
      const matchSearch =
        !query ||
        item.nama_produk?.toLowerCase().includes(query) ||
        item.kategori?.toLowerCase().includes(query);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, debouncedSearch]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 24px) 110px' }}>
      {/* Header & Tagline */}
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto clamp(24px, 4vw, 36px)' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', margin: '8px 0 10px' }}>
          Behold Our Product!
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
          Chosen And Prepared For The Rightful Hand
        </p>
      </div>

      {/* Filter Bar & Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        {/* Category Pills with Smooth Touch Swipe */}
        <div className="scrollable-tabs" style={{ gap: '8px', maxWidth: '100%' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                flexShrink: 0,
                whiteSpace: 'nowrap',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: selectedCategory === cat ? 'var(--accent-vermilion)' : 'var(--bg-card)',
                color: selectedCategory === cat ? '#fff' : 'var(--text-primary)',
                border: `1px solid ${selectedCategory === cat ? 'var(--accent-vermilion)' : 'var(--border-subtle)'}`,
                transition: 'all var(--transition-fast)',
                textTransform: 'capitalize',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            className="zen-input"
            placeholder="Cari menu favorit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Product Grid Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <p style={{ fontSize: '15px' }}>Menyiapkan hidangan lezat...</p>
        </div>
      ) : error ? (
        <div
          style={{
            backgroundColor: 'var(--status-danger-bg)',
            color: 'var(--status-danger-text)',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '40px auto'
          }}
        >
          <AlertCircle size={32} style={{ margin: '0 auto 10px' }} />
          <p style={{ fontWeight: 600, marginBottom: '12px' }}>{error}</p>
          <button
            onClick={() => fetchProductList({ skipCache: true })}
            className="zen-btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '16px', fontWeight: 600 }}>Tidak ada menu yang sesuai.</p>
          <p style={{ fontSize: '13px' }}>Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))',
            gap: '20px'
          }}
        >
          {filteredProducts.map((product) => (
            <CatalogProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Floating Bottom Cart Bar (if items in cart) */}
      {totalItems > 0 && (
        <div
          className="floating-cart-bar"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            width: 'calc(100% - 48px)',
            maxWidth: '680px',
            backgroundColor: 'var(--text-primary)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-modal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-vermilion)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                flexShrink: 0
              }}
            >
              {totalItems}
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="hide-on-mobile" style={{ margin: 0, fontSize: '11px', color: '#c5c2bb' }}>Total</p>
              <strong style={{ fontSize: '15px', color: '#ffffff', fontFamily: 'var(--font-serif)', whiteSpace: 'nowrap' }}>
                {formatIDR(totalPrice)}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <span className="hide-on-mobile">Lihat </span>Keranjang
            </button>

            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              style={{
                backgroundColor: 'var(--accent-vermilion)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(176, 58, 46, 0.4)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
