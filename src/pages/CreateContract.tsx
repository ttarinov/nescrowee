import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface MilestoneForm {
  title: string;
  description: string;
  amount: string;
}

const CreateContract = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [securityPercent, setSecurityPercent] = useState("10");
  const [milestones, setMilestones] = useState<MilestoneForm[]>([
    { title: "", description: "", amount: "" },
  ]);

  const totalAmount = milestones.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0);
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
    if (!title || !clientAddress || !freelancerAddress) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (milestones.some((m) => !m.title || !m.amount)) {
      toast.error("All milestones need a title and amount");
      return;
    }
    toast.success("Contract created! (Demo mode)");
    navigate("/contracts");
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Create Contract</h1>
          <p className="text-muted-foreground mb-8">
            Set up an escrow contract with milestone-based payments.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contract Info */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <h2 className="font-semibold text-lg">Contract Details</h2>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website Redesign" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the scope of work..." className="mt-1" rows={3} />
              </div>
            </div>

            {/* Parties */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <h2 className="font-semibold text-lg">Parties</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client Address *</Label>
                  <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="alice.near" className="mt-1 font-mono text-sm" />
                </div>
                <div>
                  <Label>Freelancer Address *</Label>
                  <Input value={freelancerAddress} onChange={(e) => setFreelancerAddress(e.target.value)} placeholder="bob.near" className="mt-1 font-mono text-sm" />
                </div>
              </div>
              <div>
                <Label>Security Deposit (%)</Label>
                <Input type="number" value={securityPercent} onChange={(e) => setSecurityPercent(e.target.value)} min="0" max="50" className="mt-1 w-32 font-mono" />
              </div>
            </div>

            {/* Milestones */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Milestones</h2>
                <Button type="button" variant="ghost" size="sm" onClick={addMilestone}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
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
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Input placeholder="Title *" value={m.title} onChange={(e) => updateMilestone(i, "title", e.target.value)} />
                    </div>
                    <Input placeholder="Amount (NEAR)" type="number" value={m.amount} onChange={(e) => updateMilestone(i, "amount", e.target.value)} className="font-mono" />
                  </div>
                  <Input placeholder="Description" value={m.description} onChange={(e) => updateMilestone(i, "description", e.target.value)} />
                </motion.div>
              ))}
            </div>

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
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Milestones</span>
                <span className="font-mono">{milestones.length}</span>
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full text-base">
              Create Contract
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateContract;
