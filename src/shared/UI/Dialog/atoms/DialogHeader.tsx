"use client"

import * as React from "react"

import { cn } from "../../../lib/utils"

export const DialogHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="dialog-header"
    className={cn("flex flex-col gap-2", className)}
    {...props}
  />
)
