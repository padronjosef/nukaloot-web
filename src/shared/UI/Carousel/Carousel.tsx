"use client"

import * as React from "react"
import type { CarouselApi } from "./atoms/CarouselTypes"
import { CarouselRoot } from "./molecules/CarouselRoot"
import { CarouselContent } from "./atoms/CarouselContent"
import { CarouselItem } from "./atoms/CarouselItem"
import { CarouselPrevious } from "./molecules/CarouselPrevious"
import { CarouselNext } from "./molecules/CarouselNext"

type CarouselProps = {
  items: React.ReactNode[]
  orientation?: "horizontal" | "vertical"
  showControls?: boolean
  loop?: boolean
  className?: string
  itemClassName?: string
  setApi?: (api: CarouselApi) => void
}

export const Carousel = ({
  items,
  orientation = "horizontal",
  showControls = true,
  loop = false,
  className,
  itemClassName,
  setApi,
}: CarouselProps) => (
  <CarouselRoot
    orientation={orientation}
    opts={{ loop }}
    setApi={setApi}
    className={className}
  >
    <CarouselContent>
      {items.map((item, i) => (
        <CarouselItem key={i} className={itemClassName}>
          {item}
        </CarouselItem>
      ))}
    </CarouselContent>
    {showControls && (
      <>
        <CarouselPrevious />
        <CarouselNext />
      </>
    )}
  </CarouselRoot>
)

