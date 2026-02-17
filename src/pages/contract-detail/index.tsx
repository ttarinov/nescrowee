import { useParams } from "react-router-dom";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatWalletError } from "@/utils/format-wallet-error";
import { useWallet } from "@/hooks/useWallet";
import { useContractDetail, useRunInvestigation, type InvestigationStep } from "@/hooks/useContract";
import { useChat } from "./useChat";
import { useContractActions } from "./useContractActions";
import { ChatPanel, type InvestigationState } from "./chat";
import { Sidebar } from "./sidebar";

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

  const [investigationStep, setInvestigationStep] = useState<InvestigationStep | null>(null);
  const [investigationDetail, setInvestigationDetail] = useState<string | undefined>();
  const [investigationError, setInvestigationError] = useState<string | undefined>();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef(Date.now());
  const lastMilestoneIdRef = useRef<string | null>(null);

  const investigationMutation = useRunInvestigation();

  useEffect(() => {
    if (!investigationStep || investigationStep === "done" || investigationStep === "error") return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [investigationStep]);

  const onStep = useCallback((step: InvestigationStep, detail?: string) => {
    setInvestigationStep(step);
    if (detail) setInvestigationDetail(detail);
  }, []);

  const triggerAiResolution = useCallback((milestoneId: string) => {
    if (!contract) return;
    lastMilestoneIdRef.current = milestoneId;
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    setInvestigationStep("collecting_evidence");
    setInvestigationDetail(undefined);
    setInvestigationError(undefined);

    const chatHistory = (messages.data || [])
      .filter((m) => m.type === "text")
      .map((m) => ({ sender: m.sender, content: m.content }));

    investigationMutation.mutate(
      { contract, milestoneId, chatHistory, accountId, onStep },
      {
        onSuccess: () => {
          toast.success("AI resolution submitted on-chain");
          setInvestigationStep("done");
        },
        onError: (e) => {
          setInvestigationStep("error");
          setInvestigationError(e.message);
          toast.error(formatWalletError(e));
        },
      },
    );
  }, [contract, messages.data, accountId, onStep, investigationMutation]);

  const handleRetryInvestigation = useCallback(() => {
    const milestoneId = lastMilestoneIdRef.current;
    if (milestoneId) triggerAiResolution(milestoneId);
  }, [triggerAiResolution]);

  const { actions, pending } = useContractActions(contract, triggerAiResolution);

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

  if (!userRole) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground text-lg font-medium">Access restricted</p>
        <p className="text-muted-foreground/60 text-sm">
          {accountId ? "You are not a participant of this contract." : "Connect your wallet to view this contract."}
        </p>
      </div>
    );
  }

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage.mutateAsync(content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("reject") || msg.includes("cancel") || msg.includes("denied")) {
        toast.error("Transaction cancelled");
      }
      throw err;
    }
  };

  const chatMessages = messages.data || [];
  const aiProcessingStatus = investigationStep && investigationStep !== "done" && investigationStep !== "error" ? "active" : null;

  const investigation: InvestigationState | null = investigationStep ? {
    step: investigationStep,
    detail: investigationDetail,
    error: investigationError,
    elapsed: elapsedSeconds,
    onRetry: investigationStep === "error" ? handleRetryInvestigation : undefined,
    onDismiss: investigationStep === "error" || investigationStep === "done"
      ? () => setInvestigationStep(null)
      : undefined,
  } : null;

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col">
      <div className="w-full flex flex-col flex-1 min-h-0 sm:px-32">
        <motion.div
          className="flex-1 min-h-0 flex w-full min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ChatPanel
            contract={contract}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            sendPending={sendMessage.isPending}
            accountId={accountId}
            onEvidenceUploaded={() => messages.refetch()}
            investigation={investigation}
          />

          <Sidebar
            contract={contract}
            userRole={userRole}
            actions={actions}
            pending={{ ...pending, dispute: pending.dispute || investigationMutation.isPending }}
            aiProcessing={aiProcessingStatus}
            onRunInvestigation={triggerAiResolution}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ContractDetailPage;
