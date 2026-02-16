import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
        <Label className="text-base font-semibold">Milestones *</Label>
        <Button type="button" variant="ghost" size="sm" onClick={onAdd}>
          <HugeiconsIcon icon={PlusSignIcon} size={16} className="mr-1" /> Add
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Each milestone is funded and released independently. Click a row to edit description and timeline.
      </p>
      <div className="space-y-1">
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
