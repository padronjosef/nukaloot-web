"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

export const CollapsibleTrigger = ({
  ...props
}: CollapsiblePrimitive.Trigger.Props) => (
  <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
)
