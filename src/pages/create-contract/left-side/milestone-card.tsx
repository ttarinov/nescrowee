import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import type { MilestoneForm } from "../types";

const TIMELINE_UNITS = ["days", "weeks"] as const;
type TimelineUnit = (typeof TIMELINE_UNITS)[number];

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

function timelineDisplayValue(daysStr: string, unit: TimelineUnit): string {
  const d = parseFloat(daysStr) || 0;
  if (unit === "days") return d ? String(Math.round(d)) : "";
  return d ? (d / 7).toFixed(1) : "";
}

function timelineToDays(value: string, unit: TimelineUnit): number {
  const n = parseFloat(value) || 0;
  if (unit === "days") return Math.round(n);
  return Math.round(n * 7);
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
  const [timelineUnit, setTimelineUnit] = useState<TimelineUnit>("days");
  const amount = parseFloat(milestone.amount) || 0;
  const hasAmount = milestone.amount && amount > 0;
  const numberLabel = String(index + 1).padStart(2, "0");
  const timelineInputValue = timelineDisplayValue(milestone.timelineDays, timelineUnit);

  const expandIfCollapsed = () => {
    if (!isActive) onSelect();
  };

  const handleTimelineChange = (value: string, unit: TimelineUnit) => {
    const days = timelineToDays(value, unit);
    onUpdate("timelineDays", String(days));
  };

  return (
    <div className="border-b border-border/50 last:border-b-0 px-3 py-2">
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        className="flex items-center gap-3 py-2 cursor-pointer transition-colors hover:bg-muted/20 rounded-md -mx-1 px-1"
      >
        <span className="text-muted-foreground font-mono text-xs w-6 shrink-0">{numberLabel}</span>
        <input
          value={milestone.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onFocus={expandIfCollapsed}
          className="bg-transparent text-sm font-medium text-foreground flex-1 min-w-0 placeholder:text-muted-foreground/60 focus:outline-none py-1"
          placeholder="Title"
        />
        <input
          type="number"
          step="0.01"
          min="0"
          value={milestone.amount}
          onChange={(e) => onUpdate("amount", e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onFocus={expandIfCollapsed}
          className="w-16 text-right bg-muted/60 px-2 py-1 rounded-lg border border-border/40 text-xs font-bold tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="0"
        />
        <span className="text-xs text-muted-foreground shrink-0">N</span>
        {totalCount > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <HugeiconsIcon icon={Delete01Icon} size={14} />
          </button>
        )}
      </div>
      {isActive && (
        <div className="pr-2 pb-4 pt-3 space-y-3 border-t border-border/30 mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number"
              min="0"
              step={timelineUnit === "days" ? "1" : "0.5"}
              placeholder={timelineUnit === "days" ? "Days" : "Weeks"}
              value={timelineInputValue}
              onChange={(e) => handleTimelineChange(e.target.value, timelineUnit)}
              onClick={(e) => e.stopPropagation()}
              className="h-9 w-24 text-sm font-mono bg-white/5 rounded-2xl px-4 py-2 text-foreground placeholder-white/30 focus:outline-none focus:bg-white/10 transition-colors border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <select
              value={timelineUnit}
              onChange={(e) => setTimelineUnit(e.target.value as TimelineUnit)}
              onClick={(e) => e.stopPropagation()}
              className="h-9 bg-white/5 rounded-2xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:bg-white/10 transition-colors border-0 cursor-pointer"
            >
              {TIMELINE_UNITS.map((u) => (
                <option key={u} value={u} className="bg-card text-foreground">
                  {u}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            placeholder="Description / acceptance criteria"
            value={milestone.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            rows={4}
            className="resize-none text-sm min-h-[100px] bg-white/5 rounded-2xl px-5 py-4 text-foreground placeholder-white/30 focus:outline-none focus:bg-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 border-0 transition-colors"
          />
          {hasAmount && (
            <div className="text-[10px] font-mono text-muted-foreground flex flex-wrap gap-3">
              <span className="text-foreground font-semibold">{amount.toFixed(2)} NEAR</span>
              <span>· {(amount * (disputeFundPct / 100)).toFixed(3)} NEAR dispute fund</span>
              {nearPrice && <span>· ≈{(amount * nearPrice).toFixed(2)} USDC</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
