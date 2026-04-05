"use client"

import * as React from "react"
import { TooltipRoot } from "./atoms/TooltipRoot"
import { TooltipTrigger } from "./atoms/TooltipTrigger"
import { TooltipContent } from "./atoms/TooltipContent"
import { TooltipProvider } from "./atoms/TooltipProvider"

type TooltipProps = {
  content: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  children: React.ReactNode
}

export const Tooltip = ({ content, side = "top", align = "center", children }: TooltipProps) => (
  <TooltipProvider>
    <TooltipRoot>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {content}
      </TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
)

