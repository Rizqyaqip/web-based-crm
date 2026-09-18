import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Komponen Alert / Feedback Banner terpusat Ketsai Zen Design System
 */
export function Alert({
  type = 'info',
  message,
  children,
  icon = null,
  action = null,
  onClose = null,
  className = '',
  style = {}
}) {
  const typeConfig = {
    success: {
      bg: 'var(--status-success-bg)',
      color: 'var(--status-success-text)',
      border: 'var(--status-success-border)',
      defaultIcon: <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
    },
    error: {
      bg: 'var(--status-danger-bg)',
      color: 'var(--status-danger-text)',
      border: 'rgba(176, 58, 46, 0.25)',
      defaultIcon: <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
    },
    warning: {
      bg: 'var(--status-pending-bg)',
      color: 'var(--status-pending-text)',
      border: 'var(--status-pending-border)',
      defaultIcon: <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
    },
    info: {
      bg: 'var(--status-info-bg)',
      color: 'var(--status-info-text)',
      border: 'var(--status-info-border)',
      defaultIcon: <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`zen-alert ${className}`.trim()}
      style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: '13px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        ...style
      }}
    >
      {icon !== false && (icon || config.defaultIcon)}

      <div style={{ flex: 1, minWidth: 0 }}>
        {message && <p style={{ margin: 0, fontWeight: 500, lineHeight: 1.4 }}>{message}</p>}
        {children}
      </div>

      {action && <div style={{ flexShrink: 0 }}>{action}</div>}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '2px',
            color: 'inherit',
            opacity: 0.7,
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
