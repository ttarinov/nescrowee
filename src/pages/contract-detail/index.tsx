import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
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
  useSubmitAiResolution,
  useAcceptResolution,
  useReleaseDisputeFunds,
  useCompleteContractSecurity,
} from "@/hooks/useContract";
import { useChat } from "./useChat";
import { ChatPanel } from "./chat";
import { Sidebar } from "./sidebar";

const ContractDetailPage = () => {
  const { id } = useParams();
  const { accountId } = useWallet();
  const { data: contract, isLoading } = useContractDetail(id);
  const { messages, sendMessage } = useChat(id);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeMilestoneId, setDisputeMilestoneId] = useState<string | null>(null);
  const [aiProcessing, setAiProcessing] = useState<string | null>(null);

  const fundMutation = useFundContract();
  const startMutation = useStartMilestone();
  const requestPaymentMutation = useRequestPayment();
  const cancelPaymentMutation = useCancelPaymentRequest();
  const approveMutation = useApproveMilestone();
  const autoApproveMutation = useAutoApprovePayment();
  const disputeMutation = useRaiseDispute();
  const aiResolutionMutation = useSubmitAiResolution();
  const acceptMutation = useAcceptResolution();
  const releaseFundsMutation = useReleaseDisputeFunds();
  const securityMutation = useCompleteContractSecurity();

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
    const milestoneAmount = BigInt(milestone.amount);
    const pct = BigInt(contract.security_deposit_pct);
    const totalWithSecurity = milestoneAmount * (100n + pct) / 100n;
    fundMutation.mutate(
      { contractId: contract.id, amount: totalWithSecurity.toString() },
      {
        onSuccess: () => toast.success("Funding successful"),
        onError: (e) => toast.error(`Funding failed: ${e.message}`),
      }
    );
  };

  const handleStart = (milestoneId: string) => {
    startMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Milestone started"),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const handleRequestPayment = (milestoneId: string) => {
    requestPaymentMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Payment requested — client has 48h to review"),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const handleCancelPaymentRequest = (milestoneId: string) => {
    cancelPaymentMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Payment request cancelled"),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const handleApprove = (milestoneId: string) => {
    approveMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Milestone approved — funds released to freelancer"),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const handleAutoApprove = (milestoneId: string) => {
    autoApproveMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Payment auto-approved — funds released"),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const triggerAiResolution = (milestoneId: string) => {
    setAiProcessing(milestoneId);
    const chatHistory = (messages.data || [])
      .filter((m) => m.type === "text")
      .map((m) => ({ sender: m.sender, content: m.content }));

    aiResolutionMutation.mutate(
      { contract, milestoneId, chatHistory, accountId },
      {
        onSuccess: () => {
          toast.success("AI resolution complete — TEE-verified on-chain");
          setAiProcessing(null);
        },
        onError: (e) => {
          toast.error(`AI resolution failed: ${e.message}`);
          setAiProcessing(null);
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
          toast.success("Dispute raised — requesting AI resolution via NEAR AI...");
          setDisputeReason("");
          setDisputeMilestoneId(null);
          triggerAiResolution(targetMilestoneId);
        },
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const handleAcceptResolution = (milestoneId: string) => {
    acceptMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Resolution accepted — finalized"),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const handleReleaseDisputeFunds = (milestoneId: string) => {
    releaseFundsMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Dispute funds released"),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const handleReleaseSecurityDeposit = () => {
    securityMutation.mutate(
      { contractId: contract.id },
      {
        onSuccess: () => toast.success("Security deposit released to freelancer"),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const handleSendMessage = (content: string) => {
    sendMessage.mutate(content, {
      onSuccess: () => {},
      onError: () => toast.error("Failed to send message"),
    });
  };

  const chatMessages = messages.data || [];

  return (
    <div className="h-screen pt-24 flex flex-col">
      <div className="w-full mx-6 flex flex-col flex-1 min-h-0">
        <Link
          to="/contracts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Back to contracts
        </Link>
        <motion.div
          className="flex-1 min-h-0 flex w-full min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ChatPanel
            contract={contract}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            accountId={accountId}
            aiProcessing={aiProcessing}
            onEvidenceUploaded={() => messages.refetch()}
          />

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
            aiProcessing={aiProcessing}
            fundPending={fundMutation.isPending}
            startPending={startMutation.isPending}
            requestPaymentPending={requestPaymentMutation.isPending}
            cancelPaymentPending={cancelPaymentMutation.isPending}
            approvePending={approveMutation.isPending}
            autoApprovePending={autoApproveMutation.isPending}
            disputePending={disputeMutation.isPending || aiResolutionMutation.isPending}
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
