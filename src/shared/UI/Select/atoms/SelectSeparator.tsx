"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "../../../lib/utils"

export const SelectSeparator = ({
  className,
  ...props
}: SelectPrimitive.Separator.Props) => (
  <SelectPrimitive.Separator
    data-slot="select-separator"
    className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
)
