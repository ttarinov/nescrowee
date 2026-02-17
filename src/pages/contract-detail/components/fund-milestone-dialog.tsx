import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Wallet01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { hotPayItemId, hotPayCheckoutBase, hotPayRedirectDomain } from "@/near/config";

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
  const securityAmount = milestoneNear * securityPct / 100;
  const freelancerGets = milestoneNear - securityAmount;
  const amountNear = milestoneNear.toFixed(2);
  const memo = `mt-${contractId}-${milestoneId}`;
  const hotPayUrl = hotPayItemId
    ? `${hotPayCheckoutBase}?item_id=${hotPayItemId}&amount=${amountNear}&memo=${memo}&redirect_url=${encodeURIComponent(hotPayRedirectDomain)}`
    : null;

  const handleHotPayClick = () => {
    localStorage.setItem("hotpay-pending", JSON.stringify({ contractId, milestoneId }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="hero">Fund</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-black/90 backdrop-blur-3xl border-white/10 rounded-3xl">
        <div className="relative">
          <div className="absolute top-[-80px] left-[-80px] w-[200px] h-[200px] bg-purple-500/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[160px] h-[160px] bg-blue-500/15 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-bold text-white">Fund Milestone</DialogTitle>
              <div className="mt-4 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-mono text-white">{amountNear}</span>
                  <span className="text-lg text-white/50 font-medium">NEAR</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40 font-mono">
                  <span>{securityPct}% security deposit ({securityAmount.toFixed(3)})</span>
                  <span className="text-white/20">·</span>
                  <span>Freelancer gets {freelancerGets.toFixed(3)}</span>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3">
              <button
                onClick={onFundDirect}
                disabled={isPending}
                className="w-full p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={Wallet01Icon} size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-white">NEAR Wallet</p>
                    <p className="text-xs text-white/40 mt-0.5">Direct on-chain · instant · trustless</p>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </div>
              </button>

              {hotPayUrl && (
                <a
                  href={hotPayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleHotPayClick}
                  className="w-full p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    <img src="/hot-logo.svg" alt="HOT" className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-white">HOT Pay</p>
                    <p className="text-xs text-white/40 mt-0.5">USDC · USDT · ETH · BNB · 30+ tokens</p>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </a>
              )}
            </div>

            <p className="text-[11px] text-white/25 text-center mt-6">
              {securityPct}% security deposit covers AI dispute fees · returned after completion
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
