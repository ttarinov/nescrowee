import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  Shield01Icon,
  MessageMultiple01Icon,
  AiBrain01Icon,
} from "@hugeicons/core-free-icons";

function NodeCard({
  icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.06] to-transparent px-5 py-5 text-center transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/25">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-800/10 text-purple-300">
        <HugeiconsIcon icon={icon} size={20} />
      </div>
      <h4 className="mb-1.5 text-sm font-semibold text-white">{title}</h4>
      <p className="text-xs leading-relaxed text-gray-400">{desc}</p>
    </div>
  );
}

export default function ArchitectureDiagram() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <svg className="h-full w-full min-h-[280px]" preserveAspectRatio="none">
          <line x1="50%" y1="25%" x2="25%" y2="60%" stroke="rgb(168 85 247 / 0.2)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="50%" y1="25%" x2="75%" y2="60%" stroke="rgb(168 85 247 / 0.2)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="50%" y1="25%" x2="50%" y2="75%" stroke="rgb(168 85 247 / 0.2)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>
      <div className="relative grid gap-4 md:grid-cols-3 md:grid-rows-2">
        <div className="md:col-start-2 md:row-start-1">
          <NodeCard
            icon={ComputerIcon}
            title="Your Browser"
            desc="The app that ties it all together. Makes contract calls, reads chat, calls AI, submits proofs. No backend server."
          />
        </div>
        <div className="md:col-start-1 md:row-start-2">
          <NodeCard
            icon={Shield01Icon}
            title="NEAR Smart Contract"
            desc="Holds your money. Stores milestones, disputes, AI proofs. Verifies every signature. Releases funds only when rules are met."
          />
        </div>
        <div className="md:col-start-2 md:row-start-2">
          <NodeCard
            icon={AiBrain01Icon}
            title="NEAR AI Cloud (TEE)"
            desc="AI models run inside secure hardware. Every response is signed with Ed25519 — the same crypto NEAR uses for transactions."
          />
        </div>
        <div className="md:col-start-3 md:row-start-2">
          <NodeCard
            icon={MessageMultiple01Icon}
            title="NEAR Social"
            desc="On-chain chat between client and freelancer. Messages are stored on a separate NEAR contract — not on someone's server."
          />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-purple-500/30" />
          Your browser calls each service directly
        </span>
        <span className="rounded-full border border-purple-500/15 bg-purple-500/[0.05] px-2.5 py-0.5 text-purple-300/80">
          No backend server anywhere
        </span>
      </div>
    </div>
  );
}
