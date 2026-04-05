"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/shared/UI/Button";


export const ScrollToTop = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true) }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);

      const footer = document.querySelector("footer");
      const el = ref.current;
      if (!footer || !el) return;

      const footerRect = footer.getBoundingClientRect();
      const overlap = window.innerHeight - footerRect.top;

      el.style.bottom = overlap > 0 ? `${overlap + 10}px` : "8px";
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visible = scrolled;

  if (!mounted) return null;

  return createPortal(
    <div
      ref={ref}
      className={`fixed bottom-2 left-1/2 -translate-x-1/2 z-[9999] transition-opacity duration-500 ${
        visible
          ? "opacity-100"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <Button
        variant="outline"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-10! h-10! p-0! justify-center"
      >
        <ChevronDown className="size-3.5 rotate-180" />
      </Button>
    </div>,
    document.body,
  );
};
