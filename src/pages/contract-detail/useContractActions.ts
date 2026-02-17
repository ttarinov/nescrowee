import { useCallback } from "react";
import { toast } from "sonner";
import { formatWalletError } from "@/utils/format-wallet-error";
import {
  useFundContract,
  useStartMilestone,
  useRequestPayment,
  useCancelPaymentRequest,
  useApproveMilestone,
  useAutoApprovePayment,
  useRaiseDispute,
  useAcceptResolution,
  useReleaseDisputeFunds,
  useCompleteContractSecurity,
} from "@/hooks/useContract";
import type { EscrowContract } from "@/types/escrow";

export interface ContractActions {
  fund: (milestoneId: string) => void;
  start: (milestoneId: string) => void;
  requestPayment: (milestoneId: string) => void;
  cancelPaymentRequest: (milestoneId: string) => void;
  approve: (milestoneId: string) => void;
  autoApprove: (milestoneId: string) => void;
  raiseDispute: (milestoneId: string, reason: string) => void;
  acceptResolution: (milestoneId: string) => void;
  releaseFunds: (milestoneId: string) => void;
  releaseSecurityDeposit: () => void;
}

export interface ActionsPending {
  fund: boolean;
  start: boolean;
  requestPayment: boolean;
  cancelPayment: boolean;
  approve: boolean;
  autoApprove: boolean;
  dispute: boolean;
  accept: boolean;
  releaseFunds: boolean;
  security: boolean;
}

export function useContractActions(
  contract: EscrowContract | null | undefined,
  onDisputeRaised?: (milestoneId: string) => void,
) {
  const fundMutation = useFundContract();
  const startMutation = useStartMilestone();
  const requestPaymentMutation = useRequestPayment();
  const cancelPaymentMutation = useCancelPaymentRequest();
  const approveMutation = useApproveMilestone();
  const autoApproveMutation = useAutoApprovePayment();
  const disputeMutation = useRaiseDispute();
  const acceptMutation = useAcceptResolution();
  const releaseFundsMutation = useReleaseDisputeFunds();
  const securityMutation = useCompleteContractSecurity();

  const contractId = contract?.id ?? "";

  const actions: ContractActions = {
    fund: useCallback((milestoneId: string) => {
      const milestone = contract?.milestones.find((m) => m.id === milestoneId);
      if (!milestone) return;
      fundMutation.mutate(
        { contractId, amount: milestone.amount },
        {
          onSuccess: () => toast.success("Funding successful"),
          onError: (e) => toast.error(formatWalletError(e)),
        },
      );
    }, [contractId, contract?.milestones, fundMutation]),

    start: useCallback((milestoneId: string) => {
      startMutation.mutate(
        { contractId, milestoneId },
        {
          onSuccess: () => toast.success("Milestone started"),
          onError: (e) => toast.error(formatWalletError(e)),
        },
      );
    }, [contractId, startMutation]),

    requestPayment: useCallback((milestoneId: string) => {
      requestPaymentMutation.mutate(
        { contractId, milestoneId },
        {
          onSuccess: () => toast.success("Payment requested — client has 48h to review"),
          onError: (e) => toast.error(formatWalletError(e)),
        },
      );
    }, [contractId, requestPaymentMutation]),

    cancelPaymentRequest: useCallback((milestoneId: string) => {
      cancelPaymentMutation.mutate(
        { contractId, milestoneId },
        {
          onSuccess: () => toast.success("Payment request cancelled"),
          onError: (e) => toast.error(formatWalletError(e)),
        },
      );
    }, [contractId, cancelPaymentMutation]),

    approve: useCallback((milestoneId: string) => {
      approveMutation.mutate(
        { contractId, milestoneId },
        {
          onSuccess: () => toast.success("Milestone approved — funds released to freelancer"),
          onError: (e) => toast.error(formatWalletError(e)),
        },
      );
    }, [contractId, approveMutation]),

    autoApprove: useCallback((milestoneId: string) => {
      autoApproveMutation.mutate(
        { contractId, milestoneId },
        {
          onSuccess: () => toast.success("Payment auto-approved — funds released"),
          onError: (e) => toast.error(formatWalletError(e)),
        },
      );
    }, [contractId, autoApproveMutation]),

    raiseDispute: useCallback((milestoneId: string, reason: string) => {
      disputeMutation.mutate(
        { contractId, milestoneId, reason },
        {
          onSuccess: () => {
            toast.success("Dispute raised — starting AI investigation...");
            onDisputeRaised?.(milestoneId);
          },
          onError: (e) => toast.error(formatWalletError(e)),
        },
      );
    }, [contractId, disputeMutation, onDisputeRaised]),

    acceptResolution: useCallback((milestoneId: string) => {
      acceptMutation.mutate(
        { contractId, milestoneId },
        {
          onSuccess: () => toast.success("Resolution accepted — finalized"),
          onError: (e) => toast.error(formatWalletError(e)),
        },
      );
    }, [contractId, acceptMutation]),

    releaseFunds: useCallback((milestoneId: string) => {
      releaseFundsMutation.mutate(
        { contractId, milestoneId },
        {
          onSuccess: () => toast.success("Dispute funds released"),
          onError: (e) => toast.error(formatWalletError(e)),
        },
      );
    }, [contractId, releaseFundsMutation]),

    releaseSecurityDeposit: useCallback(() => {
      securityMutation.mutate(
        { contractId },
        {
          onSuccess: () => toast.success("Security deposit released to freelancer"),
          onError: (e) => toast.error(formatWalletError(e)),
        },
      );
    }, [contractId, securityMutation]),
  };

  const pending: ActionsPending = {
    fund: fundMutation.isPending,
    start: startMutation.isPending,
    requestPayment: requestPaymentMutation.isPending,
    cancelPayment: cancelPaymentMutation.isPending,
    approve: approveMutation.isPending,
    autoApprove: autoApproveMutation.isPending,
    dispute: disputeMutation.isPending,
    accept: acceptMutation.isPending,
    releaseFunds: releaseFundsMutation.isPending,
    security: securityMutation.isPending,
  };

  return { actions, pending };
}
