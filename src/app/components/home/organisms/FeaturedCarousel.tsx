"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { API_URL } from "@/app/lib/stores";
import { FeaturedCarouselSkeleton } from "./FeaturedCarouselSkeleton";

type FeaturedGame = {
  name: string;
  appId: number;
  image: string;
}

type FeaturedCarouselProps = {
  onSelect: (name: string) => void;
  onRateLimited?: () => void;
}

export const FeaturedCarousel = ({
  onSelect,
  onRateLimited,
}: FeaturedCarouselProps) => {
  const [games, setGames] = useState<FeaturedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/games/featured`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.rateLimited) onRateLimited?.();
        setGames(
          Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
              ? data
              : [],
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [onRateLimited]);

  // Auto-scroll + drag
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    const autoSpeed = 0.5;
    let dragging = false;
    let hovering = false;
    let startX = 0;
    let startScroll = 0;
    let hasDragged = false;

    const step = () => {
      if (!el) return;
      if (!dragging && !hovering) {
        el.scrollLeft += autoSpeed;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);

    const handleEnter = () => {
      hovering = true;
    };
    const handleLeave = () => {
      hovering = false;
      if (dragging) {
        dragging = false;
        el.style.cursor = "grab";
      }
    };

    const handleDown = (e: MouseEvent) => {
      e.preventDefault();
      dragging = true;
      hasDragged = false;
      startX = e.pageX;
      startScroll = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const handleMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 3) hasDragged = true;
      el.scrollLeft = startScroll - dx;
    };

    const handleUp = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "grab";
      if (hasDragged) {
        const suppress = (e: Event) => {
          e.stopPropagation();
          e.preventDefault();
        };
        el.addEventListener("click", suppress, { capture: true, once: true });
      }
    };

    el.style.cursor = "grab";
    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    el.addEventListener("mousedown", handleDown);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
      el.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [games, loading]);

  const doubled = useMemo(() => [...games, ...games], [games]);

  if (loading) return <FeaturedCarouselSkeleton />;

  return (
    <div
      className="w-full relative z-10 mb-10 mx-auto"
      style={{ maxWidth: 1400 }}
    >
      <div className="max-w-5xl mx-auto px-4 mb-3">
        <h2 className="text-lg font-bold text-white">
          <span className="bg-black/70 px-2 py-1 rounded">
            Trending on Steam
          </span>
        </h2>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-auto px-4 select-none"
        style={{
          scrollbarWidth: "none",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 13.5%, black 86.5%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 13.5%, black 86.5%, transparent 100%)",
        }}
      >
        {doubled.map((game, i) => (
            <button
              key={`${game.appId}-${i}`}
              onClick={() => onSelect(game.name)}
              className="group shrink-0 relative w-65 md:w-100 aspect-video rounded-lg overflow-hidden cursor-pointer flex flex-col justify-start"
            >
              <Image
                src={game.image}
                alt={game.name}
                fill
                loading="eager"
                sizes="(max-width: 768px) 260px, 400px"
                className="object-cover group-hover:scale-110 transition-all duration-500 ease-out"
              />
              <div className="relative p-3">
                <span className="bg-black/70 text-white text-sm font-bold px-2 py-1 rounded leading-snug line-clamp-2 block w-fit">
                  {game.name}
                </span>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};
