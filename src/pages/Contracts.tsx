import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { mockContracts } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";

const Contracts = () => {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Contracts</h1>
            <p className="text-muted-foreground mt-1">Manage your escrow contracts</p>
          </div>
          <Link to="/create">
            <Button variant="hero" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Contract
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {mockContracts.map((contract, i) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/contracts/${contract.id}`}>
                <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {contract.title}
                        </h3>
                        <StatusBadge status={contract.status} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                        {contract.description}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        2 parties · {contract.budgetType === "total" ? "Total budget" : "Per milestone"}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold font-mono">{contract.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">NEAR</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-muted-foreground">
                          {contract.milestones.filter((m) => m.status === "completed").length}/{contract.milestones.length}
                        </p>
                        <p className="text-xs text-muted-foreground">milestones</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contracts;
