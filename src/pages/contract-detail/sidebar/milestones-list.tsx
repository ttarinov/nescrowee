import { Progress } from "@/components/ui/progress";
import { MilestoneItem } from "./milestone-item";
import type { EscrowContract } from "@/types/escrow";
import type { ContractActions, ActionsPending } from "../useContractActions";

interface MilestonesListProps {
  contract: EscrowContract;
  isClient: boolean;
  isFreelancer: boolean;
  actions: ContractActions;
  pending: ActionsPending;
  onOpenDispute: (milestoneId: string) => void;
}

export function MilestonesList({
  contract,
  isClient,
  isFreelancer,
  actions,
  pending,
  onOpenDispute,
}: MilestonesListProps) {
  const completed = contract.milestones.filter((m) => m.status === "Completed").length;
  const progress = contract.milestones.length > 0 ? (completed / contract.milestones.length) * 100 : 0;

  return (
    <div className="pt-4 border-t border-white/12 space-y-0">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-white">Milestones</h2>
        <span className="text-xs font-mono text-white/50">
          {completed}/{contract.milestones.length}
        </span>
      </div>
      <Progress value={progress} className="h-2 mb-3 [&>div]:bg-primary" />
      <div className="rounded-2xl overflow-hidden">
        {contract.milestones.map((milestone, i) => (
          <MilestoneItem
            key={milestone.id}
            milestone={milestone}
            index={i}
            contractId={contract.id}
            securityPct={contract.security_deposit_pct}
            isClient={isClient}
            isFreelancer={isFreelancer}
            actions={actions}
            pending={pending}
            onOpenDispute={onOpenDispute}
          />
        ))}
      </div>
    </div>
  );
}
