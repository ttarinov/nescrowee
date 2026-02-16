import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  AiBrain01Icon,
  Shield01Icon,
  BalanceScaleIcon,
  ThumbsUpIcon,
  Clock01Icon,
  CoinsDollarIcon,
} from "@hugeicons/core-free-icons";

function DiagramNode({
  icon,
  title,
  desc,
  number,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  number?: number;
}) {
  return (
    <div className="relative rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.06] to-transparent px-4 py-4 transition-all hover:scale-[1.01] hover:border-purple-500/25">
      {number !== undefined && (
        <div className="absolute -top-2 left-3 rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300">
          {number}
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/15 to-purple-800/10 text-purple-300">
          <HugeiconsIcon icon={icon} size={16} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function VerticalLine() {
  return (
    <div className="flex justify-center py-1">
      <div className="h-6 w-px bg-gradient-to-b from-purple-500/25 to-purple-500/10" />
    </div>
  );
}

export default function DisputeFlowDiagramSection() {
  return (
    <div className="flex flex-col gap-0">
      <DiagramNode
        number={1}
        icon={AlertCircleIcon}
        title="Dispute raised"
        desc="The client disputes a milestone submitted for review. The milestone is frozen — no money moves until this is resolved."
      />
      <VerticalLine />
      <DiagramNode
        number={2}
        icon={AiBrain01Icon}
        title="AI analyzes the dispute"
        desc="NEAR AI Cloud receives the full context — contract details, milestone info, chat history, and evidence. The AI performs deep chain-of-thought reasoning in a single comprehensive pass."
      />
      <VerticalLine />
      <div className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.05] to-violet-600/[0.03] p-4">
        <div className="mb-3 flex items-center gap-2">
          <HugeiconsIcon icon={Shield01Icon} size={16} className="text-purple-300" />
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
            TEE verification
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { step: "AI responds", desc: "Model runs inside TEE hardware, signs the response with Ed25519" },
            { step: "Proof submitted", desc: "Resolution + signature is sent to the smart contract" },
            { step: "Contract verifies", desc: "Smart contract calls ed25519_verify — cryptographic proof on-chain" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl border border-purple-500/10 bg-black/30 px-3 py-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-[10px] font-bold text-purple-300">
                {i + 1}
              </span>
              <div>
                <p className="text-[11px] font-medium text-white">{item.step}</p>
                <p className="text-[10px] leading-relaxed text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <VerticalLine />
      <DiagramNode
        number={3}
        icon={BalanceScaleIcon}
        title="AI makes a decision"
        desc="The AI picks one of four outcomes: pay the freelancer, refund the client, split the funds, or send the freelancer back to fix the work. The reasoning is visible to everyone."
      />
      <VerticalLine />
      <div className="rounded-2xl border border-purple-500/15 bg-black/30 p-4">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
          Either party can accept early
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-purple-400/15 bg-gradient-to-br from-purple-400/[0.05] to-emerald-500/[0.03] p-4 text-center">
            <HugeiconsIcon icon={ThumbsUpIcon} size={20} className="mx-auto mb-2 text-purple-300" />
            <h5 className="text-sm font-semibold text-purple-300">Accept</h5>
            <p className="mt-1 text-xs text-gray-400">
              Either party accepts the decision. The dispute is immediately finalized and funds are released.
            </p>
          </div>
          <div className="rounded-xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.05] to-amber-500/[0.02] p-4 text-center">
            <HugeiconsIcon icon={Clock01Icon} size={20} className="mx-auto mb-2 text-purple-300" />
            <h5 className="text-sm font-semibold text-purple-300">48h auto-execution</h5>
            <p className="mt-1 text-xs text-gray-400">
              If nobody responds within 48 hours, the resolution is finalized automatically. No human intervention needed.
            </p>
          </div>
        </div>
      </div>
      <VerticalLine />
      <DiagramNode
        icon={CoinsDollarIcon}
        title="Funds released"
        desc="Smart contract sends NEAR to the right person, splits it, or returns the milestone to work. Everything is final and recorded on-chain."
      />
    </div>
  );
}
