"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "../../../lib/utils"

export const SelectValue = ({
  className,
  ...props
}: SelectPrimitive.Value.Props) => (
  <SelectPrimitive.Value
    data-slot="select-value"
    className={cn("flex flex-1 text-left", className)}
    {...props}
  />
)
