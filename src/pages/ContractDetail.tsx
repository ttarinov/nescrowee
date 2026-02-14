import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { mockContracts, mockDisputes } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
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
  Link01Icon,
  Attachment01Icon,
  Dollar01Icon,
  InformationCircleIcon,
  Wallet01Icon,
  ArrowUp01Icon,
  EyeIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { groupMessagesByDate, formatMessageTime, formatMessageDate } from "@/utils/dateHelpers";

const milestoneIconMap = {
  completed: CheckmarkCircle01Icon,
  in_progress: Clock01Icon,
  funded: Wallet01Icon,
  not_funded: Dollar01Icon,
  disputed: Alert01Icon,
} as const;
const milestoneIconClass: Record<string, string> = {
  completed: "text-success",
  in_progress: "text-primary",
  funded: "text-warning",
  not_funded: "text-muted-foreground",
  disputed: "text-destructive",
};

const ContractDetail = () => {
  const { id } = useParams();
  const contract = mockContracts.find((c) => c.id === id);
  const disputes = mockDisputes.filter((d) => d.contractId === id);
  const [chatInput, setChatInput] = useState("");
  const [userRole, setUserRole] = useState<"client" | "freelancer" | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentWallet = localStorage.getItem("walletAddress") || "alice.near";
    if (contract) {
      if (currentWallet === contract.clientAddress) {
        setUserRole("client");
      } else if (currentWallet === contract.freelancerAddress) {
        setUserRole("freelancer");
      }
    }
  }, [contract]);

  if (!contract) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Contract not found</p>
      </div>
    );
  }

  const completed = contract.milestones.filter((m) => m.status === "completed").length;
  const progress = (completed / contract.milestones.length) * 100;

  const canShowFunded = (milestoneIndex: number) => {
    if (milestoneIndex === 0) return true;
    const prevMilestone = contract.milestones[milestoneIndex - 1];
    return prevMilestone.status === "completed";
  };

  const canFundMilestone = (milestoneIndex: number) => {
    const previousMilestones = contract.milestones.slice(0, milestoneIndex);
    const hasInProgress = previousMilestones.some((m) => m.status === "in_progress");
    return !hasInProgress && contract.milestones[milestoneIndex].status === "not_funded";
  };

  const hasInProgressMilestone = contract.milestones.some((m) => m.status === "in_progress");
  const showDisputeButton = userRole === "freelancer" && hasInProgressMilestone;

  const handleFund = (milestoneTitle: string, amount: number) => {
    window.open(
      `https://hot-labs.org/pay/?amount=${amount}&receiver=escrow.nearcord.near&memo=${encodeURIComponent(`Fund: ${milestoneTitle}`)}`,
      "_blank"
    );
    toast.success(`Funding initiated for ${milestoneTitle}`);
  };

  const handleDispute = (milestoneId: string) => {
    toast.info("Dispute filed. A judge will be assigned shortly.");
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    toast.success("Message sent (demo)");
    setChatInput("");
  };

  const handleFileAttach = () => {
    toast.info("File sharing coming soon — attach documents, screenshots, and deliverables.");
  };

  const groupedMessages = groupMessagesByDate(contract.chatMessages);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <Link to="/contracts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Back to contracts
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex gap-4 h-[calc(100vh-20rem)]">
            {/* Main: Chat area */}
            <div className="flex-1">
              <div className="rounded-xl bg-card border border-border flex flex-col h-full">
                <div className="p-3 border-b border-border">
                  <h3 className="font-semibold flex items-center gap-2">
                    <HugeiconsIcon icon={InformationCircleIcon} size={16} />
                    Contract Chat & Activity
                  </h3>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {groupedMessages.map((item, idx) => {
                    if (item.type === "date") {
                      return (
                        <div key={`date-${idx}`} className="flex items-center justify-center py-2">
                          <span className="text-xs text-muted-foreground bg-card px-3 py-1 rounded-full border border-border">
                            {item.date}
                          </span>
                        </div>
                      );
                    }

                    const msg = item.message!;
                    if (msg.type === "action") {
                      return (
                        <div key={msg.id} className="flex items-center justify-center">
                          <div className="max-w-[80%] text-center">
                            <p className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-lg inline-block">
                              {msg.content}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">{formatMessageTime(msg.timestamp)}</p>
                          </div>
                        </div>
                      );
                    }

                    const isClient = msg.sender === "client";
                    return (
                      <div key={msg.id} className={`flex flex-col ${isClient ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg relative ${isClient ? "bg-primary/10 border border-primary/20" : "bg-secondary/50 border border-border"}`}>
                          {msg.type === "file" ? (
                            <div className="flex items-center gap-2 text-sm pb-4">
                              <HugeiconsIcon icon={Attachment01Icon} size={12} className="text-primary" />
                              <span className="text-primary underline cursor-pointer">{msg.fileName}</span>
                            </div>
                          ) : (
                            <p className="text-sm pb-4">{msg.content}</p>
                          )}
                          <p className={`text-[10px] text-muted-foreground absolute ${isClient ? "bottom-2 right-3" : "bottom-2 left-3"}`}>
                            {formatMessageTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Input with textarea */}
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
                      className="text-sm min-h-[80px] max-h-[150px] resize-none pr-24"
                      rows={3}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleFileAttach}>
                        <HugeiconsIcon icon={Attachment01Icon} size={16} />
                      </Button>
                      <Button
                        variant="hero"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={handleSendMessage}
                      >
                        <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
                      </Button>
                    </div>
                  </div>
                  {showDisputeButton && (
                    <div className="mt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const inProgressMilestone = contract.milestones.find((m) => m.status === "in_progress");
                          if (inProgressMilestone) {
                            handleDispute(inProgressMilestone.id);
                          }
                        }}
                      >
                        <HugeiconsIcon icon={Alert01Icon} size={14} className="mr-1" />
                        File Dispute
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right sidebar: Contract Info + Milestones + Disputes */}
            <div className="w-80 shrink-0 overflow-y-auto space-y-4">
              {/* Contract Header */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-xl font-bold mb-2">{contract.title}</h1>
                  {userRole && (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium capitalize ${
                      userRole === "client" 
                        ? "bg-primary/15 text-primary border-primary/30" 
                        : "bg-accent/15 text-accent border-accent/30"
                    }`}>
                      {userRole === "client" ? "Client" : "Freelancer"}
                    </span>
                  )}
                </div>
                <div className="text-sm font-mono text-muted-foreground">
                  {contract.totalAmount.toLocaleString()} NEAR • {contract.budgetType === "total" ? "Total" : "Milestones"}
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
                  const displayStatus = milestone.status === "funded" && !canShowFunded(i)
                    ? "not_funded"
                    : milestone.status;

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
                          {displayStatus === "completed" && (
                            <HugeiconsIcon icon={milestoneIconMap[displayStatus]} size={18} className={`${milestoneIconClass[displayStatus]} shrink-0 mt-0.5`} />
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm truncate">{milestone.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{milestone.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="font-mono font-bold text-sm">{milestone.amount} NEAR</p>
                        <div className="flex gap-2">
                          {canFundMilestone(i) && (
                            <Button
                              size="sm"
                              variant="hero"
                              onClick={() => handleFund(milestone.title, milestone.amount)}
                            >
                              <HugeiconsIcon icon={Link01Icon} size={12} className="mr-1" />
                              Fund
                            </Button>
                          )}
                          {displayStatus === "funded" && canShowFunded(i) && (
                            <span className="text-xs text-warning font-mono">Funded</span>
                          )}
                          {displayStatus === "in_progress" && (
                            <span className="text-xs text-primary font-mono">In Progress</span>
                          )}
                          {displayStatus === "completed" && (
                            <span className="text-xs text-success font-mono inline-flex items-center gap-1">
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} /> Paid
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Disputes */}
              {disputes.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold px-1 text-destructive">Active Disputes</h2>
                  {disputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      className="p-4 rounded-xl bg-destructive/5 border border-destructive/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <HugeiconsIcon icon={Alert01Icon} size={16} className="text-destructive" />
                        <StatusBadge status={dispute.status} />
                      </div>
                      <p className="text-sm mb-3">{dispute.reason}</p>
                      {dispute.aiSummary && (
                        <div className="p-3 rounded-lg bg-card border border-border">
                          <p className="text-xs text-muted-foreground mb-1 font-mono">AI Summary</p>
                          <p className="text-sm">{dispute.aiSummary}</p>
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

export default ContractDetail;
