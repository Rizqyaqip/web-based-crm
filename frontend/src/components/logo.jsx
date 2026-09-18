import logoImg from '../assets/logo.png';

export function Logo({
  height = '32px',
  alt = 'Ketsai Logo',
  className = '',
  style = {},
  onClick
}) {
  return (
    <img
      src={logoImg}
      alt={alt}
      className={className}
      onClick={onClick}
      style={{
        height,
        width: 'auto',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style
      }}
    />
  );
}

export default Logo;
