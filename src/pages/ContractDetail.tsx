import { useParams, Link } from "react-router-dom";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { mockContracts, mockDisputes } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Alert01Icon,
  Link01Icon,
  MailSend01Icon,
  Attachment01Icon,
  Dollar01Icon,
  InformationCircleIcon,
  Wallet01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

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
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  const handleFund = (milestoneTitle: string, amount: number) => {
    window.open(
      `https://hot-labs.org/pay/?amount=${amount}&receiver=escrow.nearcord.near&memo=${encodeURIComponent(`Fund: ${milestoneTitle}`)}`,
      "_blank"
    );
    toast.success(`Funding initiated for ${milestoneTitle}`);
  };

  const handleConfirm = (milestoneTitle: string) => {
    toast.success(`Milestone "${milestoneTitle}" confirmed! Payment released.`);
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

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <Link to="/contracts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Back to contracts
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{contract.title}</h1>
                <StatusBadge status={contract.status} />
              </div>
              <div className="text-sm font-mono text-muted-foreground">
                {contract.totalAmount.toLocaleString()} NEAR • {contract.budgetType === "total" ? "Total" : "Milestones"}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{contract.description}</p>
          </div>

          <div className="flex gap-4 h-[calc(100vh-20rem)]">
            {/* Main: Chat area */}
            <div className="flex-1">
              <div className="rounded-xl bg-card border border-border flex flex-col h-full">
                <div className="p-3 border-b border-border">
                  <h3 className="font-semibold flex items-center gap-2">
                    <HugeiconsIcon icon={InformationCircleIcon} size={16} />
                    Contract Chat & Activity
                  </h3>
                  <p className="text-xs text-muted-foreground">Messages, files, and action history</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {contract.chatMessages.map((msg) => {
                    if (msg.type === "action") {
                      return (
                        <div key={msg.id} className="flex items-start gap-2">
                          <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-primary">{msg.content}</p>
                            <p className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</p>
                          </div>
                        </div>
                      );
                    }
                    const isClient = msg.sender === "client";
                    return (
                      <div key={msg.id} className={`flex flex-col ${isClient ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg ${isClient ? "bg-primary/10 border border-primary/20" : "bg-secondary/50 border border-border"}`}>
                          <p className="text-[10px] font-mono text-muted-foreground mb-1 capitalize">{msg.sender}</p>
                          {msg.type === "file" ? (
                            <div className="flex items-center gap-2 text-sm">
                              <HugeiconsIcon icon={Attachment01Icon} size={12} className="text-primary" />
                              <span className="text-primary underline cursor-pointer">{msg.fileName}</span>
                            </div>
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatTime(msg.timestamp)}</p>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Input with textarea */}
                <div className="p-3 border-t border-border">
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="absolute left-2 top-2 z-10" onClick={handleFileAttach}>
                      <HugeiconsIcon icon={Attachment01Icon} size={16} />
                    </Button>
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
                      className="text-sm pl-10 pr-12 min-h-[60px] max-h-[120px] resize-none"
                      rows={2}
                    />
                    <Button 
                      variant="hero" 
                      size="sm" 
                      className="absolute right-2 bottom-2 z-10" 
                      onClick={handleSendMessage}
                    >
                      <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar: Milestones + Disputes */}
            <div className="w-80 shrink-0 overflow-y-auto space-y-4">
              {/* Progress */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-mono text-muted-foreground">{completed}/{contract.milestones.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold px-1">Milestones</h2>
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
                          <HugeiconsIcon icon={milestoneIconMap[displayStatus]} size={18} className={`${milestoneIconClass[displayStatus]} shrink-0 mt-0.5`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm truncate">{milestone.title}</h3>
                              {displayStatus !== "funded" && <StatusBadge status={displayStatus} />}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{milestone.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="font-mono font-bold text-sm">{milestone.amount} NEAR</p>
                        <div className="flex gap-2">
                          {displayStatus === "not_funded" && (
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
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="hero"
                                onClick={() => handleConfirm(milestone.title)}
                              >
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDispute(milestone.id)}
                              >
                                Dispute
                              </Button>
                            </div>
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
