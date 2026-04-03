type SkeletonProps = {
  className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => {
  return (
    <div className={`bg-zinc-800 rounded-lg animate-pulse ${className}`} />
  );
};
