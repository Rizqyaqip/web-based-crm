export function HankoStamp({ children, style = {} }) {
  return (
    <span className="hanko-stamp" style={style}>
      {children}
    </span>
  );
}
