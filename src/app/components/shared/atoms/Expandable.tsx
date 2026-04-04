"use client";

import { useState, useEffect } from "react";
import { ChevronIcon } from "./ChevronIcon";
import { Collapse } from "./Collapse";

type ExpandableProps = {
  id?: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  leftSlot?: React.ReactNode;
  onLeftSlotClick?: () => void;
  rightSlot?: React.ReactNode;
  compact?: boolean;
};

export const Expandable = ({
  id,
  title,
  children,
  defaultOpen = false,
  leftSlot,
  onLeftSlotClick,
  rightSlot,
  compact = false,
}: ExpandableProps) => {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem(`expandable_${id}`);
    if (stored !== null) queueMicrotask(() => setOpen(stored === "true"));
  }, [id]);

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (id) localStorage.setItem(`expandable_${id}`, String(next));
      return next;
    });
  };

  return (
    <div>
      <div className="w-full flex items-center py-1 cursor-pointer" onClick={toggle}>
        {leftSlot ? (
          <div
            onClick={(e) => { e.stopPropagation(); onLeftSlotClick?.(); }}
            className="flex items-center gap-2 cursor-pointer"
          >
            {leftSlot}
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              {title}
            </span>
          </div>
        ) : (
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            {title}
          </span>
        )}
        <div className={`flex items-center gap-1 ${compact ? "" : "ml-auto"}`}>
          {rightSlot}
          <ChevronIcon open={open} />
        </div>
      </div>
      <Collapse open={open} maxHeight="1000px" duration={300}>
        <div className="pt-2">
          {children}
        </div>
      </Collapse>
    </div>
  );
};
