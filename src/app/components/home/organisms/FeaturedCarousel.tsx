"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";

type FeaturedGame = {
  name: string;
  appId: number;
  image: string;
  finalPrice?: number;
  discountPercent?: number;
}

type FeaturedCarouselProps = {
  games: FeaturedGame[];
  onSelect: (name: string) => void;
}

const FeaturedCard = ({
  game,
  onSelect,
  priority = false,
}: {
  game: FeaturedGame;
  onSelect: (name: string) => void;
  priority?: boolean;
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="flex flex-col shrink-0 w-48 md:w-56 cursor-pointer"
      onClick={() => onSelect(game.name)}
    >
      <div className="relative aspect-[3/4] rounded-t-lg overflow-hidden bg-background/90 border border-b-0 border-border/50 hover:border-border transition-colors group">
        {!game.image || imgError ? (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <Gamepad2 className="size-12 text-muted-foreground/40" />
          </div>
        ) : (
          <Image
            src={game.image}
            alt={game.name}
            fill
            sizes="(max-width: 768px) 192px, 224px"
            priority={priority}
            onError={() => setImgError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        )}
        {game.discountPercent && game.discountPercent > 0 && (
          <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded bg-primary text-primary-foreground">
            -{game.discountPercent}%
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 bg-background/90 rounded-b-lg border border-t-0 border-border/50 px-3 py-2">
        <h3 className="text-sm font-bold text-foreground line-clamp-1">
          {game.name}
        </h3>
        <div className="flex items-center justify-between">
          {game.finalPrice !== undefined && game.finalPrice > 0 ? (
            <span className="text-base font-bold text-foreground">
              ${game.finalPrice.toFixed(2)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Free / N/A</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const FeaturedCarousel = ({
  games,
  onSelect,
}: FeaturedCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const hasDragged = useRef(false);

  const doubled = useMemo(() => [...games, ...games], [games]);

  const autoScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || hovering.current || dragging.current) return;
    el.scrollLeft += 0.6;
    if (el.scrollLeft >= el.scrollWidth / 2) {
      el.scrollLeft = 0;
    }
  }, []);

  useEffect(() => {
    if (games.length === 0) return;
    let id: number;
    const step = () => {
      autoScroll();
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [games, autoScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onEnter = () => { hovering.current = true; };
    const onLeave = () => {
      hovering.current = false;
      if (dragging.current) {
        dragging.current = false;
        el.style.cursor = "grab";
      }
    };
    const onDown = (e: MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      hasDragged.current = false;
      startX.current = e.pageX;
      startScroll.current = el.scrollLeft;
      el.style.cursor = "grabbing";
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.pageX - startX.current;
      if (Math.abs(dx) > 3) hasDragged.current = true;
      el.scrollLeft = startScroll.current - dx;
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      el.style.cursor = "grab";
      if (hasDragged.current) {
        const suppress = (e: Event) => { e.stopPropagation(); e.preventDefault(); };
        el.addEventListener("click", suppress, { capture: true, once: true });
      }
    };

    el.style.cursor = "grab";
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [games]);

  if (games.length === 0) return null;

  return (
    <div className="w-full relative z-10 mb-10 mx-auto max-w-5xl px-4">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-foreground">Trending on Steam</h2>
        <p className="text-sm text-muted-foreground mt-1">The hottest games right now.</p>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 select-none"
        style={{
          scrollbarWidth: "none",
          maskImage: "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)",
        }}
      >
        {doubled.map((game, i) => (
          <FeaturedCard
            key={`${game.appId}-${i}`}
            game={game}
            onSelect={onSelect}
            priority={i < 5}
          />
        ))}
      </div>
    </div>
  );
};
