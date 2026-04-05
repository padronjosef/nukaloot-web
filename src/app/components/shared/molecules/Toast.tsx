"use client";

import { Button } from "@/shared/UI/Button";
import { X } from "lucide-react";

type ToastVariant = "success" | "warning" | "error" | "info";

type ToastProps = {
  variant: ToastVariant;
  message: string;
  onClose?: () => void;
}

const VARIANT_CONFIG: Record<
  ToastVariant,
  { border: string; icon: React.ReactNode }
> = {
  success: {
    border: "border-green-700/50",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="shrink-0"
      >
        <circle cx="7" cy="7" r="6" stroke="#22c55e" strokeWidth="1.5" />
        <path
          d="M4 7l2 2 4-4"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  warning: {
    border: "border-amber-700/50",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0"
      >
        <path
          d="M8 1L1 14h14L8 1z"
          stroke="#f59e0b"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M8 6v4M8 11.5v.5"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  error: {
    border: "border-red-700/50",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="shrink-0"
      >
        <circle cx="7" cy="7" r="6" stroke="#ef4444" strokeWidth="1.5" />
        <path
          d="M5 5l4 4M9 5l-4 4"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  info: {
    border: "border-primary/50",
    icon: (
      <div className="w-4 h-4 border-2 border-muted-foreground/60 border-t-primary rounded-full animate-spin shrink-0" />
    ),
  },
};

export const Toast = ({ variant, message, onClose }: ToastProps) => {
  const config = VARIANT_CONFIG[variant];
  return (
    <div
      className={`flex items-center gap-3 bg-muted border ${config.border} rounded-lg px-4 py-3 shadow-2xl`}
    >
      {config.icon}
      <span className="text-sm text-foreground/80">{message}</span>
      {onClose && (
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="ml-1">
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
};

type ToastContainerProps = {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  children: React.ReactNode;
}

const POSITION_CLASSES: Record<string, string> = {
  "bottom-right": "fixed bottom-6 right-6",
  "bottom-left": "fixed bottom-6 left-6",
  "top-right": "fixed top-6 right-6",
  "top-left": "fixed top-6 left-6",
};

export const ToastContainer = ({
  position = "bottom-right",
  children,
}: ToastContainerProps) => {
  return (
    <div className={`${POSITION_CLASSES[position]} z-50 flex flex-col gap-3`}>
      {children}
    </div>
  );
};
