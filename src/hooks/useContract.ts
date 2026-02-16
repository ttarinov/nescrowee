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
  submitAiResolution,
  acceptResolution,
  appealResolution,
  type CreateContractArgs,
} from "@/near/contract";
import { runInvestigation } from "@/agent/investigation";
import { signatureToBytes, addressToBytes } from "@/agent/client";
import { anonymizeDisputeContext } from "@/utils/anonymize";
import { sendStructuredMessage, getChatMessages } from "@/near/social";
import type { EvidenceData } from "@/near/social";
import { retrieveEvidence } from "@/nova/client";
import type { EscrowContract } from "@/types/escrow";
import { APPEAL_MODEL_ID } from "@/types/ai";
import { standardPrompt } from "@/utils/promptHash";

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
      accountId,
    }: {
      contract: EscrowContract;
      milestoneId: string;
      isAppeal: boolean;
      chatHistory?: Array<{ sender: string; content: string }>;
      onRoundComplete?: (round: any) => void;
      accountId?: string | null;
    }) => {
      const milestone = contract.milestones.find((m) => m.id === milestoneId);
      const dispute = contract.disputes.find(
        (d) => d.milestone_id === milestoneId && (d.status === "Pending" || d.status === "Appealed"),
      );
      if (!dispute || !milestone) throw new Error("Dispute or milestone not found");

      const modelId = isAppeal ? APPEAL_MODEL_ID : contract.model_id;
      const prompt = standardPrompt;

      let evidence: Array<{ fileName: string; content: string }> | undefined;
      if (accountId) {
        try {
          const allMessages = await getChatMessages(contract.id);
          const evidenceMessages = allMessages.filter((m) => m.type === "evidence" && m.data);
          const textEvidence: Array<{ fileName: string; content: string }> = [];

          for (const msg of evidenceMessages) {
            const data = msg.data as EvidenceData;
            if (!data.cid) continue;
            const isTextFile = /\.(txt|md|csv|json|log)$/i.test(data.fileName);
            if (!isTextFile) continue;

            try {
              const buffer = await retrieveEvidence(accountId, contract.id, data.cid);
              textEvidence.push({
                fileName: data.fileName,
                content: new TextDecoder().decode(buffer),
              });
            } catch { /* skip files we can't decrypt */ }
          }

          if (textEvidence.length > 0) evidence = textEvidence;
        } catch { /* proceed without evidence if retrieval fails */ }
      }

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
        evidence,
      });

      const result = await runInvestigation(modelId, prompt, context);

      onRoundComplete?.({
        round_number: 1,
        analysis: result.explanation,
        findings: result.explanation,
        confidence: result.confidence,
        needs_more_analysis: false,
        resolution: result.resolution,
        explanation: result.explanation,
        tee: result.tee,
      });

      await submitAiResolution(
        contract.id,
        milestoneId,
        result.resolution,
        result.explanation,
        signatureToBytes(result.tee.signature),
        addressToBytes(result.tee.signing_address),
        result.tee.text,
      );

      if (accountId) {
        await sendStructuredMessage(
          accountId,
          contract.id,
          "AI Resolution",
          "ai_resolution",
          {
            round_number: 1,
            analysis: result.explanation,
            findings: result.explanation,
            confidence: result.confidence,
            needs_more_analysis: false,
            model_id: modelId,
            tee_verified: true,
            resolution: result.resolution,
            explanation: result.explanation,
          },
        );
        queryClient.invalidateQueries({ queryKey: ["chat", contract.id] });
      }

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
