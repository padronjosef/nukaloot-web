import { cn } from "@/shared/lib/utils";

type StatTileProps = {
  label: string;
  value: string;
  hint?: string;
  className?: string;
};

export const StatTile = ({ label, value, hint, className }: StatTileProps) => (
  <div
    className={cn(
      "rounded-xl border border-border bg-card px-4 py-3.5",
      className,
    )}
  >
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="mt-1 font-heading text-2xl leading-none tabular-nums text-foreground">
      {value}
    </p>
    {hint ? (
      <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
    ) : null}
  </div>
);
