"use client"

import * as React from "react"
import { Dialog as DialogRoot } from "./atoms/Dialog"
import { DialogTrigger } from "./atoms/DialogTrigger"
import { DialogContent } from "./molecules/DialogContent"
import { DialogHeader } from "./atoms/DialogHeader"
import { DialogFooter } from "./molecules/DialogFooter"
import { DialogTitle } from "./atoms/DialogTitle"
import { DialogDescription } from "./atoms/DialogDescription"

type DialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  showCloseButton?: boolean
  showFooterClose?: boolean
  className?: string
  children: React.ReactNode
}

export const Dialog = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  showCloseButton = true,
  showFooterClose = false,
  className,
  children,
}: DialogProps) => (
  <DialogRoot open={open} onOpenChange={onOpenChange}>
    {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
    <DialogContent showCloseButton={showCloseButton} className={className}>
      {(title || description) && (
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}
      {children}
      {(footer || showFooterClose) && (
        <DialogFooter showCloseButton={showFooterClose}>
          {footer}
        </DialogFooter>
      )}
    </DialogContent>
  </DialogRoot>
)

