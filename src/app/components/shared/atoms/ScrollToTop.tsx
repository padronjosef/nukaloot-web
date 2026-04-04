"use client";

import { useState, useEffect } from "react";
import { ChevronIcon } from "./ChevronIcon";
import { Button } from "./Button";
import { useUIStore } from "@/app/stores/useUIStore";

export const ScrollToTop = () => {
  const [scrolled, setScrolled] = useState(false);
  const toastVisible = useUIStore((s) => s.toastVisible);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
      setScrolled(scrollPercent > 0.2);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visible = scrolled && !toastVisible;

  return (
    <div
      className={`fixed bottom-2 left-1/2 -translate-x-1/2 z-200 transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <Button
        variant="dark"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="!w-10 !h-10 !p-0 justify-center"
      >
        <ChevronIcon open={true} size={14} />
      </Button>
    </div>
  );
};
