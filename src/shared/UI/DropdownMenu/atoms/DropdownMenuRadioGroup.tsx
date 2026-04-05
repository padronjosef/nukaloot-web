"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

export const DropdownMenuRadioGroup = ({
  ...props
}: MenuPrimitive.RadioGroup.Props) => (
  <MenuPrimitive.RadioGroup
    data-slot="dropdown-menu-radio-group"
    {...props}
  />
)
