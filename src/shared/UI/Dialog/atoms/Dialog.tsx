"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

export const Dialog = ({ ...props }: DialogPrimitive.Root.Props) => (
  <DialogPrimitive.Root data-slot="dialog" {...props} />
)
