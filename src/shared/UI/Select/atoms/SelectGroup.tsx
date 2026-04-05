"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "../../../lib/utils"

export const SelectGroup = ({
  className,
  ...props
}: SelectPrimitive.Group.Props) => (
  <SelectPrimitive.Group
    data-slot="select-group"
    className={cn("scroll-my-1 p-1", className)}
    {...props}
  />
)
