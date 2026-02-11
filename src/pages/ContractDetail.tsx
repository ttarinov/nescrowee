import { useParams, Link } from "react-router-dom";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { mockContracts, mockDisputes } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
  Send,
  Paperclip,
  DollarSign,
  Info,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

const milestoneIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="w-5 h-5 text-success" />,
  in_progress: <Clock className="w-5 h-5 text-primary" />,
  funded: <Wallet className="w-5 h-5 text-warning" />,
  not_funded: <DollarSign className="w-5 h-5 text-muted-foreground" />,
  disputed: <AlertTriangle className="w-5 h-5 text-destructive" />,
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
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/contracts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to contracts
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{contract.title}</h1>
              <StatusBadge status={contract.status} />
            </div>
            <p className="text-muted-foreground">{contract.description}</p>
          </div>

          {/* Stats — no wallet addresses shown */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Value", value: `${contract.totalAmount.toLocaleString()} NEAR` },
              { label: "Security Deposit", value: `${contract.securityDeposit} NEAR` },
              { label: "Budget Type", value: contract.budgetType === "total" ? "Total Budget" : "Per Milestone" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-lg bg-card border border-border">
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="font-mono font-semibold text-sm truncate">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left column: milestones + disputes */}
            <div className="lg:col-span-3 space-y-6">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-mono text-muted-foreground">{completed}/{contract.milestones.length} milestones</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Milestones</h2>
                {contract.milestones.map((milestone, i) => (
                  <motion.div
                    key={milestone.id}
                    className="p-5 rounded-xl bg-card border border-border"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {milestoneIcons[milestone.status]}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{milestone.title}</h3>
                            <StatusBadge status={milestone.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-mono font-bold">{milestone.amount} NEAR</p>
                        {milestone.status === "not_funded" && (
                          <Button
                            size="sm"
                            variant="hero"
                            onClick={() => handleFund(milestone.title, milestone.amount)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Fund via HOT
                          </Button>
                        )}
                        {milestone.status === "funded" && (
                          <span className="text-xs text-warning font-mono">Funded — waiting for work</span>
                        )}
                        {milestone.status === "in_progress" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="hero"
                              onClick={() => handleConfirm(milestone.title)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Confirm & Pay
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
                        {milestone.status === "completed" && (
                          <span className="text-xs text-success font-mono">Paid ✓</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Disputes */}
              {disputes.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-destructive">Active Disputes</h2>
                  {disputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      className="p-5 rounded-xl bg-destructive/5 border border-destructive/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
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

            {/* Right column: Chat + Activity */}
            <div className="lg:col-span-2">
              <div className="rounded-xl bg-card border border-border flex flex-col h-[600px]">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Contract Chat & Activity</h3>
                  <p className="text-xs text-muted-foreground">Messages, files, and action history</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {contract.chatMessages.map((msg) => {
                    if (msg.type === "action") {
                      return (
                        <div key={msg.id} className="flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
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
                              <Paperclip className="w-3 h-3 text-primary" />
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

                {/* Input */}
                <div className="p-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="shrink-0" onClick={handleFileAttach}>
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="text-sm"
                    />
                    <Button variant="hero" size="sm" className="shrink-0" onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractDetail;
