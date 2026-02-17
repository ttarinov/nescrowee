import { useParams } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatWalletError } from "@/utils/format-wallet-error";
import { useWallet } from "@/hooks/useWallet";
import {
  useContractDetail,
  useFundContract,
  useStartMilestone,
  useRequestPayment,
  useCancelPaymentRequest,
  useApproveMilestone,
  useAutoApprovePayment,
  useRaiseDispute,
  useRunInvestigation,
  useAcceptResolution,
  useReleaseDisputeFunds,
  useCompleteContractSecurity,
  type InvestigationStep,
} from "@/hooks/useContract";
import { useChat } from "./useChat";
import { ChatPanel } from "./chat";
import { Sidebar } from "./sidebar";
import { InvestigationPanel } from "./components/investigation-panel";

const ContractDetailPage = () => {
  const { id } = useParams();
  const { accountId } = useWallet();
  const { data: contract, isLoading } = useContractDetail(id);
  const participants = useMemo(() => {
    if (!contract) return [];
    const list = [contract.client];
    if (contract.freelancer) list.push(contract.freelancer);
    return list;
  }, [contract]);
  const { messages, sendMessage } = useChat(id, participants);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeMilestoneId, setDisputeMilestoneId] = useState<string | null>(null);
  const [investigationStep, setInvestigationStep] = useState<InvestigationStep | null>(null);
  const [investigationDetail, setInvestigationDetail] = useState<string | undefined>();
  const [investigationError, setInvestigationError] = useState<string | undefined>();
  const [investigationContext, setInvestigationContext] = useState<string | undefined>();
  const [investigationRawResponse, setInvestigationRawResponse] = useState<string | undefined>();
  const [investigationResult, setInvestigationResult] = useState<{
    resolution: string;
    explanation: string;
    confidence: number;
    context_for_freelancer: string | null;
  } | null>(null);

  const fundMutation = useFundContract();
  const startMutation = useStartMilestone();
  const requestPaymentMutation = useRequestPayment();
  const cancelPaymentMutation = useCancelPaymentRequest();
  const approveMutation = useApproveMilestone();
  const autoApproveMutation = useAutoApprovePayment();
  const disputeMutation = useRaiseDispute();
  const investigationMutation = useRunInvestigation();
  const acceptMutation = useAcceptResolution();
  const releaseFundsMutation = useReleaseDisputeFunds();
  const securityMutation = useCompleteContractSecurity();

  const onStep = useCallback((step: InvestigationStep, detail?: string) => {
    setInvestigationStep(step);
    if (detail) setInvestigationDetail(detail);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading contract...</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Contract not found</p>
      </div>
    );
  }

  const isClient = accountId === contract.client;
  const isFreelancer = accountId === contract.freelancer;
  const userRole = isClient ? "client" : isFreelancer ? "freelancer" : null;

  const handleFund = (milestoneId: string) => {
    const milestone = contract.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;
    fundMutation.mutate(
      { contractId: contract.id, amount: milestone.amount },
      {
        onSuccess: () => toast.success("Funding successful"),
        onError: (e) => toast.error(formatWalletError(e)),
      }
    );
  };

  const handleStart = (milestoneId: string) => {
    startMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Milestone started"),
        onError: (e) => toast.error(formatWalletError(e)),
      }
    );
  };

  const handleRequestPayment = (milestoneId: string) => {
    requestPaymentMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Payment requested — client has 48h to review"),
        onError: (e) => toast.error(formatWalletError(e)),
      }
    );
  };

  const handleCancelPaymentRequest = (milestoneId: string) => {
    cancelPaymentMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Payment request cancelled"),
        onError: (e) => toast.error(formatWalletError(e)),
      }
    );
  };

  const handleApprove = (milestoneId: string) => {
    approveMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Milestone approved — funds released to freelancer"),
        onError: (e) => toast.error(formatWalletError(e)),
      }
    );
  };

  const handleAutoApprove = (milestoneId: string) => {
    autoApproveMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Payment auto-approved — funds released"),
        onError: (e) => toast.error(formatWalletError(e)),
      }
    );
  };

  const triggerAiResolution = (milestoneId: string) => {
    setInvestigationStep("collecting_evidence");
    setInvestigationDetail(undefined);
    setInvestigationError(undefined);
    setInvestigationContext(undefined);
    setInvestigationRawResponse(undefined);
    setInvestigationResult(null);

    const chatHistory = (messages.data || [])
      .filter((m) => m.type === "text")
      .map((m) => ({ sender: m.sender, content: m.content }));

    investigationMutation.mutate(
      { contract, milestoneId, chatHistory, accountId, onStep },
      {
        onSuccess: (data) => {
          toast.success("AI resolution submitted on-chain");
          setInvestigationContext(data.context);
          setInvestigationRawResponse(data.rawResponse);
          const resStr = typeof data.resolution === "string"
            ? data.resolution
            : JSON.stringify(data.resolution);
          setInvestigationResult({
            resolution: resStr,
            explanation: data.explanation,
            confidence: data.confidence,
            context_for_freelancer: data.context_for_freelancer,
          });
        },
        onError: (e) => {
          setInvestigationStep("error");
          setInvestigationError(e.message);
          toast.error(formatWalletError(e));
        },
      }
    );
  };

  const handleDispute = () => {
    if (!disputeMilestoneId || !disputeReason.trim()) return;
    const targetMilestoneId = disputeMilestoneId;
    disputeMutation.mutate(
      { contractId: contract.id, milestoneId: targetMilestoneId, reason: disputeReason },
      {
        onSuccess: () => {
          toast.success("Dispute raised — starting AI investigation...");
          setDisputeReason("");
          setDisputeMilestoneId(null);
          triggerAiResolution(targetMilestoneId);
        },
        onError: (e) => toast.error(formatWalletError(e)),
      }
    );
  };

  const handleAcceptResolution = (milestoneId: string) => {
    acceptMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Resolution accepted — finalized"),
        onError: (e) => toast.error(formatWalletError(e)),
      }
    );
  };

  const handleReleaseDisputeFunds = (milestoneId: string) => {
    releaseFundsMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Dispute funds released"),
        onError: (e) => toast.error(formatWalletError(e)),
      }
    );
  };

  const handleReleaseSecurityDeposit = () => {
    securityMutation.mutate(
      { contractId: contract.id },
      {
        onSuccess: () => toast.success("Security deposit released to freelancer"),
        onError: (e) => toast.error(formatWalletError(e)),
      }
    );
  };

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage.mutateAsync(content);
    } catch {
      toast.error("Failed to send message");
      throw new Error("send failed");
    }
  };

  const chatMessages = messages.data || [];

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col">
      <div className="w-full mx-6 flex flex-col flex-1 min-h-0">
        <motion.div
          className="flex-1 min-h-0 flex w-full min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex-1 min-w-0 flex flex-col">
            <ChatPanel
              contract={contract}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              sendPending={sendMessage.isPending}
              accountId={accountId}
              aiProcessing={investigationStep && investigationStep !== "done" && investigationStep !== "error" ? "active" : null}
              onEvidenceUploaded={() => messages.refetch()}
            />
            <AnimatePresence>
              {investigationStep && (
                <div className="px-4 pb-4">
                  <InvestigationPanel
                    currentStep={investigationStep}
                    detail={investigationDetail}
                    error={investigationError}
                    context={investigationContext}
                    rawResponse={investigationRawResponse}
                    result={investigationResult ?? undefined}
                    onClose={() => setInvestigationStep(null)}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>

          <Sidebar
            contract={contract}
            userRole={userRole}
            isClient={isClient}
            isFreelancer={isFreelancer}
            disputeMilestoneId={disputeMilestoneId}
            disputeReason={disputeReason}
            onDisputeReasonChange={setDisputeReason}
            onDisputeSubmit={handleDispute}
            onDisputeCancel={() => {
              setDisputeMilestoneId(null);
              setDisputeReason("");
            }}
            onFund={handleFund}
            onStart={handleStart}
            onRequestPayment={handleRequestPayment}
            onCancelPaymentRequest={handleCancelPaymentRequest}
            onApprove={handleApprove}
            onAutoApprove={handleAutoApprove}
            onDispute={setDisputeMilestoneId}
            onAcceptResolution={handleAcceptResolution}
            onReleaseFunds={handleReleaseDisputeFunds}
            onReleaseSecurityDeposit={handleReleaseSecurityDeposit}
            aiProcessing={investigationStep && investigationStep !== "done" && investigationStep !== "error" ? "active" : null}
            fundPending={fundMutation.isPending}
            startPending={startMutation.isPending}
            requestPaymentPending={requestPaymentMutation.isPending}
            cancelPaymentPending={cancelPaymentMutation.isPending}
            approvePending={approveMutation.isPending}
            autoApprovePending={autoApproveMutation.isPending}
            disputePending={disputeMutation.isPending || investigationMutation.isPending}
            acceptPending={acceptMutation.isPending}
            releaseFundsPending={releaseFundsMutation.isPending}
            securityPending={securityMutation.isPending}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ContractDetailPage;
