"use client";

import { useState, useEffect } from "react";
import { CloseButton } from "../../shared/atoms/CloseButton";

type ResultsToastProps = {
  resultCount: number;
  scraping: boolean;
  lastUpdated: Date | null;
  visible: boolean;
};

export const ResultsToast = ({
  resultCount,
  scraping,
  lastUpdated,
  visible,
}: ResultsToastProps) => {
  const [hiding, setHiding] = useState(false);
  const [dismissedFor, setDismissedFor] = useState<number | null>(null);

  const isDismissed = dismissedFor === resultCount;

  const dismiss = () => {
    setHiding(true);
    setTimeout(() => {
      setDismissedFor(resultCount);
      setHiding(false);
    }, 300);
  };

  useEffect(() => {
    if (!lastUpdated || scraping) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdated, scraping]);

  if (!visible || isDismissed) return null;

  return (
    <div
      className={`fixed bottom-2 md:bottom-6 left-0 right-0 z-200 flex justify-center pointer-events-none transition-all duration-300 ${
        hiding ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="w-full max-w-5xl px-4 flex justify-end pointer-events-none">
        <div
          className={`pointer-events-auto flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2.5 shadow-2xl text-sm text-zinc-300 transition-colors duration-300 ${
            scraping
              ? "border-loading"
              : lastUpdated
                ? "border border-green-700"
                : "border border-zinc-700"
          }`}
        >
          {lastUpdated && (
            <span className="text-white font-bold whitespace-nowrap">
              Scraped At{" "}
              {lastUpdated.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <CloseButton onClick={dismiss} />
        </div>
      </div>
    </div>
  );
};
