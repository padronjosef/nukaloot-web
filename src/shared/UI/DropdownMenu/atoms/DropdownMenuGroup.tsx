"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export const DropdownMenuGroup = ({ ...props }: MenuPrimitive.Group.Props) => (
  <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
)
