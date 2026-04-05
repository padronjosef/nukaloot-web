"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

export const TooltipRoot = ({ ...props }: TooltipPrimitive.Root.Props) => (
  <TooltipPrimitive.Root data-slot="tooltip" {...props} />
)
