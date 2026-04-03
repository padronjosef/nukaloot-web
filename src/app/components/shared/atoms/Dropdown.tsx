"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronIcon } from "./ChevronIcon";

type DropdownProps = {
  trigger: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
  active?: boolean;
};

export const Dropdown = ({
  trigger,
  badge,
  children,
  className = "",
  panelClassName = "",
  active = false,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
          active
            ? "bg-blue-600 text-white"
            : "bg-zinc-800 border border-zinc-600/50 text-zinc-400 hover:text-zinc-200"
        }`}
      >
        {trigger}
        {badge}
        <ChevronIcon open={open} />
      </button>

      <div
        className={`absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-100 transition-all duration-200 origin-top ${
          open
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-0 pointer-events-none"
        } ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
};
