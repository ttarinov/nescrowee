import { useParams, Link } from "react-router-dom";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Alert01Icon,
  Dollar01Icon,
  Wallet01Icon,
  ArrowUp01Icon,
  EyeIcon,
  AiBrain01Icon,
  PlayIcon,
  LockIcon,
  ExternalLink,
  Attachment01Icon,
} from "@hugeicons/core-free-icons";
import { nearConfig, hotPayItemId, hotPayCheckoutBase } from "@/near/config";
import { toast } from "sonner";
import { useWallet } from "@/hooks/useWallet";
import {
  useContractDetail,
  useFundContract,
  useStartMilestone,
  useApproveMilestone,
  useRaiseDispute,
  useSubmitAiResolution,
  useAcceptResolution,
  useAppealResolution,
} from "@/hooks/useContract";
import { useChat } from "./useChat";
import type { Resolution } from "@/types/dispute";
import type { AiRoundData, EvidenceData } from "@/near/social";
import { sendStructuredMessage } from "@/near/social";
import { uploadEvidence as novaUpload, createEvidenceVault, isVaultMember } from "@/nova/client";

function FundMilestoneDialog({
  contractId,
  milestoneId,
  amountYocto,
  onFundDirect,
  isPending,
}: {
  contractId: string;
  milestoneId: string;
  amountYocto: string;
  onFundDirect: () => void;
  isPending: boolean;
}) {
  const amountNear = (Number(BigInt(amountYocto || "0")) / 1e24).toFixed(2);
  const memo = `mt-${contractId}-${milestoneId}`;
  const redirectUrl = `${window.location.origin}/contracts/${contractId}`;
  const hotPayUrl = hotPayItemId
    ? `${hotPayCheckoutBase}?item_id=${hotPayItemId}&amount=${amountNear}&memo=${memo}&redirect_url=${encodeURIComponent(redirectUrl)}`
    : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="hero">Fund</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Fund Milestone</DialogTitle>
          <DialogDescription>
            {amountNear} NEAR · Choose how to pay
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Direct NEAR */}
          <button
            onClick={onFundDirect}
            disabled={isPending}
            className="w-full p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={Wallet01Icon} size={20} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Pay with NEAR Wallet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Direct on-chain · instant · HOT Wallet / MyNearWallet
                </p>
              </div>
              <span className="text-[10px] font-mono text-success bg-success/10 px-1.5 py-0.5 rounded">trustless</span>
            </div>
          </button>

          {hotPayUrl && (
            <a
              href={hotPayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-xl border border-orange-500/25 bg-orange-500/5 hover:bg-orange-500/10 transition-all flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                <span className="text-orange-400 font-bold text-sm">H</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-400">Pay with HOT Pay</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  USDC · USDT · ETH · BNB · 30+ tokens via HOT Pay
                </p>
              </div>
              <HugeiconsIcon icon={ExternalLink} size={14} className="text-muted-foreground shrink-0" />
            </a>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Memo: <code className="font-mono">{memo}</code> · webhook auto-routes to escrow
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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

function formatResolution(res: Resolution): string {
  if (res === "Freelancer") return "Full payment to freelancer";
  if (res === "Client") return "Full refund to client";
  if (typeof res === "object" && "Split" in res) return `Split: ${res.Split.freelancer_pct}% to freelancer, ${100 - res.Split.freelancer_pct}% to client`;
  return String(res);
}

const ContractDetailPage = () => {
  const { id } = useParams();
  const { accountId } = useWallet();
  const { data: contract, isLoading } = useContractDetail(id);
  const { messages, sendMessage } = useChat(id);
  const [chatInput, setChatInput] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeMilestoneId, setDisputeMilestoneId] = useState<string | null>(null);
  const [aiProcessing, setAiProcessing] = useState<string | null>(null);
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set());
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fundMutation = useFundContract();
  const startMutation = useStartMilestone();
  const approveMutation = useApproveMilestone();
  const disputeMutation = useRaiseDispute();
  const aiResolutionMutation = useSubmitAiResolution();
  const acceptMutation = useAcceptResolution();
  const appealMutation = useAppealResolution();

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

  const completed = contract.milestones.filter((m) => m.status === "Completed").length;
  const progress = contract.milestones.length > 0 ? (completed / contract.milestones.length) * 100 : 0;

  const handleFund = (milestoneId: string, amount: string) => {
    fundMutation.mutate(
      { contractId: contract.id, amount },
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

  const handleApprove = (milestoneId: string) => {
    approveMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Milestone approved — funds released to freelancer"),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const triggerAiResolution = (milestoneId: string, isAppeal: boolean) => {
    setAiProcessing(milestoneId);
    const chatHistory = (messages.data || [])
      .filter((m) => m.type === "text")
      .map((m) => ({ sender: m.sender, content: m.content }));

    aiResolutionMutation.mutate(
      { contract, milestoneId, isAppeal, chatHistory, accountId },
      {
        onSuccess: () => {
          toast.success(isAppeal ? "Appeal investigation complete — TEE-verified on-chain" : "Investigation complete — TEE-verified on-chain");
          setAiProcessing(null);
        },
        onError: (e) => {
          toast.error(`AI investigation failed: ${e.message}`);
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
          triggerAiResolution(targetMilestoneId, false);
        },
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const handleAcceptResolution = (milestoneId: string) => {
    acceptMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => toast.success("Resolution accepted"),
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const handleAppeal = (milestoneId: string) => {
    appealMutation.mutate(
      { contractId: contract.id, milestoneId },
      {
        onSuccess: () => {
          toast.success("Appeal submitted — requesting thorough AI review...");
          triggerAiResolution(milestoneId, true);
        },
        onError: (e) => toast.error(`Failed: ${e.message}`),
      }
    );
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendMessage.mutate(chatInput, {
      onSuccess: () => setChatInput(""),
      onError: () => toast.error("Failed to send message"),
    });
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accountId || !contract) return;
    e.target.value = "";

    setUploadingEvidence(true);
    try {
      const hasVault = await isVaultMember(accountId, contract.id);
      if (!hasVault) {
        await createEvidenceVault(accountId, contract.id);
      }

      const fileBuffer = await file.arrayBuffer();
      const result = await novaUpload(accountId, contract.id, fileBuffer, file.name);

      const evidence: EvidenceData = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        cid: result.cid,
      };
      await sendStructuredMessage(
        accountId,
        contract.id,
        `Evidence: ${file.name}`,
        "evidence",
        evidence as unknown as Record<string, unknown>,
      );
      messages.refetch();
      toast.success(`Evidence encrypted & uploaded via NOVA`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Evidence upload failed: ${msg}`);
    } finally {
      setUploadingEvidence(false);
    }
  };

  const chatMessages = messages.data || [];

  return (
    <div className="h-screen pt-24">
      <div className="container mx-auto px-4">
        <Link to="/contracts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Back to contracts
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-4 h-[calc(100vh-20rem)]">
            {/* Chat */}
            <div className="flex-1">
              <div className="rounded-xl bg-card border border-border flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
                    </div>
                  )}
                  {chatMessages.map((msg) => {
                    if (msg.type === "ai_round") {
                      const roundData = msg.data as AiRoundData | undefined;
                      if (!roundData) return null;
                      const isExpanded = expandedRounds.has(roundData.round_number);
                      return (
                        <div key={msg.id} className="flex flex-col items-center">
                          <div className="w-[95%] p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                            <button
                              className="w-full flex items-center justify-between text-left"
                              onClick={() => setExpandedRounds((prev) => {
                                const next = new Set(prev);
                                next.has(roundData.round_number) ? next.delete(roundData.round_number) : next.add(roundData.round_number);
                                return next;
                              })}
                            >
                              <span className="text-xs font-mono text-primary flex items-center gap-2">
                                <HugeiconsIcon icon={AiBrain01Icon} size={14} className="text-primary" />
                                AI Investigation Round {roundData.round_number}/{roundData.max_rounds}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-success flex items-center gap-1">
                                  <HugeiconsIcon icon={LockIcon} size={10} />
                                  TEE
                                </span>
                                <span className="text-xs font-mono text-muted-foreground">
                                  {roundData.confidence}%
                                </span>
                              </div>
                            </button>
                            <div className="w-full bg-secondary/50 rounded-full h-1.5">
                              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${roundData.confidence}%` }} />
                            </div>
                            {isExpanded && (
                              <div className="pt-1 space-y-2 text-sm">
                                <div>
                                  <p className="text-[10px] font-mono text-primary mb-0.5">Analysis</p>
                                  <p className="text-muted-foreground">{roundData.analysis}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-mono text-primary mb-0.5">Findings</p>
                                  <p className="text-muted-foreground">{roundData.findings}</p>
                                </div>
                                {roundData.resolution && (
                                  <div>
                                    <p className="text-[10px] font-mono text-primary mb-0.5">Resolution</p>
                                    <p className="font-medium">{roundData.resolution}{roundData.explanation ? ` — ${roundData.explanation}` : ""}</p>
                                  </div>
                                )}
                                <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground pt-1">
                                  <span>Model: {roundData.model_id}</span>
                                  <span className="text-success">Ed25519 verified</span>
                                </div>
                              </div>
                            )}
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (msg.type === "ai_status") {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <p className="text-[10px] font-mono text-primary/60 px-3 py-1 bg-primary/5 rounded-full">
                            {msg.content}
                          </p>
                        </div>
                      );
                    }

                    if (msg.type === "evidence") {
                      const evidence = msg.data as EvidenceData | undefined;
                      const isSelf = msg.sender === accountId;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                          <div className={`max-w-[85%] p-3 rounded-lg ${isSelf ? "bg-primary/10 border border-primary/20" : "bg-secondary/50 border border-border"}`}>
                            <p className="text-xs text-muted-foreground mb-1 font-mono">
                              {msg.sender === contract.client ? "Client" : msg.sender === contract.freelancer ? "Freelancer" : msg.sender}
                            </p>
                            <div className="flex items-center gap-2 py-1">
                              <HugeiconsIcon icon={Attachment01Icon} size={16} className="text-accent shrink-0" />
                              <div>
                                <p className="text-sm font-medium">{evidence?.fileName || "File"}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  {evidence?.fileSize ? `${(evidence.fileSize / 1024).toFixed(1)} KB` : ""}
                                  {evidence?.cid ? " · encrypted via NOVA" : " · pending upload"}
                                </p>
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    const isSelf = msg.sender === accountId;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg relative ${isSelf ? "bg-primary/10 border border-primary/20" : "bg-secondary/50 border border-border"}`}>
                          <p className="text-xs text-muted-foreground mb-1 font-mono">
                            {msg.sender === contract.client ? "Client" : msg.sender === contract.freelancer ? "Freelancer" : msg.sender}
                          </p>
                          <p className="text-sm pb-4">{msg.content}</p>
                          <p className={`text-[10px] text-muted-foreground absolute ${isSelf ? "bottom-2 right-3" : "bottom-2 left-3"}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {aiProcessing && (
                    <div className="flex justify-center">
                      <div className="px-4 py-2 rounded-full bg-primary/5 border border-primary/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-xs font-mono text-primary">
                          AI investigation in progress...
                        </p>
                        <span className="flex items-center gap-1 text-[10px] font-mono text-success">
                          <HugeiconsIcon icon={LockIcon} size={10} />
                          TEE
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {userRole && (
                  <div className="p-3 border-t border-border">
                    <div className="relative flex items-end gap-2">
                      <Textarea
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="text-sm min-h-[80px] max-h-[150px] resize-none pr-16"
                        rows={3}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.txt,.doc,.docx"
                        className="hidden"
                        onChange={handleEvidenceUpload}
                      />
                      <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingEvidence}
                        >
                          <HugeiconsIcon icon={Attachment01Icon} size={16} />
                        </Button>
                        <Button
                          variant="hero"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={handleSendMessage}
                          disabled={sendMessage.isPending}
                        >
                          <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 shrink-0 overflow-y-auto space-y-4">
              <div className="space-y-3">
                <div>
                  <h1 className="text-xl font-bold mb-2">{contract.title}</h1>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={contract.status} />
                    {userRole && (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium capitalize ${
                        isClient ? "bg-primary/15 text-primary border-primary/30" : "bg-accent/15 text-accent border-accent/30"
                      }`}>
                        {userRole}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm font-mono text-muted-foreground">
                  {yoctoToNear(contract.total_amount)} NEAR · {yoctoToNear(contract.funded_amount)} funded
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <HugeiconsIcon icon={EyeIcon} size={14} className="mr-1" />
                      View Full Description
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{contract.title}</DialogTitle>
                      <DialogDescription>{contract.description}</DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Milestones</h2>
                  <span className="text-xs font-mono text-muted-foreground">{completed}/{contract.milestones.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
                {contract.milestones.map((milestone, i) => {
                  const IconComponent = milestoneIconMap[milestone.status];
                  return (
                    <motion.div
                      key={milestone.id}
                      className="p-4 rounded-xl bg-card border border-border"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {IconComponent && (
                            <HugeiconsIcon icon={IconComponent} size={18} className={`${milestoneIconClass[milestone.status]} shrink-0 mt-0.5`} />
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm truncate">{milestone.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{milestone.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="font-mono font-bold text-sm">{yoctoToNear(milestone.amount)} NEAR</p>
                        <div className="flex gap-2">
                          {milestone.status === "NotFunded" && isClient && (
                            <FundMilestoneDialog
                              contractId={contract.id}
                              milestoneId={milestone.id}
                              amountYocto={milestone.amount}
                              onFundDirect={() => handleFund(milestone.id, milestone.amount)}
                              isPending={fundMutation.isPending}
                            />
                          )}
                          {milestone.status === "Funded" && isFreelancer && (
                            <Button
                              size="sm"
                              variant="hero"
                              onClick={() => handleStart(milestone.id)}
                              disabled={startMutation.isPending}
                            >
                              <HugeiconsIcon icon={PlayIcon} size={12} className="mr-1" />
                              Start
                            </Button>
                          )}
                          {(milestone.status === "InProgress" || milestone.status === "SubmittedForReview") && isClient && (
                            <Button
                              size="sm"
                              variant="hero"
                              onClick={() => handleApprove(milestone.id)}
                              disabled={approveMutation.isPending}
                            >
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="mr-1" />
                              Approve
                            </Button>
                          )}
                          {(milestone.status === "InProgress" || milestone.status === "SubmittedForReview") && userRole && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDisputeMilestoneId(milestone.id)}
                            >
                              <HugeiconsIcon icon={Alert01Icon} size={12} className="mr-1" />
                              Dispute
                            </Button>
                          )}
                          {milestone.status === "Completed" && (
                            <span className="text-xs text-success font-mono inline-flex items-center gap-1">
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} /> Paid
                            </span>
                          )}
                          <StatusBadge status={milestone.status} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Dispute Filing */}
              {disputeMilestoneId && (
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3">
                  <h3 className="text-sm font-semibold text-destructive">Raise Dispute</h3>
                  <Textarea
                    placeholder="Explain the reason for this dispute..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={handleDispute} disabled={disputeMutation.isPending || aiResolutionMutation.isPending || !disputeReason.trim()}>
                      Submit Dispute
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setDisputeMilestoneId(null); setDisputeReason(""); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Active Disputes */}
              {contract.disputes.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold px-1 text-destructive">Disputes</h2>
                  {contract.disputes.map((dispute, i) => (
                    <div key={i} className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <HugeiconsIcon icon={Alert01Icon} size={16} className="text-destructive" />
                        <StatusBadge status={dispute.status} />
                        {dispute.is_appeal && (
                          <span className="text-xs font-mono text-warning">Appeal</span>
                        )}
                      </div>
                      <p className="text-sm">{dispute.reason}</p>

                      {/* AI Resolution Card */}
                      {dispute.resolution && (dispute.status === "AiResolved" || dispute.status === "AppealResolved") && (
                        <div className="p-3 rounded-lg bg-card border border-border space-y-2">
                          <p className="text-xs text-primary font-mono flex items-center gap-1">
                            <HugeiconsIcon icon={AiBrain01Icon} size={12} />
                            AI {dispute.is_appeal ? "Appeal " : ""}Resolution
                          </p>
                          <p className="text-sm font-medium">{formatResolution(dispute.resolution)}</p>
                          {dispute.explanation && (
                            <p className="text-sm text-muted-foreground">{dispute.explanation}</p>
                          )}
                          {dispute.tee_text && (
                            <p className="text-[10px] text-success font-mono">TEE-verified Ed25519 signature on-chain</p>
                          )}
                          {dispute.deadline_ns && (
                            <p className="text-xs text-muted-foreground font-mono">
                              Auto-executes: {new Date(dispute.deadline_ns / 1e6).toLocaleString()}
                            </p>
                          )}

                          {userRole && (
                            <div className="flex gap-2 pt-2">
                              {!(isClient ? dispute.client_accepted : dispute.freelancer_accepted) && (
                                <Button
                                  size="sm"
                                  variant="hero"
                                  onClick={() => handleAcceptResolution(dispute.milestone_id)}
                                  disabled={acceptMutation.isPending}
                                >
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="mr-1" />
                                  Accept
                                </Button>
                              )}
                              {dispute.status === "AiResolved" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAppeal(dispute.milestone_id)}
                                  disabled={appealMutation.isPending || aiResolutionMutation.isPending}
                                >
                                  Appeal for Thorough Review
                                </Button>
                              )}
                              {(isClient ? dispute.client_accepted : dispute.freelancer_accepted) && (
                                <span className="text-xs text-success font-mono">You accepted</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {(dispute.status === "Pending" || dispute.status === "Appealed") && (
                        <div className="space-y-2">
                          {aiProcessing === dispute.milestone_id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              <p className="text-xs font-mono text-primary">
                                AI investigating · see chat
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs font-mono text-muted-foreground">
                              {dispute.investigation_rounds.length > 0
                                ? `${dispute.investigation_rounds.length} round${dispute.investigation_rounds.length > 1 ? "s" : ""} completed · see chat`
                                : `Waiting for ${dispute.is_appeal ? "appeal " : ""}investigation...`}
                            </p>
                          )}
                        </div>
                      )}
                      {dispute.status === "Finalized" && dispute.resolution && (
                        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                          <p className="text-xs text-success font-mono mb-1">Finalized</p>
                          <p className="text-sm font-medium">{formatResolution(dispute.resolution)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractDetailPage;
