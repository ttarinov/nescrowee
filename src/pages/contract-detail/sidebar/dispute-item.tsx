import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/status-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon, CheckmarkCircle01Icon, AiBrain01Icon } from "@hugeicons/core-free-icons";
import type { Dispute } from "@/types/dispute";
import type { Resolution } from "@/types/dispute";

function formatResolution(res: Resolution): string {
  if (res === "Freelancer") return "Full payment to freelancer";
  if (res === "Client") return "Full refund to client";
  if (res === "ContinueWork") return "Continue work — freelancer to revise";
  if (typeof res === "object" && "Split" in res)
    return `Split: ${res.Split.freelancer_pct}% to freelancer, ${100 - res.Split.freelancer_pct}% to client`;
  return String(res);
}

interface DisputeItemProps {
  dispute: Dispute;
  userRole: "client" | "freelancer" | null;
  aiProcessing: string | null;
  onAcceptResolution: (milestoneId: string) => void;
  onReleaseFunds: (milestoneId: string) => void;
  onOverrideToContinueWork: (milestoneId: string) => void;
  onAcceptAndRelease: (milestoneId: string) => void;
  onRunInvestigation?: (milestoneId: string) => void;
  acceptPending: boolean;
  releaseFundsPending: boolean;
  overrideContinuePending: boolean;
  acceptAndReleasePending: boolean;
}

function ResolutionActions({
  dispute,
  userRole,
  onOverrideToContinueWork,
  onAcceptAndRelease,
  overrideContinuePending,
  acceptAndReleasePending,
}: {
  dispute: Dispute;
  userRole: "client" | "freelancer" | null;
  onOverrideToContinueWork: (milestoneId: string) => void;
  onAcceptAndRelease: (milestoneId: string) => void;
  overrideContinuePending: boolean;
  acceptAndReleasePending: boolean;
}) {
  if (!userRole || !dispute.resolution) return null;

  const resolution = dispute.resolution;
  const mid = dispute.milestone_id;

  if (resolution === "Client") {
    return (
      <div className="flex flex-col gap-2 pt-2">
        {userRole === "client" && (
          <>
            <Button
              size="sm"
              variant="default"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => onOverrideToContinueWork(mid)}
              disabled={overrideContinuePending}
            >
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="mr-1" />
              Let Freelancer Continue
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-white/60 border-white/10 hover:bg-white/10"
              onClick={() => onAcceptAndRelease(mid)}
              disabled={acceptAndReleasePending}
            >
              Accept Refund
            </Button>
          </>
        )}
      </div>
    );
  }

  if (resolution === "Freelancer") {
    return (
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant="default"
          className="bg-white/20 hover:bg-white/30 text-white"
          onClick={() => onAcceptAndRelease(mid)}
          disabled={acceptAndReleasePending}
        >
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="mr-1" />
          Release Payment
        </Button>
      </div>
    );
  }

  if (typeof resolution === "object" && "Split" in resolution) {
    return (
      <div className="flex flex-col gap-2 pt-2">
        {userRole === "client" && (
          <Button
            size="sm"
            variant="default"
            className="bg-white/20 hover:bg-white/30 text-white"
            onClick={() => onOverrideToContinueWork(mid)}
            disabled={overrideContinuePending}
          >
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="mr-1" />
            Let Freelancer Continue
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="text-white/60 border-white/10 hover:bg-white/10"
          onClick={() => onAcceptAndRelease(mid)}
          disabled={acceptAndReleasePending}
        >
          Accept Split
        </Button>
      </div>
    );
  }

  return null;
}

export function DisputeItem({
  dispute,
  userRole,
  aiProcessing,
  onAcceptResolution,
  onReleaseFunds,
  onOverrideToContinueWork,
  onAcceptAndRelease,
  onRunInvestigation,
  acceptPending,
  releaseFundsPending,
  overrideContinuePending,
  acceptAndReleasePending,
}: DisputeItemProps) {
  return (
    <div className="p-4 rounded-2xl border border-red-500/20 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <HugeiconsIcon icon={Alert01Icon} size={16} className="text-red-400" />
        <StatusBadge status={dispute.status} />
      </div>
      <p className="text-sm text-white/90">{dispute.reason}</p>

      {dispute.resolution && dispute.status === "AiResolved" && (
        <div className="p-3 rounded-xl border border-white/10 space-y-2">
          <p className="text-xs text-purple-300 font-mono flex items-center gap-1">
            <HugeiconsIcon icon={AiBrain01Icon} size={12} />
            AI Resolution
          </p>
          <p className="text-sm font-medium text-white">
            {formatResolution(dispute.resolution)}
          </p>
          {dispute.explanation && (
            <p className="text-sm text-white/60">{dispute.explanation}</p>
          )}
          {dispute.tee_text && (
            <p className="text-[10px] text-green-400 font-mono">
              TEE-verified Ed25519 signature on-chain
            </p>
          )}
          {dispute.deadline_ns && (
            <p className="text-xs text-white/50 font-mono">
              Auto-executes: {new Date(dispute.deadline_ns / 1e6).toLocaleString()}
            </p>
          )}
          <ResolutionActions
            dispute={dispute}
            userRole={userRole}
            onOverrideToContinueWork={onOverrideToContinueWork}
            onAcceptAndRelease={onAcceptAndRelease}
            overrideContinuePending={overrideContinuePending}
            acceptAndReleasePending={acceptAndReleasePending}
          />
        </div>
      )}

      {dispute.status === "Pending" && (
        <div className="space-y-2">
          {aiProcessing === "active" ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <p className="text-xs font-mono text-purple-300">
                AI investigating · see chat
              </p>
            </div>
          ) : onRunInvestigation ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-purple-300 border-purple-500/30 hover:bg-purple-500/10"
              onClick={() => onRunInvestigation(dispute.milestone_id)}
            >
              <HugeiconsIcon icon={AiBrain01Icon} size={12} className="mr-1" />
              Run AI Investigation
            </Button>
          ) : (
            <p className="text-xs font-mono text-white/50">
              Waiting for investigation...
            </p>
          )}
        </div>
      )}

      {dispute.status === "Finalized" && dispute.resolution && (
        <div className="p-3 rounded-xl border border-green-500/20">
          <p className="text-xs text-green-400 font-mono mb-1">Finalized</p>
          <p className="text-sm font-medium text-white">
            {formatResolution(dispute.resolution)}
          </p>
          {!dispute.funds_released && dispute.resolution !== "ContinueWork" && (
            <Button
              size="sm"
              variant="hero"
              onClick={() => onReleaseFunds(dispute.milestone_id)}
              disabled={releaseFundsPending}
              className="mt-2"
            >
              Release Funds
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
