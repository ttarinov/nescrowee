import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, ArrowRight01Icon, Wallet01Icon } from "@hugeicons/core-free-icons";
import { useWallet } from "@/hooks/useWallet";
import { useUserContracts } from "@/hooks/useContract";
import { yoctoToNear } from "@/utils/format";

const ContractsPage = () => {
  const { accountId, isConnected, connect } = useWallet();
  const { data: contracts, isLoading } = useUserContracts(accountId);

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto mt-20">
            <HugeiconsIcon icon={Wallet01Icon} size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your HOT Wallet to view and manage your contracts.
            </p>
            <Button variant="hero" size="lg" onClick={connect}>
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              <HugeiconsIcon icon={PlusSignIcon} size={16} className="mr-1" />
              New Contract
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-xl bg-card animate-pulse h-24" />
            ))}
          </div>
        ) : !contracts?.length ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No contracts yet</p>
            <Link to="/create">
              <Button variant="hero">Create Your First Contract</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {contracts.map((contract, i) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/contracts/${contract.id}`}>
                  <div className="relative p-6 rounded-[24px] bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-primary/30 transition-all group overflow-hidden">
                    <div className="absolute top-[-60px] left-[-60px] w-[180px] h-[180px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-[-40px] right-[-40px] w-[120px] h-[120px] bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-xl text-white group-hover:text-primary transition-colors">
                            {contract.title}
                          </h3>
                          <StatusBadge status={contract.status} />
                        </div>
                        <p className="text-sm text-white/50 line-clamp-1 mb-3">
                          {contract.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40 font-mono">
                            {contract.freelancer ? "2 parties" : "Awaiting freelancer"}
                          </span>
                          <div className="flex-1 max-w-[160px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                              style={{ width: `${(contract.milestones.filter((m) => m.status === "Completed").length / contract.milestones.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/40 font-mono">
                            {contract.milestones.filter((m) => m.status === "Completed").length}/{contract.milestones.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold font-mono text-white">{yoctoToNear(contract.total_amount)}</p>
                          <p className="text-xs text-white/40">NEAR</p>
                        </div>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-white/30 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;
