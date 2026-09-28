import { cn } from "@/shared/lib/utils";

export const Table = ({ className, ...props }: React.ComponentProps<"table">) => (
  <div className="w-full overflow-x-auto">
    <table
      className={cn("w-full border-collapse text-sm", className)}
      {...props}
    />
  </div>
);

export const Th = ({ className, ...props }: React.ComponentProps<"th">) => (
  <th
    className={cn(
      "px-4 py-2 text-left text-xs font-medium whitespace-nowrap text-muted-foreground",
      className,
    )}
    {...props}
  />
);

export const Td = ({ className, ...props }: React.ComponentProps<"td">) => (
  <td
    className={cn(
      "border-t border-border px-4 py-2 text-foreground",
      className,
    )}
    {...props}
  />
);
