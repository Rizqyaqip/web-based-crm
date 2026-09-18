import { memo } from 'react';
import { Search, Loader2, Boxes, CheckCircle2, PlusCircle, Pencil } from 'lucide-react';
import { formatIDR } from '../../../services/api';

export const StockProductGrid = memo(function StockProductGrid({
  products,
  filteredProducts,
  categories,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  stockLevelFilter,
  setStockLevelFilter,
  isFetching,
  selectedProductId,
  productMode,
  handleQuickSelectProduct,
  onEditProduct
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* SEARCH & FILTERS BAR */}
      <div className="zen-card" style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div>
            <h3 style={{ fontSize: '17px', margin: 0 }}>Katalog & Status Stok Menu</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Menampilkan {filteredProducts.length} dari {products.length} menu produk
            </span>
          </div>

          {/* Status Level Filter Buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'Semua Status' },
              { key: 'safe', label: 'Stok Aman (>5)' },
              { key: 'low', label: 'Menipis (1-5)' },
              { key: 'out', label: 'Habis (0)' }
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setStockLevelFilter(st.key)}
                style={{
                  fontSize: '11px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  backgroundColor: stockLevelFilter === st.key ? 'var(--text-primary)' : 'var(--bg-primary)',
                  color: stockLevelFilter === st.key ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.15s ease'
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Search & Filter Kategori Dropdown */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="zen-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Cari nama produk kuliner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="zen-input"
            style={{ width: 'auto', minWidth: '160px' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* GRID OF PRODUCT STOCK CARDS */}
      {isFetching ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ margin: 0 }}>Memuat daftar stok kuliner...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="zen-card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
          <Boxes size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h4 style={{ fontSize: '16px', margin: '0 0 6px', color: 'var(--text-primary)' }}>Tidak Ada Produk Ditemukan</h4>
          <p style={{ fontSize: '13px', margin: 0 }}>
            Sesuaikan kata kunci pencarian atau filter kategori Anda.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))',
          gap: '18px'
        }}>
          {filteredProducts.map((prod) => {
            const isSelected = String(prod.id) === String(selectedProductId) && productMode === 'existing';
            const isOutOfStock = prod.jumlahStok <= 0;
            const isLowStock = prod.jumlahStok > 0 && prod.jumlahStok <= 5;

            return (
              <div
                key={prod.id}
                className="zen-card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isSelected ? '2px solid var(--accent-vermilion)' : '1px solid var(--border-card)',
                  boxShadow: isSelected ? '0 0 0 3px var(--accent-vermilion-light)' : 'var(--shadow-sm)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div>
                  {/* Thumbnail & Category Badges */}
                  <div style={{
                    position: 'relative',
                    height: '140px',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={prod.gambar || '/src/assets/ketsaiOriginal/dimsum.png'}
                      alt={prod.nama_produk}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '8px'
                      }}
                      onError={(e) => {
                        if (!e.currentTarget.src.includes('/src/assets')) {
                          e.currentTarget.src = `/src${prod.gambar}`;
                        }
                      }}
                    />

                    {/* Category Badge */}
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(246, 241, 230, 0.95)',
                      backdropFilter: 'blur(4px)',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textTransform: 'uppercase',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {prod.kategori || 'Umum'}
                    </span>

                    {/* Status Badge */}
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                      {isOutOfStock ? (
                        <span className="badge-status badge-danger" style={{ fontSize: '11px', fontWeight: 700 }}>
                          Habis (0)
                        </span>
                      ) : isLowStock ? (
                        <span className="badge-status badge-pending" style={{ fontSize: '11px', fontWeight: 700 }}>
                          Menipis ({prod.jumlahStok})
                        </span>
                      ) : (
                        <span className="badge-status badge-success" style={{ fontSize: '11px', fontWeight: 700 }}>
                          Aman ({prod.jumlahStok})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div style={{ padding: '16px 16px 10px' }}>
                    <h4 style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      margin: '0 0 4px',
                      lineHeight: 1.3
                    }}>
                      {prod.nama_produk}
                    </h4>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-vermilion)' }}>
                      {formatIDR(prod.harga)}
                    </span>

                    {/* Big Stock Indicator Pill */}
                    <div style={{
                      marginTop: '14px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isOutOfStock
                        ? 'var(--status-danger-bg)'
                        : isLowStock
                        ? 'var(--status-pending-bg)'
                        : 'var(--status-success-bg)',
                      border: `1px solid ${
                        isOutOfStock
                          ? 'rgba(176, 58, 46, 0.2)'
                          : isLowStock
                          ? 'rgba(184, 134, 40, 0.2)'
                          : 'rgba(47, 104, 66, 0.2)'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: isOutOfStock
                          ? 'var(--status-danger-text)'
                          : isLowStock
                          ? 'var(--status-pending-text)'
                          : 'var(--status-success-text)'
                      }}>
                        Ketersediaan Stok:
                      </span>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-serif)',
                        color: isOutOfStock
                          ? 'var(--status-danger-text)'
                          : isLowStock
                          ? 'var(--status-pending-text)'
                          : 'var(--status-success-text)'
                      }}>
                        {prod.jumlahStok} <span style={{ fontSize: '12px', fontWeight: 600 }}>porsi</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div style={{ padding: '0 16px 16px', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectProduct(prod)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: isSelected ? 'var(--accent-vermilion)' : 'var(--bg-card-hover)',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Dipilih di Form</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle size={14} />
                        <span>+ Tambah Stok</span>
                      </>
                    )}
                  </button>

                  {onEditProduct && (
                    <button
                      type="button"
                      title="Koreksi / Edit Produk"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct(prod);
                      }}
                      style={{
                        padding: '9px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Pencil size={13} style={{ color: 'var(--accent-vermilion)' }} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
