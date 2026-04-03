"use client";

type ButtonProps = {
  variant?: "default" | "outline" | "success";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
};

const BASE = "flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-600 cursor-pointer";

const VARIANTS = {
  default: "bg-zinc-100 text-zinc-900",
  outline: "bg-zinc-800 text-zinc-400 hover:text-zinc-200",
  success: "bg-green-900 text-green-400",
} as const;

export const Button = ({
  variant = "default",
  onClick,
  type = "button",
  disabled = false,
  children,
  className = "",
}: ButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${BASE} ${VARIANTS[variant]} ${disabled ? "disabled:brightness-50 disabled:cursor-not-allowed" : ""} ${className}`}
  >
    {children}
  </button>
);
