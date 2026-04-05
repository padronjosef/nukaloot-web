"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export const DropdownMenuTrigger = ({ ...props }: MenuPrimitive.Trigger.Props) => (
  <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
)
