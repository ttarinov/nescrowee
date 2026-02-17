import { DisputeItem } from "./dispute-item";
import type { EscrowContract } from "@/types/escrow";
import type { ContractActions, ActionsPending } from "../useContractActions";

interface DisputesSectionProps {
  contract: EscrowContract;
  userRole: "client" | "freelancer" | null;
  aiProcessing: string | null;
  actions: ContractActions;
  pending: ActionsPending;
  onRunInvestigation?: (milestoneId: string) => void;
}

export function DisputesSection({
  contract,
  userRole,
  aiProcessing,
  actions,
  pending,
  onRunInvestigation,
}: DisputesSectionProps) {
  if (contract.disputes.length === 0) return null;

  return (
    <div className="pt-4 border-t border-white/12 space-y-3">
      <h2 className="text-lg font-bold text-red-300">Disputes</h2>
      {contract.disputes.map((dispute, i) => (
        <DisputeItem
          key={i}
          dispute={dispute}
          userRole={userRole}
          aiProcessing={aiProcessing}
          onAcceptResolution={actions.acceptResolution}
          onReleaseFunds={actions.releaseFunds}
          onRunInvestigation={onRunInvestigation}
          acceptPending={pending.accept}
          releaseFundsPending={pending.releaseFunds}
        />
      ))}
    </div>
  );
}
