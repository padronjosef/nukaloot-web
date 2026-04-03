type CheckboxProps = {
  checked: boolean;
  size?: "sm" | "md";
}

export const Checkbox = ({ checked, size = "md" }: CheckboxProps) => {
  const dim = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const iconSize = size === "sm" ? 8 : 10;
  return (
    <span className={`${dim} rounded border flex items-center justify-center ${
      checked ? "bg-zinc-100 border-zinc-100" : "border-zinc-500"
    }`}>
      {checked && (
        <svg width={iconSize} height={iconSize} viewBox="0 0 10 10" fill="none" stroke="#18181b" strokeWidth="2">
          <path d="M2 5L4 7L8 3" />
        </svg>
      )}
    </span>
  );
};
