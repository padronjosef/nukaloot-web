"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "../../../lib/utils"

export const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) => (
  <MenuPrimitive.GroupLabel
    data-slot="dropdown-menu-label"
    data-inset={inset}
    className={cn(
      "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
      className
    )}
    {...props}
  />
)
