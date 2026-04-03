"use client";

import { useState } from "react";
import { CloseButton } from "../../shared/atoms/CloseButton";

type ResultsToastProps = {
  resultCount: number;
  scraping: boolean;
  lastUpdated: Date | null;
  visible: boolean;
}

export const ResultsToast = ({
  resultCount,
  scraping,
  lastUpdated,
  visible,
}: ResultsToastProps) => {
  const [hiding, setHiding] = useState(false);
  const [dismissedFor, setDismissedFor] = useState<number | null>(null);

  const isDismissed = dismissedFor === resultCount;

  if (!visible || isDismissed) return null;

  const dismiss = () => {
    setHiding(true);
    setTimeout(() => {
      setDismissedFor(resultCount);
      setHiding(false);
    }, 300);
  };

  return (
    <div
      className={`fixed bottom-2 md:bottom-6 left-0 right-0 z-200 flex justify-center pointer-events-none transition-all duration-300 ${
        hiding ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="w-full max-w-5xl flex justify-end pointer-events-none">
        <div
          className={`pointer-events-auto flex items-center justify-between md:justify-start gap-2 bg-zinc-800 rounded-lg px-4 py-2.5 shadow-2xl text-sm text-zinc-300 transition-colors duration-300 w-full md:w-auto ${
            scraping
              ? "border-loading"
              : lastUpdated
                ? "border border-green-700"
                : "border border-zinc-700"
          }`}
        >
          <span className="leading-7">
            <span className="font-bold text-white">{resultCount}</span> Results
          </span>
          <div className="flex items-center gap-2 leading-7">
            {scraping && (
              <>
                <span className="hidden md:inline text-zinc-600">·</span>
                <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-blue-400">Scraping More Stores...</span>
              </>
            )}
            {!scraping && lastUpdated && (
              <>
                <span className="hidden md:inline text-zinc-600">·</span>
                <span className="text-zinc-400">
                  Updated{" "}
                  {lastUpdated.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </>
            )}
            <CloseButton onClick={dismiss} className="ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
