"use client"

import * as React from "react"
import { DropdownMenuRoot } from "./atoms/DropdownMenuRoot"
import { DropdownMenuTrigger } from "./atoms/DropdownMenuTrigger"
import { DropdownMenuContent } from "./atoms/DropdownMenuContent"
import { DropdownMenuItem } from "./atoms/DropdownMenuItem"
import { DropdownMenuSeparator } from "./atoms/DropdownMenuSeparator"
import { DropdownMenuLabel } from "./atoms/DropdownMenuLabel"
import { DropdownMenuGroup } from "./atoms/DropdownMenuGroup"
import { DropdownMenuCheckboxItem } from "./atoms/DropdownMenuCheckboxItem"

type DropdownItemBase = {
  key: string
  label: React.ReactNode
  icon?: React.ReactNode
  variant?: "default" | "destructive"
  disabled?: boolean
  onSelect?: () => void
}

type DropdownCheckboxItemBase = {
  key: string
  label: React.ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

type DropdownItemGroupBase = {
  label?: string
  items: (DropdownItemBase | DropdownCheckboxItemBase)[]
}

type DropdownMenuProps = {
  trigger: React.ReactNode
  items: (DropdownItemBase | DropdownCheckboxItemBase | DropdownItemGroupBase)[]
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

const isGroup = (
  item: DropdownItemBase | DropdownCheckboxItemBase | DropdownItemGroupBase
): item is DropdownItemGroupBase => "items" in item

const isCheckbox = (
  item: DropdownItemBase | DropdownCheckboxItemBase
): item is DropdownCheckboxItemBase => "checked" in item

const renderItem = (item: DropdownItemBase | DropdownCheckboxItemBase) => {
  if (isCheckbox(item)) {
    return (
      <DropdownMenuCheckboxItem
        key={item.key}
        checked={item.checked}
        onCheckedChange={item.onCheckedChange}
        disabled={item.disabled}
      >
        {item.label}
      </DropdownMenuCheckboxItem>
    )
  }

  return (
    <DropdownMenuItem
      key={item.key}
      variant={item.variant}
      disabled={item.disabled}
      onClick={item.onSelect}
    >
      {item.icon}
      {item.label}
    </DropdownMenuItem>
  )
}

export const DropdownMenu = ({
  trigger,
  items,
  align = "start",
  side = "bottom",
  className,
}: DropdownMenuProps) => (
  <DropdownMenuRoot>
    <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
    <DropdownMenuContent align={align} side={side} className={className}>
      {items.map((item, i) => {
        if (isGroup(item)) {
          return (
            <React.Fragment key={item.label ?? i}>
              <DropdownMenuGroup>
                {item.label && <DropdownMenuLabel>{item.label}</DropdownMenuLabel>}
                {item.items.map(renderItem)}
              </DropdownMenuGroup>
              {i < items.length - 1 && <DropdownMenuSeparator />}
            </React.Fragment>
          )
        }
        return renderItem(item)
      })}
    </DropdownMenuContent>
  </DropdownMenuRoot>
)

