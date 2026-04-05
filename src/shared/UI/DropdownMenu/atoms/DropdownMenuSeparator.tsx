"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "../../../lib/utils"

export const DropdownMenuSeparator = ({
  className,
  ...props
}: MenuPrimitive.Separator.Props) => (
  <MenuPrimitive.Separator
    data-slot="dropdown-menu-separator"
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
)
