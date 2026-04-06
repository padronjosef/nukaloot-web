"use client";

import { useState, useMemo } from "react";
import { Collapse } from "@/app/components/shared/atoms/Collapse";
import { Button } from "@/shared/UI/Button";
import { ChevronDown, Search, X } from "lucide-react";
import { useResultCount } from "@/shared/stores/selectors";
import { motion } from "motion/react";

type GameNameFilterProps = {
  gameNames: string[];
  activeFilter: string;
  onFilterChange: (name: string) => void;
  storeSlot?: React.ReactNode;
};

export const GameNameFilter = ({
  gameNames,
  activeFilter,
  onFilterChange,
  storeSlot,
}: GameNameFilterProps) => {
  const resultCount = useResultCount();
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return gameNames;
    const q = search.toLowerCase();
    return gameNames.filter((n) => n.toLowerCase().includes(q));
  }, [gameNames, search]);

  if (gameNames.length <= 1 && !resultCount) return null;

  const select = (name: string) => {
    onFilterChange(name);
    setExpanded(false);
    setSearch("");
  };

  return (
    <>
      {/* Trigger row */}
      <div className="flex items-center gap-2 flex-wrap">
        {resultCount !== undefined && (
          <Button variant="default" className="pointer-events-none">
            {resultCount} Results
          </Button>
        )}

        {gameNames.length > 1 && (
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          >
            <Button
              variant="default"
              onClick={() => setExpanded(!expanded)}
              className="max-w-[200px] md:max-w-[250px] overflow-hidden"
            >
              <span className="truncate">{activeFilter === "all" ? "All Games" : activeFilter}</span>
              <ChevronDown
                className={`size-3 shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              />
            </Button>
          </motion.div>
        )}

        {storeSlot}
      </div>

      {/* Collapse - rendered via portal-like pattern in parent */}
      {gameNames.length > 1 && (
        <Collapse
          open={expanded}
          maxHeight="300px"
          className="w-full mt-2 order-last"
        >
          <div className="p-2 bg-muted border border-border rounded-lg">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search games..."
                className="w-full h-8 pl-8 pr-8 text-sm bg-background border border-border rounded-md outline-none placeholder:text-muted-foreground focus:border-ring"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center rounded-md bg-foreground text-background cursor-pointer hover:bg-foreground/80 transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              {!search.trim() && (
                <Button
                  onClick={() => select("all")}
                  variant={activeFilter == "all" ? "default" : "outline"}
                  className="justify-start"
                >
                  All Games
                </Button>
              )}

              {filtered.map((name) => (
                <Button
                  key={name}
                  onClick={() => select(name)}
                  variant={activeFilter === name ? "default" : "outline"}
                  className="min-w-0 max-w-[calc(100vw-48px)] overflow-hidden justify-start"
                >
                  <span className="truncate">{name}</span>
                </Button>
              ))}

              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground px-1 py-2">No games found</p>
              )}
            </div>
          </div>
        </Collapse>
      )}
    </>
  );
};
