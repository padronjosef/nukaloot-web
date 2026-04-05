"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

export const CollapsibleRoot = ({ ...props }: CollapsiblePrimitive.Root.Props) => (
  <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
)
