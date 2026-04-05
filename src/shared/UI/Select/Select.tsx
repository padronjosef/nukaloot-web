"use client"

import * as React from "react"
import { SelectRoot } from "./atoms/SelectRoot"
import { SelectTrigger } from "./atoms/SelectTrigger"
import { SelectValue } from "./atoms/SelectValue"
import { SelectContent } from "./molecules/SelectContent"
import { SelectGroup } from "./atoms/SelectGroup"
import { SelectItem } from "./atoms/SelectItem"
import { SelectLabel } from "./atoms/SelectLabel"
import { SelectSeparator } from "./atoms/SelectSeparator"

type SelectOption = {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

type SelectOptionGroup = {
  label?: string
  options: SelectOption[]
}

type SelectProps = {
  value?: string
  onValueChange?: (value: string | null) => void
  defaultValue?: string
  placeholder?: string
  options: (SelectOption | SelectOptionGroup)[]
  size?: "sm" | "default"
  className?: string
  disabled?: boolean
}

const isGroup = (item: SelectOption | SelectOptionGroup): item is SelectOptionGroup =>
  "options" in item

export const Select = ({
  value,
  onValueChange,
  defaultValue,
  placeholder,
  options,
  size = "default",
  className,
  disabled,
}: SelectProps) => (
  <SelectRoot value={value} onValueChange={onValueChange} defaultValue={defaultValue} disabled={disabled}>
    <SelectTrigger size={size} className={className}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((item, i) => {
        if (isGroup(item)) {
          return (
            <SelectGroup key={item.label ?? i}>
              {item.label && <SelectLabel>{item.label}</SelectLabel>}
              {item.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </SelectItem>
              ))}
              {i < options.length - 1 && <SelectSeparator />}
            </SelectGroup>
          )
        }
        return (
          <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </SelectItem>
        )
      })}
    </SelectContent>
  </SelectRoot>
)

