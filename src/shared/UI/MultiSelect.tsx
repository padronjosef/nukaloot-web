"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

type MultiSelectOption = {
  value: string;
  label: string;
};

const Option = ({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-border"
  >
    <div
      className={`size-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-primary border-primary" : "border-muted-foreground"}`}
    >
      {checked && <Check className="size-3 text-primary-foreground" />}
    </div>
    <span className={checked ? "text-foreground" : "text-muted-foreground"}>
      {label}
    </span>
  </button>
);

type MultiSelectProps = {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  allLabel?: string;
  className?: string;
  triggerClassName?: string;
};

export const MultiSelect = ({
  options,
  selected,
  onChange,
  allLabel = "All",
  className = "",
  triggerClassName = "",
}: MultiSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ top: -9999, right: 0 });
  const [hasMounted, setHasMounted] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const allValues = options.map((o) => o.value);
  const allSelected = selected.length === allValues.length;

  const countNoun = allLabel.replace(/^All\s*/i, "");
  const displayLabel =
    allSelected || selected.length === 0
      ? allLabel
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label ?? allLabel
        : `${selected.length} ${countNoun}`;

  // Mount portal after hydration so scale-y-0 is painted before first click
  React.useEffect(() => { setHasMounted(true) }, []);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
    } else {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPos({
          top: rect.bottom + 4,
          right: document.documentElement.clientWidth - rect.right,
        });
      }
      setOpen(true);
    }
  };

  React.useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (
        dropdownRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className={`relative h-full ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`flex items-center gap-1 px-2 h-full text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer whitespace-nowrap ${triggerClassName}`}
      >
        {displayLabel}
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {hasMounted &&
        createPortal(
          <div
            ref={dropdownRef}
            onMouseDown={(e) => e.preventDefault()}
            className={`fixed bg-muted border border-border rounded-lg shadow-2xl py-1 min-w-40 z-9999 transition-[scale,opacity] duration-300 origin-top ${
              open
                ? "opacity-100 scale-y-100 pointer-events-auto"
                : "opacity-0 scale-y-0 pointer-events-none"
            }`}
            style={{ top: pos.top, right: pos.right }}
          >
            <Option
              label={allLabel}
              checked={allSelected || selected.length === 0}
              onClick={() => onChange(allSelected ? [] : [...allValues])}
            />
            {options.map((opt) => (
              <Option
                key={opt.value}
                label={opt.label}
                checked={selected.includes(opt.value)}
                onClick={() => {
                  const next = selected.includes(opt.value)
                    ? selected.filter((v) => v !== opt.value)
                    : [...selected, opt.value];
                  onChange(next);
                }}
              />
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};
