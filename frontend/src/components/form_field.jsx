/**
 * Pembungkus field formulir standar Ketsai Zen Design System
 */
export function FormField({
  label,
  required = false,
  error = null,
  helperText = null,
  icon = null,
  action = null,
  children,
  className = '',
  style = {}
}) {
  return (
    <div className={`form-field ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {(label || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <label className="zen-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {icon}
              <span>{label}</span>
              {required && <span style={{ color: 'var(--accent-vermilion)' }}>*</span>}
            </label>
          )}
          {action && <div>{action}</div>}
        </div>
      )}

      {children}

      {error ? (
        <span style={{ fontSize: '11px', color: 'var(--accent-vermilion)', fontWeight: 600 }}>
          {error}
        </span>
      ) : helperText ? (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
