import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { MilestoneCard } from "./milestone-card";
import type { MilestoneForm } from "../types";

interface MilestonesSectionProps {
  milestones: MilestoneForm[];
  activeMilestoneId: string | null;
  onActiveMilestoneIdChange: (id: string | null) => void;
  disputeFundPct: number;
  nearPrice: number | null;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof MilestoneForm, value: string) => void;
}

export function MilestonesSection({
  milestones,
  activeMilestoneId,
  onActiveMilestoneIdChange,
  disputeFundPct,
  nearPrice,
  onAdd,
  onRemove,
  onUpdate,
}: MilestonesSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Milestones</span>
        <button
          type="button"
          onClick={onAdd}
          className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={14} />
        </button>
      </div>
      <div className="rounded-lg border border-border/50 overflow-hidden">
        {milestones.map((m, i) => (
          <MilestoneCard
            key={m.id}
            milestone={m}
            index={i}
            totalCount={milestones.length}
            isActive={activeMilestoneId === m.id}
            disputeFundPct={disputeFundPct}
            nearPrice={nearPrice}
            onUpdate={(field, value) => onUpdate(m.id, field, value)}
            onRemove={() => onRemove(m.id)}
            onSelect={() => onActiveMilestoneIdChange(activeMilestoneId === m.id ? null : m.id)}
          />
        ))}
      </div>
    </div>
  );
}
