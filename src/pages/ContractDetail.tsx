import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { mockContracts, mockDisputes } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

const milestoneIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="w-5 h-5 text-success" />,
  in_progress: <Clock className="w-5 h-5 text-primary" />,
  pending: <Clock className="w-5 h-5 text-muted-foreground" />,
  disputed: <AlertTriangle className="w-5 h-5 text-destructive" />,
};

const ContractDetail = () => {
  const { id } = useParams();
  const contract = mockContracts.find((c) => c.id === id);
  const disputes = mockDisputes.filter((d) => d.contractId === id);

  if (!contract) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Contract not found</p>
      </div>
    );
  }

  const completed = contract.milestones.filter((m) => m.status === "completed").length;
  const progress = (completed / contract.milestones.length) * 100;

  const handlePay = (milestoneTitle: string, amount: number) => {
    window.open(
      `https://hot-labs.org/pay/?amount=${amount}&receiver=${contract.freelancerAddress}&memo=${encodeURIComponent(milestoneTitle)}`,
      "_blank"
    );
    toast.success(`Payment initiated for ${milestoneTitle}`);
  };

  const handleDispute = (milestoneId: string) => {
    toast.info("Dispute filed. A judge will be assigned shortly.");
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Value", value: `${contract.totalAmount.toLocaleString()} NEAR` },
              { label: "Security Deposit", value: `${contract.securityDeposit} NEAR` },
              { label: "Client", value: contract.clientAddress },
              { label: "Freelancer", value: contract.freelancerAddress },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-lg bg-card border border-border">
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="font-mono font-semibold text-sm truncate">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-mono text-muted-foreground">{completed}/{contract.milestones.length} milestones</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Milestones */}
          <div className="space-y-3 mb-8">
            <h2 className="text-xl font-semibold mb-4">Milestones</h2>
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
                    {milestone.status === "in_progress" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="hero"
                          onClick={() => handlePay(milestone.title, milestone.amount)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Pay via HOT
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
                    <span className="text-xs font-mono text-muted-foreground">
                      Raised by {dispute.raisedBy}
                    </span>
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
        </motion.div>
      </div>
    </div>
  );
};

export default ContractDetail;
