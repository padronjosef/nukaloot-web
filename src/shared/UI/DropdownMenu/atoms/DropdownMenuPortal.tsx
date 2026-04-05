"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export const DropdownMenuPortal = ({ ...props }: MenuPrimitive.Portal.Props) => (
  <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
)
