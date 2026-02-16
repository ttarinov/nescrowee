import { DisputeItem } from "./dispute-item";
import type { EscrowContract } from "@/types/escrow";

interface DisputesSectionProps {
  contract: EscrowContract;
  userRole: "client" | "freelancer" | null;
  aiProcessing: string | null;
  onAcceptResolution: (milestoneId: string) => void;
  onReleaseFunds: (milestoneId: string) => void;
  acceptPending: boolean;
  releaseFundsPending: boolean;
}

export function DisputesSection({
  contract,
  userRole,
  aiProcessing,
  onAcceptResolution,
  onReleaseFunds,
  acceptPending,
  releaseFundsPending,
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
          onAcceptResolution={onAcceptResolution}
          onReleaseFunds={onReleaseFunds}
          acceptPending={acceptPending}
          releaseFundsPending={releaseFundsPending}
        />
      ))}
    </div>
  );
}
