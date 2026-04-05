"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export const DropdownMenuRoot = ({ ...props }: MenuPrimitive.Root.Props) => (
  <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
)
