import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import type { EscrowContract } from "@/types/escrow";
import { ContractInfo } from "./contract-info";
import { MilestonesList } from "./milestones-list";
import { DisputesSection } from "./disputes-section";
import { DisputeForm } from "./dispute-form";

const yoctoToNear = (yocto: string) => {
  const val = BigInt(yocto || "0");
  return (Number(val) / 1e24).toFixed(2);
};

interface SidebarProps {
  contract: EscrowContract;
  userRole: "client" | "freelancer" | null;
  isClient: boolean;
  isFreelancer: boolean;
  disputeMilestoneId: string | null;
  disputeReason: string;
  onDisputeReasonChange: (reason: string) => void;
  onDisputeSubmit: () => void;
  onDisputeCancel: () => void;
  onFund: (milestoneId: string) => void;
  onStart: (milestoneId: string) => void;
  onRequestPayment: (milestoneId: string) => void;
  onCancelPaymentRequest: (milestoneId: string) => void;
  onApprove: (milestoneId: string) => void;
  onAutoApprove: (milestoneId: string) => void;
  onDispute: (milestoneId: string) => void;
  onAcceptResolution: (milestoneId: string) => void;
  onReleaseFunds: (milestoneId: string) => void;
  onReleaseSecurityDeposit?: () => void;
  aiProcessing: string | null;
  fundPending: boolean;
  startPending: boolean;
  requestPaymentPending: boolean;
  cancelPaymentPending: boolean;
  approvePending: boolean;
  autoApprovePending: boolean;
  disputePending: boolean;
  acceptPending: boolean;
  releaseFundsPending: boolean;
  securityPending?: boolean;
}

export function Sidebar({
  contract,
  userRole,
  isClient,
  isFreelancer,
  disputeMilestoneId,
  disputeReason,
  onDisputeReasonChange,
  onDisputeSubmit,
  onDisputeCancel,
  onFund,
  onStart,
  onRequestPayment,
  onCancelPaymentRequest,
  onApprove,
  onAutoApprove,
  onDispute,
  onAcceptResolution,
  onReleaseFunds,
  onReleaseSecurityDeposit,
  aiProcessing,
  fundPending,
  startPending,
  requestPaymentPending,
  cancelPaymentPending,
  approvePending,
  autoApprovePending,
  disputePending,
  acceptPending,
  releaseFundsPending,
  securityPending,
}: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const completed = contract.milestones.filter((m) => m.status === "Completed").length;
  const allCompleted = contract.milestones.every((m) => m.status === "Completed");
  const securityPoolNear = yoctoToNear(contract.security_pool);

  return (
    <aside
      className={`shrink-0 flex flex-col min-h-0 transition-[width] duration-200 ease-out rounded-[40px] overflow-hidden font-sans text-white relative shadow-2xl bg-black/40 backdrop-blur-2xl ${
        sidebarOpen ? "w-1/4 min-w-[260px] max-w-[400px]" : "w-14 min-w-[3.5rem]"
      }`}
    >
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-50px] right-[-50px] w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
      {sidebarOpen ? (
        <>
          <div className="shrink-0 flex justify-end px-2 py-2 relative z-10">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
            </Button>
          </div>
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden relative z-10">
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 pt-0 space-y-4">
              <ContractInfo contract={contract} userRole={userRole} />

              {allCompleted && Number(securityPoolNear) > 0 && onReleaseSecurityDeposit && (
                <Button
                  size="sm"
                  variant="hero"
                  className="w-full"
                  onClick={onReleaseSecurityDeposit}
                  disabled={securityPending}
                >
                  Release Security Deposit ({securityPoolNear} NEAR)
                </Button>
              )}

              <MilestonesList
                contract={contract}
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

              {disputeMilestoneId && (
                <DisputeForm
                  reason={disputeReason}
                  onReasonChange={onDisputeReasonChange}
                  onSubmit={onDisputeSubmit}
                  onCancel={onDisputeCancel}
                  isPending={disputePending}
                />
              )}

              <DisputesSection
                contract={contract}
                userRole={userRole}
                aiProcessing={aiProcessing}
                onAcceptResolution={onAcceptResolution}
                onReleaseFunds={onReleaseFunds}
                acceptPending={acceptPending}
                releaseFundsPending={releaseFundsPending}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1 min-h-0 items-center justify-center gap-3 py-4 relative z-10">
          <p className="text-[10px] font-mono text-white/70 tabular-nums">
            {completed}/{contract.milestones.length}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(true)}
            aria-label="Expand sidebar"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </Button>
        </div>
      )}
    </aside>
  );
}
