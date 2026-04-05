"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

export const TooltipTrigger = ({ ...props }: TooltipPrimitive.Trigger.Props) => (
  <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
)
