import { Loader2 } from 'lucide-react';

/**
 * Komponen Button standar Ketsai Zen Design System
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon = null,
  disabled = false,
  type = 'button',
  fullWidth = false,
  onClick,
  children,
  className = '',
  style = {},
  title,
  ...props
}) {
  const sizeStyles = {
    sm: { padding: '6px 14px', fontSize: '12px' },
    md: { padding: '9px 20px', fontSize: '13px' },
    lg: { padding: '12px 26px', fontSize: '15px' }
  };

  const variantClassMap = {
    primary: 'zen-btn-primary',
    secondary: 'zen-btn-secondary',
    'danger-outline': 'zen-btn-outline-danger',
    danger: 'zen-btn-primary',
    ghost: 'zen-btn-ghost'
  };

  const defaultClass = variantClassMap[variant] || 'zen-btn-primary';

  const customVariantStyle = variant === 'danger'
    ? { backgroundColor: 'var(--accent-vermilion)', color: '#ffffff' }
    : variant === 'ghost'
    ? { backgroundColor: 'transparent', color: 'var(--text-secondary)' }
    : {};

  const mergedStyle = {
    ...sizeStyles[size],
    ...customVariantStyle,
    ...(fullWidth ? { width: '100%' } : {}),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    ...style
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${defaultClass} ${className}`.trim()}
      style={mergedStyle}
      title={title}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="animate-spin" />
          {children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
