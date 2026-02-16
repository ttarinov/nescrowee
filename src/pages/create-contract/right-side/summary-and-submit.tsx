import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface SummaryAndSubmitProps {
  totalNear: number;
  isPending: boolean;
  submitDisabled: boolean;
}

export function SummaryAndSubmit({
  totalNear,
  isPending,
  submitDisabled,
}: SummaryAndSubmitProps) {
  return (
    <div className="p-6 backdrop-blur-xl border-t border-white/12 z-20">
      <div className="flex items-center justify-between gap-3">
        <div className="text-lg font-bold text-white">
          {totalNear.toFixed(2)} NEAR
        </div>
        <button
          type="submit"
          disabled={submitDisabled}
          className="py-2.5 px-5 bg-white text-black rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:hover:scale-100 shrink-0"
        >
          {isPending ? "Creating…" : "Create Contract"}
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </button>
      </div>
    </div>
  );
}
