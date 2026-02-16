import { DescriptionSection } from "./description-section";
import { MilestonesSection } from "./milestones-section";
import type { MilestoneForm } from "../types";

interface LeftSideProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  milestones: MilestoneForm[];
  activeMilestoneId: string | null;
  onActiveMilestoneIdChange: (id: string | null) => void;
  disputeFundPct: number;
  nearPrice: number | null;
  onAddMilestone: () => void;
  onRemoveMilestone: (id: string) => void;
  onUpdateMilestone: (id: string, field: keyof MilestoneForm, value: string) => void;
}

export function LeftSide({
  description,
  onDescriptionChange,
  milestones,
  activeMilestoneId,
  onActiveMilestoneIdChange,
  disputeFundPct,
  nearPrice,
  onAddMilestone,
  onRemoveMilestone,
  onUpdateMilestone,
}: LeftSideProps) {
  return (
    <div className="space-y-5">
      <DescriptionSection value={description} onChange={onDescriptionChange} />
      <MilestonesSection
        milestones={milestones}
        activeMilestoneId={activeMilestoneId}
        onActiveMilestoneIdChange={onActiveMilestoneIdChange}
        disputeFundPct={disputeFundPct}
        nearPrice={nearPrice}
        onAdd={onAddMilestone}
        onRemove={onRemoveMilestone}
        onUpdate={onUpdateMilestone}
      />
    </div>
  );
}

export { PageHeader } from "./page-header";
export { DescriptionSection } from "./description-section";
export { MilestonesSection } from "./milestones-section";
export { MilestoneCard } from "./milestone-card";
