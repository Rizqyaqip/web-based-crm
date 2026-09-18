import { memo } from 'react';
import {
  PackagePlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PlusCircle,
  Layers,
  Utensils,
  Image,
  Camera
} from 'lucide-react';
import { formatIDR } from '../../../services/api';
import { ImageUploadZone } from './image_upload_zone';

export const StockForm = memo(function StockForm({
  formRef,
  fileInputRef,
  user,
  setPage,
  categories,
  selectedCategory,
  categoryMode,
  setCategoryMode,
  newCategoryName,
  setNewCategoryName,
  handleCategoryChange,
  activeCategoryFolder,
  productMode,
  setProductMode,
  selectedProductId,
  setSelectedProductId,
  productsInSelectedCategory,
  selectedProduct,
  showUploadForExisting,
  setShowUploadForExisting,
  newProductData,
  setNewProductData,
  imageFile,
  imagePreviewUrl,
  isDragging,
  handleFileSelect,
  handleClearImage,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  quantityAdded,
  setQuantityAdded,
  isSubmitting,
  statusFeedback,
  handleSubmit
}) {
  return (
    <div ref={formRef} className="zen-card stock-form-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{
          width: '28px',
          height: '28px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--accent-vermilion-light)',
          color: 'var(--accent-vermilion)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 700
        }}>
          +
        </span>
        <h2 style={{ fontSize: '18px', margin: 0 }}>Formulir Input Stok</h2>
      </div>

      {/* Feedback Notifikasi */}
      {statusFeedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          backgroundColor: statusFeedback.type === 'success' ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
          color: statusFeedback.type === 'success' ? 'var(--status-success-text)' : 'var(--status-danger-text)',
          border: `1px solid ${statusFeedback.type === 'success' ? 'var(--status-success-border)' : 'rgba(176, 58, 46, 0.2)'}`
        }}>
          {statusFeedback.type === 'success' ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 500 }}>{statusFeedback.message}</p>
            {statusFeedback.type === 'success' && (
              <button
                type="button"
                onClick={() => setPage('admin-stock-logs')}
                style={{ fontSize: '11px', fontWeight: 700, textDecoration: 'underline', marginTop: '4px', display: 'inline-block' }}
              >
                Buka Riwayat Mutasi Lengkap →
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* ---------------------------------------------------- */}
        {/* TAHAP 1: KATEGORI                                   */}
        {/* ---------------------------------------------------- */}
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label className="zen-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} style={{ color: 'var(--accent-vermilion)' }} />
              <span>1. Kategori Produk *</span>
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setCategoryMode('existing')}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  backgroundColor: categoryMode === 'existing' ? 'var(--accent-vermilion)' : 'transparent',
                  color: categoryMode === 'existing' ? '#ffffff' : 'var(--text-secondary)',
                  border: categoryMode === 'existing' ? 'none' : '1px solid var(--border-subtle)'
                }}
              >
                Pilih Ada
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategoryMode('new');
                  setProductMode('new');
                }}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  backgroundColor: categoryMode === 'new' ? 'var(--accent-vermilion)' : 'transparent',
                  color: categoryMode === 'new' ? '#ffffff' : 'var(--text-secondary)',
                  border: categoryMode === 'new' ? 'none' : '1px solid var(--border-subtle)'
                }}
              >
                + Kategori Baru
              </button>
            </div>
          </div>

          {categoryMode === 'existing' ? (
            <div>
              <select
                className="zen-input"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={isSubmitting || categories.length === 0}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <input
                type="text"
                className="zen-input"
                placeholder="Contoh: Minuman Dingin, Aneka Saus..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAHAP 2: JENIS PRODUK & UPLOAD GAMBAR                */}
        {/* ---------------------------------------------------- */}
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label className="zen-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Utensils size={14} style={{ color: 'var(--accent-vermilion)' }} />
              <span>2. Jenis Produk & Gambar *</span>
            </label>

            {categoryMode === 'existing' && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setProductMode('existing');
                    setShowUploadForExisting(false);
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    backgroundColor: productMode === 'existing' ? 'var(--accent-vermilion)' : 'transparent',
                    color: productMode === 'existing' ? '#ffffff' : 'var(--text-secondary)',
                    border: productMode === 'existing' ? 'none' : '1px solid var(--border-subtle)'
                  }}
                >
                  Pilih Produk
                </button>
                <button
                  type="button"
                  onClick={() => setProductMode('new')}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    backgroundColor: productMode === 'new' ? 'var(--accent-vermilion)' : 'transparent',
                    color: productMode === 'new' ? '#ffffff' : 'var(--text-secondary)',
                    border: productMode === 'new' ? 'none' : '1px solid var(--border-subtle)'
                  }}
                >
                  + Produk Baru
                </button>
              </div>
            )}
          </div>

          {/* A. Opsi Produk Eksisting */}
          {productMode === 'existing' && categoryMode === 'existing' ? (
            <div>
              {productsInSelectedCategory.length > 0 ? (
                <>
                  <select
                    className="zen-input"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    disabled={isSubmitting}
                    required
                  >
                    {productsInSelectedCategory.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_produk}
                      </option>
                    ))}
                  </select>

                  {/* Mini Pratinjau Produk Terpilih */}
                  {selectedProduct && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        backgroundColor: '#ffffff',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <img
                          src={imagePreviewUrl || selectedProduct.gambar || '/src/assets/ketsaiOriginal/dimsum.png'}
                          alt={selectedProduct.nama_produk}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            if (!e.currentTarget.src.includes('/src/assets')) {
                              e.currentTarget.src = `/src${selectedProduct.gambar}`;
                            }
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedProduct.nama_produk}
                        </p>
                        <span style={{ fontSize: '12px', color: 'var(--accent-vermilion)', fontWeight: 600 }}>
                          {formatIDR(selectedProduct.harga)}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Stok Saat Ini</span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: selectedProduct.jumlahStok <= 0
                            ? 'var(--status-danger-text)'
                            : selectedProduct.jumlahStok <= 5
                            ? 'var(--status-pending-text)'
                            : 'var(--status-success-text)'
                        }}>
                          {selectedProduct.jumlahStok} porsi
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tombol opsi upload/update foto untuk produk eksisting */}
                  <div style={{ marginTop: '10px' }}>
                    {!showUploadForExisting ? (
                      <button
                        type="button"
                        onClick={() => setShowUploadForExisting(true)}
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--accent-vermilion)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <Camera size={13} />
                        <span>Ganti / Unggah Foto Produk</span>
                      </button>
                    ) : (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            Pilih Foto Produk Baru
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowUploadForExisting(false);
                              handleClearImage();
                            }}
                            style={{ fontSize: '11px', color: 'var(--text-muted)' }}
                          >
                            Batal Ganti Foto
                          </button>
                        </div>
                        <ImageUploadZone
                          fileInputRef={fileInputRef}
                          imageFile={imageFile}
                          imagePreviewUrl={imagePreviewUrl}
                          isDragging={isDragging}
                          isSubmitting={isSubmitting}
                          onFileSelect={handleFileSelect}
                          onClearImage={handleClearImage}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--status-pending-bg)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--status-pending-text)'
                }}>
                  Belum ada produk di kategori <strong>{selectedCategory}</strong>.{' '}
                  <button
                    type="button"
                    onClick={() => setProductMode('new')}
                    style={{ textDecoration: 'underline', fontWeight: 700 }}
                  >
                    Tambah produk pertama di kategori ini
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* B. Opsi Buat Produk Baru */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Nama Produk Kuliner Baru *
                </label>
                <input
                  type="text"
                  className="zen-input"
                  placeholder="Contoh: Es Teh Solo Melati"
                  value={newProductData.nama_produk}
                  onChange={(e) => setNewProductData({ ...newProductData, nama_produk: e.target.value })}
                  required
                  disabled={isSubmitting}
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Harga Satuan (Rp) *
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  className="zen-input"
                  placeholder="Contoh: 8000"
                  value={newProductData.harga}
                  onChange={(e) => setNewProductData({ ...newProductData, harga: e.target.value })}
                  required
                  disabled={isSubmitting}
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Deskripsi Produk (Opsional)
                </label>
                <textarea
                  className="zen-input"
                  rows={2}
                  placeholder="Keterangan singkat komposisi atau kelezatan..."
                  value={newProductData.deskripsi}
                  onChange={(e) => setNewProductData({ ...newProductData, deskripsi: e.target.value })}
                  disabled={isSubmitting}
                  style={{ marginTop: '4px', resize: 'vertical' }}
                />
              </div>

              {/* FIELD UPLOAD GAMBAR PRODUK BARU */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Image size={13} style={{ color: 'var(--accent-vermilion)' }} />
                    <span>Upload Foto Produk Kuliner</span>
                  </label>
                </div>

                <ImageUploadZone
                  fileInputRef={fileInputRef}
                  imageFile={imageFile}
                  imagePreviewUrl={imagePreviewUrl}
                  isDragging={isDragging}
                  isSubmitting={isSubmitting}
                  onFileSelect={handleFileSelect}
                  onClearImage={handleClearImage}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                />

                {/* Preset fallback jika tidak upload gambar */}
                {!imageFile && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Atau gunakan gambar preset yang sudah ada:
                    </span>
                    <select
                      className="zen-input"
                      value={newProductData.gambar}
                      onChange={(e) => setNewProductData({ ...newProductData, gambar: e.target.value })}
                      disabled={isSubmitting}
                      style={{ fontSize: '12px' }}
                    >
                      <option value="">(Default: Dimsum Original)</option>
                      <option value="/src/assets/ketsaiOriginal/dimsum.png">Dimsum Ketsai Original</option>
                      <option value="/src/assets/ketsaiOriginal/kuotie.png">Kuotie Panggang</option>
                      <option value="/src/assets/ketsaiOriginal/lumpia.png">Lumpia Kulit Tahu</option>
                      <option value="/src/assets/frozenFood/frozenDimsum.png">Frozen Dimsum Pack</option>
                      <option value="/src/assets/iceCream/iceCream.png">Ice Cream Ketsai</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAHAP 3: JUMLAH STOK INPUT                           */}
        {/* ---------------------------------------------------- */}
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <label className="zen-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <PlusCircle size={14} style={{ color: 'var(--accent-vermilion)' }} />
            <span>3. Jumlah Stok Ditambahkan (Porsi/Unit) *</span>
          </label>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              min="1"
              max="9999"
              className="zen-input"
              value={quantityAdded}
              onChange={(e) => setQuantityAdded(e.target.value)}
              placeholder="Jumlah masuk..."
              required
              disabled={isSubmitting}
              style={{ fontSize: '16px', fontWeight: 700 }}
            />
          </div>

          {/* Quick Increment Buttons */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            {[5, 10, 20, 50, 100].map((addVal) => (
              <button
                key={addVal}
                type="button"
                onClick={() => setQuantityAdded((prev) => Math.max(1, (Number(prev) || 0) + addVal))}
                className="zen-btn-ghost"
                style={{
                  flex: 1,
                  padding: '4px 0',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                +{addVal}
              </button>
            ))}
          </div>

          {/* Ringkasan Kalkulasi Real-time */}
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            border: '1px dashed var(--border-subtle)',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>Kalkulasi Stok Akhir:</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-vermilion)' }}>
              {productMode === 'new' || categoryMode === 'new' ? (
                `Stok Awal Produk Baru: ${Number(quantityAdded) || 0} unit`
              ) : (
                `${selectedProduct?.jumlahStok || 0} + ${Number(quantityAdded) || 0} = ${(selectedProduct?.jumlahStok || 0) + (Number(quantityAdded) || 0)} porsi`
              )}
            </span>
          </div>
        </div>

        {/* INFO OPERATOR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Operator Gudang/Dapur:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.nama || 'Staf Operasional'}</span>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="zen-btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Memproses Data & Unggah Foto...</span>
            </>
          ) : (
            <>
              <PackagePlus size={18} />
              <span>
                {productMode === 'new' || categoryMode === 'new'
                  ? 'Simpan Produk, Foto & Catat Stok'
                  : 'Simpan & Tambah Stok Masuk'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
});
