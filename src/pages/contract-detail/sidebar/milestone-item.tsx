import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/status-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Clock01Icon,
  Alert01Icon,
} from "@hugeicons/core-free-icons";
import type { Milestone } from "@/types/milestone";
import type { ContractActions, ActionsPending } from "../useContractActions";
import { FundMilestoneDialog } from "../components/fund-milestone-dialog";
import { yoctoToNear } from "@/utils/format";

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
  actions: ContractActions;
  pending: ActionsPending;
  onOpenDispute: (milestoneId: string) => void;
}

export function MilestoneItem({
  milestone,
  index,
  contractId,
  securityPct,
  isClient,
  isFreelancer,
  actions,
  pending,
  onOpenDispute,
}: MilestoneItemProps) {
  const deadlineExpired = milestone.payment_request_deadline_ns
    ? Date.now() * 1e6 >= milestone.payment_request_deadline_ns
    : false;

  return (
    <motion.div
      className="p-4 last:border-b-0"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg font-mono font-semibold text-purple-300 shrink-0 w-7">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-white truncate">
            {milestone.title}
          </h3>
          <p className="text-xs text-white/60 line-clamp-2 mt-1">
            {milestone.description}
          </p>
        </div>
      </div>
      <div className="mt-3 w-full flex items-center justify-between flex-wrap gap-2">
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
              onFundDirect={() => actions.fund(milestone.id)}
              isPending={pending.fund}
            />
          )}
          {milestone.status === "InProgress" && isFreelancer && (
            <Button
              size="sm"
              variant="hero"
              onClick={() => actions.requestPayment(milestone.id)}
              disabled={pending.requestPayment}
            >
              Request Payment
            </Button>
          )}
          {milestone.status === "SubmittedForReview" && isFreelancer && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => actions.cancelPaymentRequest(milestone.id)}
              disabled={pending.cancelPayment}
            >
              Cancel
            </Button>
          )}
          {milestone.status === "SubmittedForReview" && isClient && (
            <>
              <Button
                size="sm"
                variant="hero"
                onClick={() => actions.approve(milestone.id)}
                disabled={pending.approve}
              >
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onOpenDispute(milestone.id)}
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
              onClick={() => actions.autoApprove(milestone.id)}
              disabled={pending.autoApprove}
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
        {milestone.status === "SubmittedForReview" &&
          milestone.payment_request_deadline_ns &&
          !deadlineExpired && (
            <p className="text-[10px] font-mono text-warning mt-2 flex items-center gap-1 w-full">
              <HugeiconsIcon icon={Clock01Icon} size={10} />
              Auto-approve in {formatTimeLeft(milestone.payment_request_deadline_ns)}
            </p>
          )}
      </div>
    </motion.div>
  );
}
