import { Progress } from "@/components/ui/progress";
import { MilestoneItem } from "./milestone-item";
import type { EscrowContract } from "@/types/escrow";

interface MilestonesListProps {
  contract: EscrowContract;
  isClient: boolean;
  isFreelancer: boolean;
  onFund: (milestoneId: string) => void;
  onStart: (milestoneId: string) => void;
  onRequestPayment: (milestoneId: string) => void;
  onCancelPaymentRequest: (milestoneId: string) => void;
  onApprove: (milestoneId: string) => void;
  onAutoApprove: (milestoneId: string) => void;
  onDispute: (milestoneId: string) => void;
  fundPending: boolean;
  startPending: boolean;
  requestPaymentPending: boolean;
  cancelPaymentPending: boolean;
  approvePending: boolean;
  autoApprovePending: boolean;
}

export function MilestonesList({
  contract,
  isClient,
  isFreelancer,
  onFund,
  onStart,
  onRequestPayment,
  onCancelPaymentRequest,
  onApprove,
  onAutoApprove,
  onDispute,
  fundPending,
  startPending,
  requestPaymentPending,
  cancelPaymentPending,
  approvePending,
  autoApprovePending,
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
            onFund={onFund}
            onStart={onStart}
            onRequestPayment={onRequestPayment}
            onCancelPaymentRequest={onCancelPaymentRequest}
            onApprove={onApprove}
            onAutoApprove={onAutoApprove}
            onDispute={onDispute}
            fundPending={fundPending}
            startPending={startPending}
            requestPaymentPending={requestPaymentPending}
            cancelPaymentPending={cancelPaymentPending}
            approvePending={approvePending}
            autoApprovePending={autoApprovePending}
          />
        ))}
      </div>
    </div>
  );
}
