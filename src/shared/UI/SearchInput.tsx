"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { Search, X } from "lucide-react";
import { cn } from "../lib/utils";

type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "onSubmit"
> & {
  onClear?: () => void;
  onSubmit?: () => void;
  expandOpen?: boolean;
  expandContent?: React.ReactNode;
  endSlot?: React.ReactNode;
};

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      onClear,
      onSubmit,
      expandOpen,
      expandContent,
      endSlot,
      value,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = React.useState(false);
    const isDisabled = !value || String(value).trim().length < 2;

    return (
      <div className="relative w-full">
        <div className="flex items-center ring-ring/50 transition-shadow focus-within:ring-3 focus-within:border-ring">
          <div className="relative flex-1 overflow-visible">
            <InputPrimitive
              ref={ref}
              type="search"
              data-slot="input"
              value={value}
              onKeyDown={(e) => {
                if (e.key === "Enter" && onSubmit) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              className={cn(
                "h-10! w-full min-w-0 rounded-l-lg border-none bg-muted pl-3 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 md:text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
                endSlot ? "pr-44" : "pr-11",
                className,
              )}
              {...props}
              onFocus={(e) => {
                setFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                props.onBlur?.(e);
              }}
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 pr-2">
              {onClear && (
                <div
                  className={`transition-all duration-300 ${focused && value ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"}`}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onClear}
                    className="size-6 flex items-center justify-center rounded-md bg-foreground text-background cursor-pointer hover:bg-foreground/80 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
              {endSlot}
            </div>
          </div>

          <button
            type="button"
            onClick={isDisabled ? undefined : onSubmit}
            className="h-10! px-4 rounded-r-lg flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer"
          >
            <Search className="size-4 transition-colors duration-500" />
          </button>
        </div>

        {expandOpen && expandContent && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-muted border border-border rounded-lg shadow-2xl z-100 py-1">
            {expandContent}
          </div>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
