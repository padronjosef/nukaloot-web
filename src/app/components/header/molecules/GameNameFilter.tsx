"use client";

import { useState, useRef, useEffect } from "react";
import { Collapse } from "../../shared/atoms/Collapse";

type GameNameFilterProps = {
  gameNames: string[];
  activeFilter: string;
  onFilterChange: (name: string) => void;
}

const NameButton = ({
  name,
  active,
  onClick,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
        active
          ? "bg-zinc-100 text-zinc-900"
          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {name}
    </button>
  );
};

export const GameNameFilter = ({
  gameNames,
  activeFilter,
  onFilterChange,
}: GameNameFilterProps) => {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    setOverflows(ref.current.scrollHeight > 40);
  }, [gameNames]);

  const select = (name: string) => {
    onFilterChange(name);
    setExpanded(false);
  };

  if (gameNames.length <= 1) return null;

  return (
    <>
      <div
        onClick={() => setExpanded(false)}
        className={`md:hidden fixed inset-0 bg-black/40 z-100 transition-opacity duration-200 ${
          expanded
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />
      <div className="w-full relative">
        <div className="overflow-hidden h-8">
          <div ref={ref} className="flex flex-wrap gap-2 pr-10">
            <NameButton
              name="All Games"
              active={activeFilter === "all"}
              onClick={() => select("all")}
            />
            {gameNames.map((name) => (
              <NameButton
                key={name}
                name={name}
                active={activeFilter === name}
                onClick={() => select(name)}
              />
            ))}
          </div>
        </div>
        <Collapse
          open={expanded}
          className="md:relative absolute left-0 right-0 top-0 z-101 bg-zinc-900 md:bg-transparent rounded-lg md:rounded-none shadow-2xl md:shadow-none"
        >
          <div className="flex flex-wrap gap-2 p-2 md:p-0 md:pt-2 pr-10">
            <NameButton
              name="All Games"
              active={activeFilter === "all"}
              onClick={() => select("all")}
            />
            {gameNames.map((name) => (
              <NameButton
                key={name}
                name={name}
                active={activeFilter === name}
                onClick={() => select(name)}
              />
            ))}
          </div>
        </Collapse>

        {overflows && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="absolute right-0 top-0 h-8 w-8 flex items-center justify-center bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors z-102"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
};
