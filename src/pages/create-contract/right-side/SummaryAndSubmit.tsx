import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ZapIcon } from "@hugeicons/core-free-icons";

interface SummaryAndSubmitProps {
  totalNear: number;
  totalUsd: number | null;
  disputeFundPct: number;
  disputeFundNear: number;
  aiModelName: string;
  milestonesCount: number;
  hasCounterparty: boolean;
  isPending: boolean;
  submitDisabled: boolean;
}

export function SummaryAndSubmit({
  totalNear,
  totalUsd,
  disputeFundPct,
  disputeFundNear,
  aiModelName,
  milestonesCount,
  hasCounterparty,
  isPending,
  submitDisabled,
}: SummaryAndSubmitProps) {
  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/10 z-20">
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div>
          <div className="text-white/40 mb-1">Total Value</div>
          <div className="text-lg font-bold text-white">
            {totalNear.toFixed(2)} NEAR{" "}
            <span className="text-white/30 text-sm font-normal">
              ≈${totalUsd != null ? totalUsd.toFixed(0) : "0"}
            </span>
          </div>
        </div>
        <div>
          <div className="text-white/40 mb-1">Dispute Fund</div>
          <div className="text-white">
            {disputeFundPct}% · {disputeFundNear.toFixed(3)} NEAR
          </div>
        </div>
        <div>
          <div className="text-white/40 mb-1">AI Model</div>
          <div className="text-white">{aiModelName}</div>
        </div>
        <div>
          <div className="text-white/40 mb-1">Milestones</div>
          <div className="text-white">{milestonesCount}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-white/30 mb-4 bg-black/20 p-2 rounded-lg">
        <HugeiconsIcon icon={ZapIcon} size={10} className="text-yellow-400" />
        Gas ~$0.001/action, paid by your wallet automatically.
      </div>
      <button
        type="submit"
        disabled={submitDisabled}
        className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isPending
          ? "Creating on-chain…"
          : hasCounterparty
            ? "Deploy Contract"
            : "Create Invite"}
        <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
      </button>
    </div>
  );
}
