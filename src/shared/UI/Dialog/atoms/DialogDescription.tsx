"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "../../../lib/utils"

export const DialogDescription = ({
  className,
  ...props
}: DialogPrimitive.Description.Props) => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    className={cn(
      "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
      className
    )}
    {...props}
  />
)
