"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export const DropdownMenuSub = ({ ...props }: MenuPrimitive.SubmenuRoot.Props) => (
  <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
)
