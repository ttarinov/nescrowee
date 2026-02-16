import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon } from "@hugeicons/core-free-icons";
import type { MilestoneForm } from "../types";

interface MilestoneCardProps {
  milestone: MilestoneForm;
  index: number;
  totalCount: number;
  isActive: boolean;
  disputeFundPct: number;
  nearPrice: number | null;
  onUpdate: (field: keyof MilestoneForm, value: string) => void;
  onRemove: () => void;
  onSelect: () => void;
}

export function MilestoneCard({
  milestone,
  index,
  totalCount,
  isActive,
  disputeFundPct,
  nearPrice,
  onUpdate,
  onRemove,
  onSelect,
}: MilestoneCardProps) {
  const amount = parseFloat(milestone.amount) || 0;
  const hasAmount = milestone.amount && amount > 0;
  const numberLabel = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      className="rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        className={`flex items-center gap-3 py-3 px-4 cursor-pointer transition-colors ${
          isActive ? "bg-muted/50" : "hover:bg-muted/30"
        }`}
      >
        <span className="text-muted-foreground font-mono text-xs w-6 shrink-0">{numberLabel}</span>
        <Input
          value={milestone.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="bg-transparent border-0 shadow-none focus-visible:ring-0 py-0 h-auto text-sm font-medium flex-1 min-w-0 placeholder:text-muted-foreground/60"
          placeholder="Deliverable"
        />
        <Input
          type="number"
          step="0.01"
          min="0"
          value={milestone.amount}
          onChange={(e) => onUpdate("amount", e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-20 h-8 text-xs font-bold tabular-nums px-2 py-1 shrink-0 bg-muted/80 border-border/50"
          placeholder="0"
        />
        <span className="text-xs text-muted-foreground shrink-0">NEAR</span>
        {totalCount > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
          >
            <HugeiconsIcon icon={Delete01Icon} size={14} />
          </button>
        )}
      </div>
      {isActive && (
        <div className="p-4 bg-card space-y-3">
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="Timeline (days)"
            value={milestone.timelineDays}
            onChange={(e) => onUpdate("timelineDays", e.target.value)}
            className="h-9 text-sm font-mono w-32"
          />
          <Textarea
            placeholder="Description / acceptance criteria"
            value={milestone.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            rows={2}
            className="resize-none text-sm"
          />
          {hasAmount && (
            <div className="text-[10px] font-mono text-muted-foreground flex flex-wrap gap-3">
              <span className="text-foreground font-semibold">{amount.toFixed(2)} NEAR</span>
              <span>· {(amount * (disputeFundPct / 100)).toFixed(3)} NEAR dispute fund</span>
              {nearPrice && <span>· ≈${(amount * nearPrice).toFixed(0)} USD</span>}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
