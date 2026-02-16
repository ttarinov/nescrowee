import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Wallet01Icon, ExternalLink } from "@hugeicons/core-free-icons";
import { hotPayItemId, hotPayCheckoutBase } from "@/near/config";

interface FundMilestoneDialogProps {
  contractId: string;
  milestoneId: string;
  amountYocto: string;
  securityPct: number;
  onFundDirect: () => void;
  isPending: boolean;
}

export function FundMilestoneDialog({
  contractId,
  milestoneId,
  amountYocto,
  securityPct,
  onFundDirect,
  isPending,
}: FundMilestoneDialogProps) {
  const milestoneNear = Number(BigInt(amountYocto || "0")) / 1e24;
  const totalWithSecurity = milestoneNear * (100 + securityPct) / 100;
  const amountNear = totalWithSecurity.toFixed(2);
  const memo = `mt-${contractId}-${milestoneId}`;
  const redirectUrl = `${window.location.origin}/contracts/${contractId}`;
  const hotPayUrl = hotPayItemId
    ? `${hotPayCheckoutBase}?item_id=${hotPayItemId}&amount=${amountNear}&memo=${memo}&redirect_url=${encodeURIComponent(redirectUrl)}`
    : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="hero">Fund</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Fund Milestone</DialogTitle>
          <DialogDescription>
            {milestoneNear.toFixed(2)} NEAR + {securityPct}% security = {amountNear} NEAR
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <button
            onClick={() => { onFundDirect(); }}
            disabled={isPending}
            className="w-full p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={Wallet01Icon} size={20} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Pay with NEAR Wallet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Direct on-chain · instant · HOT Wallet / MyNearWallet
                </p>
              </div>
              <span className="text-[10px] font-mono text-success bg-success/10 px-1.5 py-0.5 rounded">trustless</span>
            </div>
          </button>

          {hotPayUrl && (
            <a
              href={hotPayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-xl border border-orange-500/25 bg-orange-500/5 hover:bg-orange-500/10 transition-all flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                <span className="text-orange-400 font-bold text-sm">H</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-400">Pay with HOT Pay</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  USDC · USDT · ETH · BNB · 30+ tokens via HOT Pay
                </p>
              </div>
              <HugeiconsIcon icon={ExternalLink} size={14} className="text-muted-foreground shrink-0" />
            </a>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            {securityPct}% security deposit covers AI dispute fees · returned after completion
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
