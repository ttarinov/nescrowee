import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContract,
  getContractsByAccount,
  createContract,
  joinContract,
  fundContract,
  startMilestone,
  completeMilestone,
  approveMilestone,
  raiseDispute,
  submitInvestigationRound,
  acceptResolution,
  appealResolution,
  type CreateContractArgs,
} from "@/near/contract";
import {
  runInvestigation,
  signatureToBytes,
  addressToBytes,
  type InvestigationRoundResult,
} from "@/near/ai";
import { anonymizeDisputeContext } from "@/utils/anonymize";
import { investigationPrompt, investigationAppealPrompt } from "@/utils/promptHash";
import type { EscrowContract } from "@/types/contract";
import { APPEAL_MODEL_ID } from "@/types/contract";

export function useContractDetail(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract", contractId],
    queryFn: () => getContract(contractId!),
    enabled: !!contractId,
    refetchInterval: 10_000,
  });
}

export function useUserContracts(accountId: string | null) {
  return useQuery({
    queryKey: ["contracts", accountId],
    queryFn: () => getContractsByAccount(accountId!),
    enabled: !!accountId,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: CreateContractArgs) => createContract(args),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contracts"] }),
  });
}

export function useJoinContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, inviteToken }: { contractId: string; inviteToken: string }) =>
      joinContract(contractId, inviteToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contracts"] }),
  });
}

export function useFundContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, amount }: { contractId: string; amount: string }) =>
      fundContract(contractId, amount),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useStartMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      startMilestone(contractId, milestoneId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useCompleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      completeMilestone(contractId, milestoneId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useApproveMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      approveMilestone(contractId, milestoneId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useRaiseDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contractId,
      milestoneId,
      reason,
    }: {
      contractId: string;
      milestoneId: string;
      reason: string;
    }) => raiseDispute(contractId, milestoneId, reason),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useSubmitAiResolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contract,
      milestoneId,
      isAppeal,
      chatHistory,
      onRoundComplete,
    }: {
      contract: EscrowContract;
      milestoneId: string;
      isAppeal: boolean;
      chatHistory?: Array<{ sender: string; content: string }>;
      onRoundComplete?: (round: InvestigationRoundResult) => void;
    }) => {
      const milestone = contract.milestones.find((m) => m.id === milestoneId);
      const dispute = contract.disputes.find(
        (d) => d.milestone_id === milestoneId && (d.status === "Pending" || d.status === "Appealed"),
      );
      if (!dispute || !milestone) throw new Error("Dispute or milestone not found");

      const modelId = isAppeal ? APPEAL_MODEL_ID : contract.model_id;
      const prompt = isAppeal ? investigationAppealPrompt : investigationPrompt;
      const maxRounds = isAppeal ? 5 : 3;

      const context = anonymizeDisputeContext({
        contract: {
          client: contract.client,
          freelancer: contract.freelancer,
          title: contract.title,
          description: contract.description,
        },
        milestone: {
          title: milestone.title,
          description: milestone.description,
          amount: milestone.amount,
        },
        dispute: {
          raised_by: dispute.raised_by,
          reason: dispute.reason,
          explanation: isAppeal ? dispute.explanation : null,
        },
        chatHistory,
      });

      const result = await runInvestigation(
        modelId,
        prompt,
        context,
        maxRounds,
        async (round) => {
          onRoundComplete?.(round);

          await submitInvestigationRound(
            contract.id,
            milestoneId,
            round.round_number,
            round.analysis,
            round.findings,
            round.confidence,
            round.needs_more_analysis,
            round.resolution,
            round.explanation,
            signatureToBytes(round.tee.signature),
            addressToBytes(round.tee.signing_address),
            round.tee.text,
          );
        },
      );

      return result;
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contract.id] }),
  });
}

export function useAcceptResolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      acceptResolution(contractId, milestoneId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useAppealResolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      appealResolution(contractId, milestoneId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}
