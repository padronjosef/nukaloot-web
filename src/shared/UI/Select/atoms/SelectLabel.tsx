"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "../../../lib/utils"

export const SelectLabel = ({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) => (
  <SelectPrimitive.GroupLabel
    data-slot="select-label"
    className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
    {...props}
  />
)
