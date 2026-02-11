import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/StatusBadge";
import { mockDisputes, mockContracts } from "@/data/mockData";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  JusticeScale01Icon,
  Shield01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  BalanceScaleIcon,
  UserCheck01Icon,
  Clock01Icon,
  EyeIcon,
  ViewOffIcon,
  AiBrain01Icon,
  UserGroupIcon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

const JudgePortal = () => {
  const [isJudge, setIsJudge] = useState(false);
  const [activeDispute, setActiveDispute] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<Record<string, string>>({});
  const [selectedVote, setSelectedVote] = useState<Record<string, "contractor" | "client" | null>>({});
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  const handleRegister = () => {
    setIsJudge(true);
    toast.success("Registered as judge! You'll be randomly assigned disputes.");
  };

  const handleAccept = (disputeId: string) => {
    setActiveDispute(disputeId);
    setExplanation({ ...explanation, [disputeId]: "" });
    setSelectedVote({ ...selectedVote, [disputeId]: null });
    toast.success("Dispute accepted. Review the AI summary and vote.");
  };

  const handleVoteSubmit = async (disputeId: string) => {
    const vote = selectedVote[disputeId];
    const expl = explanation[disputeId]?.trim();

    if (!vote) {
      toast.error("Please select who is right");
      return;
    }
    if (!expl) {
      toast.error("Please provide an explanation");
      return;
    }

    setProcessing({ ...processing, [disputeId]: true });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`Vote submitted: ${vote === "contractor" ? "Contractor is right" : "Client is right"}. LLM processing decision...`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Decision processed and submitted.");
    setProcessing({ ...processing, [disputeId]: false });
    setActiveDispute(null);
    setExplanation({ ...explanation, [disputeId]: "" });
    setSelectedVote({ ...selectedVote, [disputeId]: null });
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <HugeiconsIcon icon={JusticeScale01Icon} size={32} className="text-primary" />
            <h1 className="text-3xl font-bold">Judge Portal</h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Review disputes, vote on resolutions, and earn rewards.
          </p>

          {!isJudge ? (
            <motion.div
              className="p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <HugeiconsIcon icon={BalanceScaleIcon} size={48} className="text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Become a Judge</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Judges are randomly assigned to disputes, similar to how Uber assigns drivers.
                You'll review AI-processed summaries and vote on the resolution.
                Earn rewards from the security deposit pool.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                {[
                  { icon: Shield01Icon, label: "Privacy-First", desc: "See only AI summaries" },
                  { icon: UserCheck01Icon, label: "Random Assignment", desc: "Fair & unbiased" },
                  { icon: Clock01Icon, label: "Quick Reviews", desc: "Yes/No decisions" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-lg bg-card border border-border">
                    <HugeiconsIcon icon={item.icon} size={20} className="text-primary mx-auto mb-2" />
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Button variant="hero" size="lg" onClick={handleRegister}>
                Register as Judge
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Available Disputes", value: mockDisputes.length },
                  { label: "Cases Resolved", value: 0 },
                  { label: "Earnings", value: "0 NEAR" },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-xl bg-card border border-border text-center">
                    <p className="text-2xl font-bold font-mono">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Disputes */}
              <h2 className="text-xl font-semibold">Pending Disputes</h2>
              {mockDisputes.map((dispute) => {
                const contract = mockContracts.find((c) => c.id === dispute.contractId);
                const isActive = activeDispute === dispute.id;
                const milestone = contract?.milestones.find((m) => m.id === dispute.milestoneId);

                return (
                  <motion.div
                    key={dispute.id}
                    className="p-6 rounded-xl bg-card border border-border"
                    layout
                  >
                    {/* Basic meta — always visible */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{contract?.title || "Contract"}</h3>
                        <StatusBadge status={dispute.status} />
                      </div>
                      {!isActive && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="hero" onClick={() => handleAccept(dispute.id)}>
                            Accept
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => toast.info("Declined. Another judge will be assigned.")}>
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Pre-accept: only basic meta */}
                    {!isActive && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Disputed Milestone</p>
                            <p className="text-sm font-medium">{milestone?.title || "Unknown"}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Amount at Stake</p>
                            <p className="text-sm font-mono font-bold">{milestone?.amount || 0} NEAR</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <HugeiconsIcon icon={ViewOffIcon} size={12} />
                          <span>Accept to view AI summary and cast your vote</span>
                        </div>
                      </div>
                    )}

                    {/* Post-accept: full details */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-2 text-xs text-primary">
                          <HugeiconsIcon icon={EyeIcon} size={12} />
                          <span>Full dispute details unlocked</span>
                        </div>

                        {/* AI Summary */}
                        {dispute.aiSummary && (
                          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-xs font-mono text-primary mb-2 flex items-center gap-1"><HugeiconsIcon icon={AiBrain01Icon} size={12} /> AI-Processed Summary</p>
                            <p className="text-sm leading-relaxed">{dispute.aiSummary}</p>
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              Personal details and sensitive information have been redacted for privacy.
                            </p>
                          </div>
                        )}

                        {/* Voting */}
                        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-3">Decide who is right:</p>
                            <div className="flex gap-3">
                              <Button
                                variant={selectedVote[dispute.id] === "contractor" ? "hero" : "outline"}
                                className="flex-1"
                                onClick={() => setSelectedVote({ ...selectedVote, [dispute.id]: "contractor" })}
                                disabled={processing[dispute.id]}
                              >
                                <HugeiconsIcon icon={UserGroupIcon} size={16} className="mr-1" />
                                Contractor is right
                              </Button>
                              <Button
                                variant={selectedVote[dispute.id] === "client" ? "hero" : "outline"}
                                className="flex-1"
                                onClick={() => setSelectedVote({ ...selectedVote, [dispute.id]: "client" })}
                                disabled={processing[dispute.id]}
                              >
                                <HugeiconsIcon icon={UserCheck01Icon} size={16} className="mr-1" />
                                Client is right
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`explanation-${dispute.id}`} className="text-sm font-medium mb-2 block">
                              Explain your decision:
                            </Label>
                            <Textarea
                              id={`explanation-${dispute.id}`}
                              placeholder="Provide reasoning for your decision..."
                              value={explanation[dispute.id] || ""}
                              onChange={(e) => setExplanation({ ...explanation, [dispute.id]: e.target.value })}
                              className="min-h-[100px] resize-none"
                              disabled={processing[dispute.id]}
                            />
                          </div>

                          <Button
                            variant="hero"
                            className="w-full"
                            onClick={() => handleVoteSubmit(dispute.id)}
                            disabled={!selectedVote[dispute.id] || !explanation[dispute.id]?.trim() || processing[dispute.id]}
                          >
                            {processing[dispute.id] ? (
                              <>
                                <HugeiconsIcon icon={AiBrain01Icon} size={16} className="mr-1 animate-spin" />
                                Processing decision...
                              </>
                            ) : (
                              <>
                                <HugeiconsIcon icon={ArrowUp01Icon} size={16} className="mr-1" />
                                Submit Decision
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JudgePortal;
