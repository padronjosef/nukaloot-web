"use client";

import { useState, useRef, useEffect } from "react";
import { Collapse } from "@/app/components/shared/atoms/Collapse";
import { ChevronIcon } from "@/app/components/shared/atoms/ChevronIcon";
import { useResultCount } from "@/app/stores/selectors";

type GameNameFilterProps = {
  gameNames: string[];
  activeFilter: string;
  onFilterChange: (name: string) => void;
};

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
      className={`px-3 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
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
  const resultCount = useResultCount();
  const [expanded, setExpanded] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const containerHeight = 32;
      let hidden = 0;
      const children = Array.from(el.children) as HTMLElement[];
      for (const child of children) {
        if (child.offsetTop >= containerHeight) hidden++;
      }
      setHiddenCount(hidden);
    };
    requestAnimationFrame(measure);
  }, [gameNames]);

  const select = (name: string) => {
    onFilterChange(name);
    setExpanded(false);
  };

  if (gameNames.length <= 1 && !resultCount) return null;

  const allNames = ["All Games", ...gameNames];

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
          <div ref={containerRef} className="flex flex-wrap gap-2 pr-42">
            {resultCount !== undefined && (
              <span className="px-3 h-8 rounded-lg text-xs font-bold flex items-center bg-zinc-100 text-zinc-900">
                {resultCount} Results
              </span>
            )}
            {gameNames.length > 1 && allNames.map((name) => (
              <NameButton
                key={name}
                name={name}
                active={name === "All Games" ? activeFilter === "all" : activeFilter === name}
                onClick={() => select(name === "All Games" ? "all" : name)}
              />
            ))}
          </div>
        </div>
        <Collapse
          open={expanded}
          className="md:relative absolute left-0 right-0 top-0 z-101 bg-zinc-900 md:bg-transparent rounded-lg md:rounded-none shadow-2xl md:shadow-none"
        >
          <div className="flex flex-wrap gap-2 md:pt-2 pr-10">
            {resultCount !== undefined && (
              <span className="px-3 h-8 rounded-lg text-xs font-bold flex items-center bg-zinc-100 text-zinc-900">
                {resultCount} Results
              </span>
            )}
            {gameNames.length > 1 && allNames.map((name) => (
              <NameButton
                key={name}
                name={name}
                active={name === "All Games" ? activeFilter === "all" : activeFilter === name}
                onClick={() => select(name === "All Games" ? "all" : name)}
              />
            ))}
          </div>
        </Collapse>

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="absolute right-0 top-0 h-8 px-3 flex items-center gap-1 justify-center bg-zinc-800 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors z-102"
          >
            <span className="relative whitespace-nowrap inline-grid">
              <span className={`col-start-1 row-start-1 transition-opacity duration-500 ${expanded ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                +{hiddenCount} More Games
              </span>
              <span className={`col-start-1 row-start-1 transition-opacity duration-500 ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                {allNames.length} Total Games
              </span>
            </span>
            <ChevronIcon open={expanded} />
          </button>
        )}
      </div>
    </>
  );
};
