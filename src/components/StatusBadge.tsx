import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/15 text-primary border-primary/30",
  completed: "bg-success/15 text-success border-success/30",
  disputed: "bg-destructive/15 text-destructive border-destructive/30",
  resolved: "bg-accent/15 text-accent border-accent/30",
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  assigned: "bg-warning/15 text-warning border-warning/30",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium capitalize",
      statusStyles[status] || "bg-muted text-muted-foreground"
    )}
  >
    {status.replace("_", " ")}
  </span>
);

export default StatusBadge;
