import { cn } from "../lib/utils"

type SkeletonProps = React.ComponentProps<"div">

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    data-slot="skeleton"
    className={cn("animate-pulse rounded-md bg-muted", className)}
    {...props}
  />
)

