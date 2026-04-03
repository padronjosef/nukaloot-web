"use client";

import { TYPE_LABELS, type TypeFilter } from "../../../lib/stores";

type TypeFilterBarProps = {
  value: TypeFilter;
  onChange: (type: TypeFilter) => void;
  className?: string;
}

export const TypeFilterBar = ({
  value,
  onChange,
  className = "",
}: TypeFilterBarProps) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {(Object.keys(TYPE_LABELS) as TypeFilter[]).map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`px-3 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            value === type
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
};
