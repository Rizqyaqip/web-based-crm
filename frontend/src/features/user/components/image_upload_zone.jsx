import { UploadCloud, X } from 'lucide-react';

export function ImageUploadZone({
  fileInputRef,
  imageFile,
  imagePreviewUrl,
  isDragging,
  isSubmitting,
  onFileSelect,
  onClearImage,
  onDragOver,
  onDragLeave,
  onDrop
}) {
  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={onFileSelect}
        style={{ display: 'none' }}
        disabled={isSubmitting}
      />

      {imagePreviewUrl ? (
        <div style={{
          position: 'relative',
          padding: '12px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            flexShrink: 0,
            border: '1px solid var(--border-subtle)'
          }}>
            <img
              src={imagePreviewUrl}
              alt="Preview Foto"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '12px',
              fontWeight: 700,
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {imageFile?.name || 'Foto Produk'}
            </p>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : ''}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--status-success-text)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
              Foto siap diunggah
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="zen-btn-ghost"
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={onClearImage}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--status-danger-bg)',
                color: 'var(--status-danger-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Hapus foto"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: `2px dashed ${isDragging ? 'var(--accent-vermilion)' : 'var(--border-subtle)'}`,
            backgroundColor: isDragging ? 'var(--accent-vermilion-light)' : 'var(--bg-card)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <UploadCloud size={24} style={{ color: 'var(--accent-vermilion)', margin: '0 auto 6px' }} />
          <p style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 2px' }}>
            Klik atau seret foto produk ke sini
          </p>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Format PNG, JPG, JPEG, atau WEBP (Maksimal 5MB)
          </span>
        </div>
      )}
    </div>
  );
}
