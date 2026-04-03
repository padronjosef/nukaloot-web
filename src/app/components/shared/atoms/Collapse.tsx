type CollapseProps = {
  open: boolean;
  collapsedHeight?: string;
  maxHeight?: string;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

export const Collapse = ({
  open,
  collapsedHeight = "0px",
  maxHeight = "500px",
  duration = 300,
  children,
  className = "",
}: CollapseProps) => {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        maxHeight: open ? maxHeight : collapsedHeight,
        transition: `max-height ${duration}ms ease-in-out`,
      }}
    >
      {children}
    </div>
  );
};
