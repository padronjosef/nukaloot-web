"use client";

import { CloseIcon } from "./CloseIcon";

type CloseButtonProps = {
  onClick: () => void;
  className?: string;
};

export const CloseButton = ({ onClick, className = "" }: CloseButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-7 h-7 flex items-center justify-center rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white cursor-pointer transition-colors ${className}`}
  >
    <CloseIcon />
  </button>
);
