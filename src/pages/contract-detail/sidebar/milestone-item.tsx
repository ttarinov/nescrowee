import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/status-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Clock01Icon,
  EyeIcon,
  Wallet01Icon,
  Dollar01Icon,
  Alert01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import type { Milestone } from "@/types/milestone";
import { FundMilestoneDialog } from "../components/fund-milestone-dialog";

const milestoneIconMap: Record<string, typeof CheckmarkCircle01Icon> = {
  Completed: CheckmarkCircle01Icon,
  InProgress: Clock01Icon,
  SubmittedForReview: EyeIcon,
  Funded: Wallet01Icon,
  NotFunded: Dollar01Icon,
  Disputed: Alert01Icon,
};

const milestoneIconClass: Record<string, string> = {
  Completed: "text-success",
  InProgress: "text-primary",
  SubmittedForReview: "text-accent",
  Funded: "text-warning",
  NotFunded: "text-muted-foreground",
  Disputed: "text-destructive",
};

const yoctoToNear = (yocto: string) => {
  const val = BigInt(yocto || "0");
  return (Number(val) / 1e24).toFixed(2);
};

function formatTimeLeft(deadlineNs: number): string {
  const now = Date.now() * 1e6;
  const diff = deadlineNs - now;
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (3600 * 1e9));
  const minutes = Math.floor((diff % (3600 * 1e9)) / (60 * 1e9));
  return `${hours}h ${minutes}m left`;
}

interface MilestoneItemProps {
  milestone: Milestone;
  index: number;
  contractId: string;
  securityPct: number;
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

export function MilestoneItem({
  milestone,
  index,
  contractId,
  securityPct,
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
}: MilestoneItemProps) {
  const IconComponent = milestoneIconMap[milestone.status];
  const deadlineExpired = milestone.payment_request_deadline_ns
    ? Date.now() * 1e6 >= milestone.payment_request_deadline_ns
    : false;

  return (
    <motion.div
      className="p-4 flex items-start gap-3 last:border-b-0"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <span className="text-lg font-mono font-semibold text-purple-300 shrink-0 w-7">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <div className="min-w-0">
          <h3 className="font-medium text-sm text-white truncate">
            {milestone.title}
          </h3>
          <p className="text-xs text-white/60 line-clamp-2 mt-1">
            {milestone.description}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <p
              className={`font-mono font-bold text-sm text-white ${
                milestone.status === "Completed" ? "line-through" : ""
              }`}
            >
              {yoctoToNear(milestone.amount)} NEAR
            </p>
            <StatusBadge status={milestone.status} />
          </div>
          <div className="flex items-center gap-2">
            {milestone.status === "NotFunded" && isClient && (
              <FundMilestoneDialog
                contractId={contractId}
                milestoneId={milestone.id}
                amountYocto={milestone.amount}
                securityPct={securityPct}
                onFundDirect={() => onFund(milestone.id)}
                isPending={fundPending}
              />
            )}
            {milestone.status === "Funded" && isFreelancer && (
              <Button
                size="sm"
                variant="hero"
                onClick={() => onStart(milestone.id)}
                disabled={startPending}
              >
                <HugeiconsIcon icon={PlayIcon} size={12} className="mr-1" />
                Start
              </Button>
            )}
            {milestone.status === "InProgress" && isFreelancer && (
              <Button
                size="sm"
                variant="hero"
                onClick={() => onRequestPayment(milestone.id)}
                disabled={requestPaymentPending}
              >
                Request Payment
              </Button>
            )}
            {milestone.status === "SubmittedForReview" && isFreelancer && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCancelPaymentRequest(milestone.id)}
                disabled={cancelPaymentPending}
              >
                Cancel
              </Button>
            )}
            {milestone.status === "SubmittedForReview" && isClient && (
              <>
                <Button
                  size="sm"
                  variant="hero"
                  onClick={() => onApprove(milestone.id)}
                  disabled={approvePending}
                >
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDispute(milestone.id)}
                >
                  <HugeiconsIcon icon={Alert01Icon} size={12} className="mr-1" />
                  Dispute
                </Button>
              </>
            )}
            {milestone.status === "SubmittedForReview" && deadlineExpired && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAutoApprove(milestone.id)}
                disabled={autoApprovePending}
              >
                <HugeiconsIcon icon={Clock01Icon} size={12} className="mr-1" />
                Claim Payment
              </Button>
            )}
            {milestone.status === "Completed" && (
              <span className="text-xs text-success font-mono inline-flex items-center gap-1">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} /> Paid
              </span>
            )}
          </div>
        </div>
        {milestone.status === "SubmittedForReview" &&
          milestone.payment_request_deadline_ns &&
          !deadlineExpired && (
            <p className="text-[10px] font-mono text-warning mt-2 flex items-center gap-1">
              <HugeiconsIcon icon={Clock01Icon} size={10} />
              Auto-approve in {formatTimeLeft(milestone.payment_request_deadline_ns)}
            </p>
          )}
      </div>
    </motion.div>
  );
}
