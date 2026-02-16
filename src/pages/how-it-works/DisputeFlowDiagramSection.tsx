import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  AiBrain01Icon,
  Shield01Icon,
  BalanceScaleIcon,
  ThumbsUpIcon,
  Clock01Icon,
  CoinsDollarIcon,
  RepeatIcon,
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
        desc="Client or freelancer explains the problem on-chain. The milestone is frozen — no money moves until this is resolved."
      />
      <VerticalLine />
      <DiagramNode
        number={2}
        icon={AiBrain01Icon}
        title="AI investigation (2-3 rounds)"
        desc="The smart contract triggers NEAR AI Cloud. The AI analyzes the contract details, milestone info, and chat history in multiple rounds — each round goes deeper. It checks claims, cross-references the chat, and evaluates evidence."
      />
      <VerticalLine />
      <div className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.05] to-violet-600/[0.03] p-4">
        <div className="mb-3 flex items-center gap-2">
          <HugeiconsIcon icon={Shield01Icon} size={16} className="text-purple-300" />
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
            Per-round verification
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { step: "AI responds", desc: "Model runs inside TEE hardware, signs each response with Ed25519" },
            { step: "Proof submitted", desc: "Analysis + signature is sent to the smart contract" },
            { step: "Contract verifies", desc: "Smart contract calls ed25519_verify — creates a full audit trail" },
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
        desc="The final round produces a resolution: pay the freelancer, refund the client, or split the funds. The AI explains its reasoning — visible to everyone."
      />
      <VerticalLine />
      <div className="rounded-2xl border border-purple-500/15 bg-black/30 p-4">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
          Both parties choose
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-purple-400/15 bg-gradient-to-br from-purple-400/[0.05] to-emerald-500/[0.03] p-4 text-center">
            <HugeiconsIcon icon={ThumbsUpIcon} size={20} className="mx-auto mb-2 text-purple-300" />
            <h5 className="text-sm font-semibold text-purple-300">Accept</h5>
            <p className="mt-1 text-xs text-gray-400">
              Both parties agree with the decision. Funds are released according to the resolution.
            </p>
          </div>
          <div className="rounded-xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.05] to-amber-500/[0.02] p-4 text-center">
            <HugeiconsIcon icon={RepeatIcon} size={20} className="mx-auto mb-2 text-purple-300" />
            <h5 className="text-sm font-semibold text-purple-300">Appeal</h5>
            <p className="mt-1 text-xs text-gray-400">
              Either party can request a deeper investigation using DeepSeek V3.1 (up to 5 rounds). Same TEE verification.
            </p>
          </div>
        </div>
      </div>
      <VerticalLine />
      <div className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.06] to-transparent p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/15 to-purple-800/10 text-purple-300">
            <HugeiconsIcon icon={Clock01Icon} size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">48-hour auto-execution</h4>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
              If nobody responds within 48 hours, the resolution is finalized automatically. The smart contract releases funds based on the AI's decision. No human intervention needed.
            </p>
          </div>
        </div>
      </div>
      <VerticalLine />
      <DiagramNode
        icon={CoinsDollarIcon}
        title="Funds released"
        desc="Smart contract sends the NEAR to the right person (or splits it). Everything is final and recorded on-chain."
      />
    </div>
  );
}
