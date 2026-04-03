"use client";

const GridIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="11" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  );
};

const ListIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <line x1="1" y1="3" x2="17" y2="3" />
      <line x1="1" y1="9" x2="17" y2="9" />
      <line x1="1" y1="15" x2="17" y2="15" />
    </svg>
  );
};

type ViewToggleProps = {
  value: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
}

export const ViewToggle = ({ value, onChange }: ViewToggleProps) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange(value === "grid" ? "list" : "grid");
      }}
      className="relative w-20 h-10 rounded-full bg-zinc-900 cursor-pointer transition-colors border border-zinc-600/50"
    >
      <div
        className={`absolute top-1 w-8 h-8 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center transition-all duration-200 ${
          value === "list" ? "left-[calc(100%-2.25rem)]" : "left-1"
        }`}
      >
        <span className="scale-[0.8]">
          {value === "grid" ? <GridIcon /> : <ListIcon />}
        </span>
      </div>
    </button>
  );
};
