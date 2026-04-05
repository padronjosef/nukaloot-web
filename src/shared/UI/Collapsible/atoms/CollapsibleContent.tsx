"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

export const CollapsibleContent = ({
  ...props
}: CollapsiblePrimitive.Panel.Props) => (
  <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
)
