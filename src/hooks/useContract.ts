import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContract,
  getContractsByAccount,
  createContract,
  joinContract,
  fundContract,
  startMilestone,
  requestPayment,
  cancelPaymentRequest,
  approveMilestone,
  autoApprovePayment,
  raiseDispute,
  acceptResolution,
  finalizeResolution,
  releaseDisputeFunds,
  overrideToContinueWork,
  completeContractSecurity,
  type CreateContractArgs,
} from "@/near/contract";
import { submitAiResolution, acceptResolution as acceptResolutionCall } from "@/near/contract";
import { anonymizeDisputeContext } from "@/utils/anonymize";
import { getChatMessages, sendStructuredMessage } from "@/near/social";
import type { EvidenceData } from "@/near/social";
import { retrieveEvidence } from "@/nova/client";
import { runInvestigation, type InvestigationStep, type OnStepCallback } from "@/agent/investigation";
import { signatureToBytes, addressToBytes } from "@/agent/client";
import type { EscrowContract } from "@/types/escrow";

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

export function useRequestPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      requestPayment(contractId, milestoneId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useCancelPaymentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      cancelPaymentRequest(contractId, milestoneId),
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

export function useAutoApprovePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      autoApprovePayment(contractId, milestoneId),
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

async function collectEvidence(
  contract: EscrowContract,
  accountId: string | null | undefined,
  onStep?: OnStepCallback
): Promise<Array<{ fileName: string; content: string }> | undefined> {
  if (!accountId) return undefined;

  onStep?.("collecting_evidence");
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

    return textEvidence.length > 0 ? textEvidence : undefined;
  } catch {
    return undefined;
  }
}

function buildAnonymizedContext(
  contract: EscrowContract,
  milestone: any,
  dispute: any,
  chatHistory?: Array<{ sender: string; content: string }>,
  evidence?: Array<{ fileName: string; content: string }>,
  onStep?: OnStepCallback
): string {
  onStep?.("anonymizing");
  return anonymizeDisputeContext({
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
    },
    chatHistory,
    evidence,
  });
}

async function submitResolutionOnChain(
  contractId: string,
  milestoneId: string,
  result: any,
  onStep?: OnStepCallback
): Promise<void> {
  onStep?.("submitting_onchain");
  await submitAiResolution(
    contractId,
    milestoneId,
    result.resolution,
    result.explanation,
    signatureToBytes(result.tee.signature),
    addressToBytes(result.tee.signing_address),
    result.tee.text,
  );
}

async function postResolutionToSocialDb(
  accountId: string,
  contractId: string,
  result: any,
  context: string,
  modelId: string,
  rawResponse: string
): Promise<void> {
  const resolutionStr = typeof result.resolution === "string"
    ? result.resolution
    : JSON.stringify(result.resolution);

  await sendStructuredMessage(
    accountId,
    contractId,
    result.explanation,
    "ai_resolution",
    {
      resolution: resolutionStr,
      explanation: result.explanation,
      confidence: result.confidence,
      model_id: modelId,
      tee_verified: true,
      analysis: result.explanation,
      context_for_freelancer: result.context_for_freelancer,
      context,
      raw_response: rawResponse,
    },
  );
}

export function useRunInvestigation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contract,
      milestoneId,
      chatHistory,
      accountId,
      onStep,
    }: {
      contract: EscrowContract;
      milestoneId: string;
      chatHistory?: Array<{ sender: string; content: string }>;
      accountId?: string | null;
      onStep?: OnStepCallback;
    }) => {
      const fresh = await getContract(contract.id) ?? contract;
      const milestone = fresh.milestones.find((m) => m.id === milestoneId);
      const dispute = fresh.disputes.find(
        (d) => d.milestone_id === milestoneId && d.status === "Pending",
      );
      if (!dispute || !milestone) throw new Error("Dispute or milestone not found");

      const evidence = await collectEvidence(fresh, accountId, onStep);
      const context = buildAnonymizedContext(fresh, milestone, dispute, chatHistory, evidence, onStep);

      onStep?.("connecting_tee");
      const modelId = fresh.model_id || "deepseek-ai/DeepSeek-V3.1";
      const result = await runInvestigation(modelId, context, onStep);
      const { rawResponse, ...resultWithoutRaw } = result;

      await submitResolutionOnChain(fresh.id, milestoneId, result, onStep);

      if (accountId) {
        await postResolutionToSocialDb(accountId, fresh.id, result, context, modelId, rawResponse);
      }

      onStep?.("done", result.explanation);
      return { ...resultWithoutRaw, context, rawResponse };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contract.id] });
      queryClient.invalidateQueries({ queryKey: ["chat", variables.contract.id] });
    },
  });
}

export type { InvestigationStep };

export function useAcceptResolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      acceptResolution(contractId, milestoneId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useFinalizeResolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      finalizeResolution(contractId, milestoneId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useReleaseDisputeFunds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      releaseDisputeFunds(contractId, milestoneId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useOverrideToContinueWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) =>
      overrideToContinueWork(contractId, milestoneId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useAcceptAndRelease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) => {
      await acceptResolutionCall(contractId, milestoneId);
      await releaseDisputeFunds(contractId, milestoneId);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useFinalizeAndRelease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contractId, milestoneId }: { contractId: string; milestoneId: string }) => {
      await finalizeResolution(contractId, milestoneId);
      await releaseDisputeFunds(contractId, milestoneId);
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}

export function useCompleteContractSecurity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId }: { contractId: string }) =>
      completeContractSecurity(contractId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["contract", variables.contractId] }),
  });
}
