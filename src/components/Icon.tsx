type IconProps = {
  name: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
};

export function Icon({ name, className = "", fill = false, style }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${fill ? "fill" : ""} ${className}`}
      style={style}
    >
      {name}
    </span>
  );
}
