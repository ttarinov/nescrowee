import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Active: "bg-primary/15 text-primary border-primary/30",
  Completed: "bg-success/15 text-success border-success/30",
  Disputed: "bg-destructive/15 text-destructive border-destructive/30",
  Resolved: "bg-accent/15 text-accent border-accent/30",
  Pending: "bg-muted text-muted-foreground",
  InProgress: "bg-primary/15 text-primary border-primary/30",
  NotFunded: "bg-muted text-muted-foreground",
  Funded: "bg-warning/15 text-warning border-warning/30",
  AiResolved: "bg-accent/15 text-accent border-accent/30",
  Appealed: "bg-warning/15 text-warning border-warning/30",
  AppealResolved: "bg-accent/15 text-accent border-accent/30",
  Finalized: "bg-success/15 text-success border-success/30",
};

const statusLabels: Record<string, string> = {
  NotFunded: "Not Funded",
  InProgress: "In Progress",
  AiResolved: "AI Resolved",
  AppealResolved: "Appeal Resolved",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium",
      statusStyles[status] || "bg-muted text-muted-foreground"
    )}
  >
    {statusLabels[status] || status.replace(/([A-Z])/g, " $1").trim()}
  </span>
);

export default StatusBadge;
