"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

export const DialogPortal = ({ ...props }: DialogPrimitive.Portal.Props) => (
  <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
)
