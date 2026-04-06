"use client";

import { useRef, useEffect, useState, useSyncExternalStore, createContext, useContext, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const hasMounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  const calcPosition = useCallback(() => {
    if (!triggerRef.current || !panelRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panel = panelRef.current;
    const vw = document.documentElement.clientWidth;

    // Temporarily make panel visible to measure its natural width
    panel.style.transform = "scaleY(1)";
    panel.style.opacity = "0";
    panel.style.left = "0";
    panel.style.right = "auto";
    const panelWidth = panel.offsetWidth;
    panel.style.transform = "";
    panel.style.opacity = "";
    panel.style.left = "";
    panel.style.right = "";

    const top = rect.bottom + 4;
    const padding = 16;

    // Option 1: align left edge of panel with left edge of trigger
    if (rect.left + panelWidth + padding <= vw) {
      setPos({ top, left: rect.left });
      return;
    }

    // Option 2: align right edge of panel with right edge of trigger
    const rightSpace = vw - rect.right;
    if (rightSpace + rect.width + (panelWidth - rect.width) <= vw - padding) {
      setPos({ top, right: rightSpace });
      return;
    }

    // Fallback: pin to right with padding
    setPos({ top, right: padding });
  }, []);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  // Calculate position after panel renders, clean up after close animation
  useEffect(() => {
    if (open) {
      requestAnimationFrame(calcPosition);
    } else if (pos) {
      const timer = setTimeout(() => setPos(null), 300);
      return () => clearTimeout(timer);
    }
  }, [open, calcPosition]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const style: React.CSSProperties = pos
    ? { top: pos.top, ...(pos.left !== undefined ? { left: pos.left } : {}), ...(pos.right !== undefined ? { right: pos.right } : {}) }
    : { top: -9999, opacity: 0 };

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <Button variant={active ? "default" : "outline"} onClick={handleToggle}>
        {trigger}
        {badge}
        <ChevronDown className={`size-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </Button>

      {hasMounted && createPortal(
        <div
          ref={panelRef}
          onMouseDown={(e) => e.preventDefault()}
          className={`fixed bg-muted border border-border rounded-lg shadow-2xl z-100 max-w-[calc(100vw-32px)] transition-[scale,opacity] ${DROPDOWN_DURATION} origin-top ${
            open && pos
              ? "scale-y-100 opacity-100 pointer-events-auto"
              : pos
                ? "scale-y-0 opacity-0 pointer-events-none"
                : "scale-y-0 opacity-0 pointer-events-none invisible"
          } ${panelClassName}`}
          style={style}
        >
          <DropdownContext.Provider value={close}>
            {children}
          </DropdownContext.Provider>
        </div>,
        document.body,
      )}
    </div>
  );
};
