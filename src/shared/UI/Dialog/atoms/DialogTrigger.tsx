"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

export const DialogTrigger = ({ ...props }: DialogPrimitive.Trigger.Props) => (
  <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
)
