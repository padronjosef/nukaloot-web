"use client"

import * as React from "react"
import { CollapsibleRoot } from "./atoms/CollapsibleRoot"
import { CollapsibleTrigger } from "./atoms/CollapsibleTrigger"
import { CollapsibleContent } from "./atoms/CollapsibleContent"

type CollapsibleProps = {
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  className?: string
  children: React.ReactNode
}

export const Collapsible = ({
  trigger,
  open,
  onOpenChange,
  defaultOpen,
  className,
  children,
}: CollapsibleProps) => (
  <CollapsibleRoot open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} className={className}>
    <CollapsibleTrigger>{trigger}</CollapsibleTrigger>
    <CollapsibleContent>{children}</CollapsibleContent>
  </CollapsibleRoot>
)

