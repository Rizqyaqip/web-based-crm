/**
 * Komponen Input, Textarea, dan Select terpusat Ketsai Zen Design System
 */
export function Input({
  icon = null,
  hasError = false,
  className = '',
  style = {},
  ...props
}) {
  if (icon) {
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}
        >
          {icon}
        </div>
        <input
          className={`zen-input ${className}`.trim()}
          style={{
            paddingLeft: '38px',
            ...(hasError ? { borderColor: 'var(--accent-vermilion)' } : {}),
            ...style
          }}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      className={`zen-input ${className}`.trim()}
      style={{
        ...(hasError ? { borderColor: 'var(--accent-vermilion)' } : {}),
        ...style
      }}
      {...props}
    />
  );
}

export function Textarea({
  hasError = false,
  rows = 3,
  className = '',
  style = {},
  ...props
}) {
  return (
    <textarea
      rows={rows}
      className={`zen-input ${className}`.trim()}
      style={{
        resize: 'vertical',
        ...(hasError ? { borderColor: 'var(--accent-vermilion)' } : {}),
        ...style
      }}
      {...props}
    />
  );
}

export function Select({
  hasError = false,
  options = [],
  children,
  className = '',
  style = {},
  ...props
}) {
  return (
    <select
      className={`zen-input ${className}`.trim()}
      style={{
        ...(hasError ? { borderColor: 'var(--accent-vermilion)' } : {}),
        ...style
      }}
      {...props}
    >
      {options.length > 0
        ? options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })
        : children}
    </select>
  );
}
