import { useState } from "react";
import {
  AiBrain01Icon,
  Shield01Icon,
  LockIcon,
  EyeIcon,
  Clock01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const steps = [
  {
    step: "1",
    title: "Party Raises Dispute",
    desc: "Either client or freelancer can raise a dispute on an active milestone. The reason is recorded on-chain. Evidence files are encrypted via NOVA before submission — only contract parties and the AI can decrypt them.",
    icon: Shield01Icon,
  },
  {
    step: "2",
    title: "AI Investigates (Multi-Round)",
    desc: "Your browser orchestrates a multi-round investigation. Round 1: identify claims and check scope. Round 2: cross-reference evidence and timelines. Round 3+: evaluate and decide. Each round calls NEAR AI Cloud directly — the AI runs inside TEE hardware that signs every response with Ed25519. You watch the investigation happen live.",
    icon: AiBrain01Icon,
  },
  {
    step: "3",
    title: "Each Round TEE-Verified On-Chain",
    desc: "After each investigation round, the browser submits the AI analysis + Ed25519 signature to the smart contract. The contract calls env::ed25519_verify per round, creating a full cryptographic audit trail. Anyone can verify every step of the AI's reasoning.",
    icon: LockIcon,
  },
  {
    step: "4",
    title: "Accept or Appeal",
    desc: "Both parties can accept the resolution, or either party can appeal for a deeper investigation by DeepSeek V3.1 (up to 5 rounds). The appeal investigation also goes through the same per-round TEE verification flow.",
    icon: EyeIcon,
  },
  {
    step: "5",
    title: "Auto-Execution (48h)",
    desc: "If both parties accept, or after 48 hours, the resolution is finalized and funds are transferred automatically per the AI's recommendation.",
    icon: Clock01Icon,
  },
];

const DetailedDisputeFlow = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-12 border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surfaceHighlight transition-colors text-left"
      >
        <span className="font-medium text-white">
          Detailed dispute flow (step-by-step)
        </span>
        {open ? (
          <HugeiconsIcon icon={ArrowUp01Icon} size={20} className="text-gray-500 shrink-0" />
        ) : (
          <HugeiconsIcon icon={ArrowDown01Icon} size={20} className="text-gray-500 shrink-0" />
        )}
      </button>
      {open && (
        <div className="p-6 bg-black/30 border-t border-white/5 space-y-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="flex gap-4 p-4 rounded-xl bg-surface border border-white/5"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={item.icon} size={20} className="text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-primary/60">
                    Step {item.step}
                  </span>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailedDisputeFlow;
