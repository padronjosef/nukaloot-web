"use client";

import { useRef, useEffect, useState, createContext, useContext } from "react";
import { Button } from "@/shared/UI/Button";
import { ChevronDown } from "lucide-react";
import { DROPDOWN_DURATION } from "../atoms/animations";

const DropdownContext = createContext<(() => void) | null>(null);
export const useDropdownClose = () => useContext(DropdownContext);

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
  const close = () => setOpen(false);

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
      <Button variant={active ? "default" : "outline"} onClick={() => setOpen((v) => !v)}>
        {trigger}
        {badge}
        <ChevronDown className={`size-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </Button>

      <div
        className={`absolute right-0 top-full mt-1 bg-muted border border-border rounded-lg shadow-2xl z-100 transition-all ${DROPDOWN_DURATION} origin-top ${
          open
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-0 pointer-events-none"
        } ${panelClassName}`}
      >
        <DropdownContext.Provider value={close}>
          {children}
        </DropdownContext.Provider>
      </div>
    </div>
  );
};
