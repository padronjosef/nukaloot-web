type CloseIconProps = {
  size?: number;
}

export const CloseIcon = ({ size = 14 }: CloseIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l8 8M11 3l-8 8" />
    </svg>
  );
};
