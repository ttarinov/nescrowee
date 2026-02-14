import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Delete01Icon, ArrowRight01Icon, Copy01Icon, Link01Icon, UserGroupIcon, UserCheck01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

interface MilestoneForm {
  title: string;
  description: string;
  amount: string;
}

type BudgetType = "milestones" | "total";
type UserRole = "client" | "freelancer";

const CreateContract = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>("client");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [securityPercent, setSecurityPercent] = useState("10");
  const [budgetType, setBudgetType] = useState<BudgetType>("milestones");
  const [totalBudget, setTotalBudget] = useState("");
  const [milestones, setMilestones] = useState<MilestoneForm[]>([
    { title: "", description: "", amount: "" },
  ]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const totalAmount = budgetType === "total"
    ? (parseFloat(totalBudget) || 0)
    : milestones.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0);
  const securityDeposit = totalAmount * (parseFloat(securityPercent) / 100);

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", description: "", amount: "" }]);
  };

  const removeMilestone = (i: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, idx) => idx !== i));
  };

  const updateMilestone = (i: number, field: keyof MilestoneForm, value: string) => {
    const updated = [...milestones];
    updated[i] = { ...updated[i], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Please provide a contract title");
      return;
    }
    if (budgetType === "milestones") {
      if (milestones.length === 0 || milestones.every((m) => !m.title)) {
        toast.error("Add at least one milestone with a title");
        return;
      }
      if (milestones.some((m) => !m.title || !m.amount)) {
        toast.error("All milestones need a title and amount");
        return;
      }
    }
    if (budgetType === "total" && !totalBudget) {
      toast.error("Please specify the total budget");
      return;
    }

    if (!freelancerAddress) {
      const token = Math.random().toString(36).substring(2, 10);
      const link = `${window.location.origin}/invite/${token}`;
      setInviteLink(link);
      toast.success("Contract created! Share the invite link with your counterparty.");
      return;
    }

    toast.success("Contract created! (Demo mode)");
    navigate("/contracts");
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard!");
    }
  };

  if (inviteLink) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center"
          >
            <HugeiconsIcon icon={Link01Icon} size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Contract Created!</h2>
            <p className="text-muted-foreground mb-6">
              Share this invite link with the other party. They'll be able to join and provide their wallet address.
              Neither party will see each other's wallet addresses — all payments are handled through escrow.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border max-w-md mx-auto mb-6">
              <code className="text-sm text-primary font-mono flex-1 truncate">{inviteLink}</code>
              <Button variant="ghost" size="sm" onClick={copyInviteLink}>
                <HugeiconsIcon icon={Copy01Icon} size={16} />
              </Button>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="hero" onClick={() => navigate("/contracts")}>
                Go to Contracts
              </Button>
              <Button variant="ghost" onClick={() => setInviteLink(null)}>
                Edit Contract
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-8">Create Contract</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6 h-[calc(100vh-16rem)]">
              {/* Left: Title + Description (full height) */}
              <div className="flex flex-col space-y-4">
                <div className="flex-1 flex flex-col space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-base font-semibold">Contract Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Website Redesign"
                      className="mt-2 text-lg h-12"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <Label htmlFor="desc" className="text-base font-semibold mb-2">Description</Label>
                    <Textarea
                      id="desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the scope of work, deliverables, timeline, and any specific requirements..."
                      className="flex-1 resize-none text-base"
                    />
                  </div>
                </div>
              </div>

                <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={userRole === "client" ? "hero" : "outline"}
                      size="sm"
                      onClick={() => setUserRole("client")}
                      className="flex-1"
                    >
                      <HugeiconsIcon icon={UserCheck01Icon} size={16} className="mr-1" />
                      Client
                    </Button>
                    <Button
                      type="button"
                      variant={userRole === "freelancer" ? "hero" : "outline"}
                      size="sm"
                      onClick={() => setUserRole("freelancer")}
                      className="flex-1"
                    >
                      <HugeiconsIcon icon={UserGroupIcon} size={16} className="mr-1" />
                      Freelancer
                    </Button>
                  </div>

                  <h2 className="font-semibold text-lg">Counterparty</h2>
                  <p className="text-sm text-muted-foreground">
                    Leave empty to generate an invite link. The other party will provide their wallet upon joining.
                    Wallet addresses are never shared between parties.
                  </p>
                  <div className="grid grid-cols-5 gap-2 w-full">
                  <div className="col-span-3 w-full">
                    <Label>Counterparty Wallet (optional)</Label>
                    <Input value={freelancerAddress} onChange={(e) => setFreelancerAddress(e.target.value)} placeholder="Leave empty for invite link" className="mt-1 font-mono text-sm" />
                  </div>
                  <div className="col-span-2 w-full">
                    <Label>Security Deposit (%)</Label>
                    <Input type="number" value={securityPercent} onChange={(e) => setSecurityPercent(e.target.value)} min="0" max="50" className="mt-1 w-32 font-mono" />
                  </div>
                  </div>

                <div className="flex gap-2 flex-row">
                  <h2 className="font-semibold text-md">Budget Type</h2>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={budgetType === "milestones" ? "hero" : "ghost"}
                      size="sm"
                      onClick={() => setBudgetType("milestones")}
                    >
                      By Milestones
                    </Button>
                    <Button
                      type="button"
                      variant={budgetType === "total" ? "hero" : "ghost"}
                      size="sm"
                      onClick={() => setBudgetType("total")}
                    >
                      Total Budget
                    </Button>
                  </div>
                  {budgetType === "total" && (
                    <div>
                      <Label>Total Budget (NEAR)</Label>
                      <Input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} placeholder="e.g. 5000" className="mt-1 w-48 font-mono" />
                    </div>
                  )}
                </div>

                {budgetType === "milestones" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-lg">Milestones *</h2>
                      <Button type="button" variant="ghost" size="sm" onClick={addMilestone}>
                        <HugeiconsIcon icon={PlusSignIcon} size={16} className="mr-1" /> Add
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Each milestone must have a title and amount. Funds are escrowed per milestone.
                    </p>
                    {milestones.map((m, i) => (
                      <motion.div
                        key={i}
                        className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-muted-foreground">
                            Milestone {i + 1}
                          </span>
                          {milestones.length > 1 && (
                            <button type="button" onClick={() => removeMilestone(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <HugeiconsIcon icon={Delete01Icon} size={16} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <Input placeholder="Title *" value={m.title} onChange={(e) => updateMilestone(i, "title", e.target.value)} />
                          </div>
                          <Input
                            placeholder="Amount (NEAR) *"
                            type="number"
                            value={m.amount}
                            onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                            className="font-mono"
                          />
                        </div>
                        <Input placeholder="Description" value={m.description} onChange={(e) => updateMilestone(i, "description", e.target.value)} />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Summary */}
                <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <h2 className="font-semibold text-lg">Summary</h2>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Contract Value</span>
                    <span className="font-mono font-bold">{totalAmount.toLocaleString()} NEAR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Security Deposit ({securityPercent}%)</span>
                    <span className="font-mono">{securityDeposit.toFixed(1)} NEAR</span>
                  </div>
                  {budgetType === "milestones" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Milestones</span>
                      <span className="font-mono">{milestones.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget Type</span>
                    <span className="font-mono capitalize">{budgetType}</span>
                  </div>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full text-base">
                  {freelancerAddress ? "Create Contract" : "Create & Get Invite Link"}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateContract;
