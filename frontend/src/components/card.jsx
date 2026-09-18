/**
 * Komponen Card reusable Ketsai Zen Design System
 */
export function Card({
  padding = 'md',
  hoverable = false,
  children,
  className = '',
  style = {},
  onClick,
  ...props
}) {
  const paddingMap = {
    none: '0',
    sm: '14px',
    md: '20px',
    lg: '28px'
  };

  const cardStyle = {
    padding: paddingMap[padding] || paddingMap.md,
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };

  return (
    <div
      onClick={onClick}
      className={`zen-card ${hoverable ? 'card-hoverable' : ''} ${className}`.trim()}
      style={cardStyle}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action = null,
  icon = null,
  children,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`card-header ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '16px',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-vermilion-light)',
              color: 'var(--accent-vermilion)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </div>
        )}
        <div>
          {title && <h3 style={{ fontSize: '17px', margin: 0, fontWeight: 700 }}>{title}</h3>}
          {subtitle && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</span>
          )}
          {children}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '', style = {} }) {
  return (
    <div className={`card-body ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', style = {} }) {
  return (
    <div
      className={`card-footer ${className}`.trim()}
      style={{
        marginTop: '16px',
        paddingTop: '14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '10px',
        ...style
      }}
    >
      {children}
    </div>
  );
}
