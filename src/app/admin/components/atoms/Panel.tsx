import { cn } from "@/shared/lib/utils";

type PanelProps = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const Panel = ({ title, action, children, className }: PanelProps) => (
  <section
    className={cn(
      "flex flex-col overflow-hidden rounded-xl border border-border bg-card",
      className,
    )}
  >
    <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      {action}
    </header>
    {children}
  </section>
);

export const PanelEmpty = ({ children }: { children: React.ReactNode }) => (
  <div className="m-4 flex items-center justify-center rounded-lg border border-dashed border-border px-4 py-8">
    <p className="text-sm text-muted-foreground italic">{children}</p>
  </div>
);
