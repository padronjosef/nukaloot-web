"use client";

type CheapestButtonProps = {
  active: boolean;
  onClick: () => void;
  className?: string;
}

export const CheapestButton = ({
  active,
  onClick,
  className = "",
}: CheapestButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 h-9 w-fit shrink-0 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
        active
          ? "text-green-400 bg-green-900"
          : "bg-zinc-700 text-zinc-400 hover:text-zinc-200"
      } ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
      Cheapest only
    </button>
  );
};
