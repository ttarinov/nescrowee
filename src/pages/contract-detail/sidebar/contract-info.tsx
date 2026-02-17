import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import StatusBadge from "@/components/status-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon } from "@hugeicons/core-free-icons";
import type { EscrowContract } from "@/types/escrow";

const yoctoToNear = (yocto: string) => {
  const val = BigInt(yocto || "0");
  return (Number(val) / 1e24).toFixed(2);
};

interface ContractInfoProps {
  contract: EscrowContract;
  userRole: "client" | "freelancer" | null;
}

export function ContractInfo({ contract, userRole }: ContractInfoProps) {
  const securityPoolNear = yoctoToNear(contract.security_pool);

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-bold mb-2 text-white">{contract.title}</h1>
        <div className="flex items-center gap-2">
          <StatusBadge status={contract.status} />
          {userRole && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium capitalize ${
                userRole === "client"
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-accent/15 text-accent border-accent/30"
              }`}
            >
              {userRole}
            </span>
          )}
        </div>
      </div>
      <div className="text-sm font-mono text-white/60 space-y-0.5">
        <p>
          {yoctoToNear(contract.total_amount)} NEAR · {yoctoToNear(contract.funded_amount)} funded
        </p>
        <p className="text-xs">
          Security pool: {securityPoolNear} NEAR ({contract.security_deposit_pct}%)
        </p>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 w-14 shrink-0">Client</span>
          <span className="text-xs font-mono text-white/60 truncate">{contract.client}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 w-14 shrink-0">Freelancer</span>
          <span className="text-xs font-mono text-white/60 truncate">
            {contract.freelancer || "Not assigned"}
          </span>
        </div>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors text-left flex items-center gap-2"
          >
            <HugeiconsIcon icon={EyeIcon} size={14} />
            View Full Description
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{contract.title}</DialogTitle>
            <DialogDescription>{contract.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
