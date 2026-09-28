"use client";

import { useRef, useEffect, useState, useSyncExternalStore, createContext, useContext, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/UI/Button";
import { ChevronDown } from "lucide-react";
import { DROPDOWN_DURATION } from "../atoms/animations";
import { anchorIsOffscreen, dropdownPosition } from "./dropdownPosition";

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

    // Measured without touching inline styles. Writing to panel.style here
    // and clearing it afterwards used to wipe the left/right React had put
    // there: on the next render React diffs against its own last value, sees
    // that side unchanged and does not write it again, so the panel was left
    // pinned at the window edge. The panel is hidden by transform and opacity,
    // neither of which affects layout, so its width is already its real one.
    const panelWidth = panel.offsetWidth;

    // Scrolled past the trigger: following it off the edge would leave the
    // panel hanging over the results on its own.
    if (anchorIsOffscreen(rect, document.documentElement.clientHeight)) {
      setOpen(false);
      return;
    }

    setPos(dropdownPosition(rect, panelWidth, vw));
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

  /**
   * The panel is positioned `fixed`, so coordinates taken when it opened stop
   * being true the moment anything moves — the panel stays put while the
   * trigger slides away and the options drift across the page.
   *
   * Watched per frame rather than on `scroll`, because the header is sticky
   * and keeps animating after the last scroll event fires: listening to scroll
   * alone left the panel 50px adrift once the header finished collapsing. The
   * work is a `getBoundingClientRect` per frame, and only a change re-renders.
   * It runs only while the menu is open.
   */
  useEffect(() => {
    if (!open) return;

    let frame = 0;
    let last = "";

    const watch = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        const now = `${rect.top}:${rect.left}:${rect.right}`;
        if (now !== last) {
          last = now;
          calcPosition();
        }
      }
      frame = requestAnimationFrame(watch);
    };

    frame = requestAnimationFrame(watch);
    return () => cancelAnimationFrame(frame);
  }, [open, calcPosition]);

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
