"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

export const DialogClose = ({ ...props }: DialogPrimitive.Close.Props) => (
  <DialogPrimitive.Close data-slot="dialog-close" {...props} />
)
