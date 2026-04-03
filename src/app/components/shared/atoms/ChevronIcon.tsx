type ChevronIconProps = {
  open: boolean;
  size?: number;
}

export const ChevronIcon = ({ open, size = 12 }: ChevronIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={open ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"} />
    </svg>
  );
};
