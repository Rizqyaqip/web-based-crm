import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from './button';

/**
 * Komponen ConfirmDialog standar untuk konfirmasi tindakan destruktif/penting
 */
export function ConfirmDialog({
  isOpen = true,
  title = 'Konfirmasi Tindakan',
  description = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
  className = '',
  style = {}
}) {
  if (!isOpen) return null;

  return (
    <div
      className={`confirm-dialog-box ${className}`.trim()}
      style={{
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: isDestructive ? 'var(--status-danger-bg)' : 'var(--bg-card)',
        border: isDestructive ? '1px solid rgba(176, 58, 46, 0.3)' : '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        textAlign: 'center',
        ...style
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: isDestructive ? 'rgba(176, 58, 46, 0.15)' : 'rgba(43, 42, 40, 0.08)',
          color: isDestructive ? 'var(--accent-vermilion)' : 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto'
        }}
      >
        <AlertTriangle size={24} />
      </div>

      <div>
        <h4
          style={{
            margin: '0 0 6px',
            fontSize: '16px',
            color: isDestructive ? 'var(--accent-vermilion)' : 'var(--text-primary)'
          }}
        >
          {title}
        </h4>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '6px' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={isLoading}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={isDestructive ? 'danger' : 'primary'}
          size="sm"
          isLoading={isLoading}
          icon={isDestructive ? <Trash2 size={15} /> : null}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
