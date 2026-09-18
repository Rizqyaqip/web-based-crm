import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Komponen Modal Dialog terpusat Ketsai Zen Design System
 */
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = null,
  size = 'md',
  children,
  footer = null,
  closeOnEsc = true,
  closeOnBackdrop = true,
  isLoading = false,
  className = '',
  style = {}
}) {
  // Tutup dengan ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, isLoading, onClose]);

  if (!isOpen) return null;

  const sizeWidthMap = {
    sm: '440px',
    md: '560px',
    lg: '680px',
    xl: '820px'
  };

  const maxWidth = sizeWidthMap[size] || sizeWidthMap.md;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'rgba(43, 42, 40, 0.55)',
        backdropFilter: 'blur(6px)'
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => closeOnBackdrop && !isLoading && onClose()}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Modal Box */}
      <div
        className={`zen-modal ${className}`.trim()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-card)',
          zIndex: 201,
          overflow: 'hidden',
          ...style
        }}
      >
        {/* HEADER */}
        {(title || icon) && (
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-primary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {icon && (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-vermilion-light)',
                    color: 'var(--accent-vermilion)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 style={{ fontSize: '17px', margin: 0, fontWeight: 800 }}>{title}</h3>
                )}
                {subtitle && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* BODY */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>{children}</div>

        {/* FOOTER */}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px'
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
