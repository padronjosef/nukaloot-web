"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "../../../lib/utils"

export const DialogTitle = ({
  className,
  ...props
}: DialogPrimitive.Title.Props) => (
  <DialogPrimitive.Title
    data-slot="dialog-title"
    className={cn(
      "font-heading text-base leading-none font-medium",
      className
    )}
    {...props}
  />
)
