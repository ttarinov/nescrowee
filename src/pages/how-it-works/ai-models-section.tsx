import { HugeiconsIcon } from "@hugeicons/react";
import {
  FlashIcon,
  Target01Icon,
  Shield01Icon,
  BrainIcon,
} from "@hugeicons/core-free-icons";

const models = [
  {
    name: "Qwen3 30B",
    tag: "Fast & affordable",
    icon: FlashIcon,
    speed: "~10s",
    pricing: "0.15 / 0.55 USDC per M tokens",
    desc: "Quick and cost-effective for straightforward disputes where the evidence is clear.",
  },
  {
    name: "GPT-OSS 120B",
    tag: "Strong reasoning",
    icon: Target01Icon,
    speed: "~20s",
    pricing: "0.15 / 0.55 USDC per M tokens",
    desc: "Better at complex reasoning when the situation is nuanced.",
  },
  {
    name: "DeepSeek V3.1",
    tag: "Most thorough",
    icon: Shield01Icon,
    speed: "~45s",
    pricing: "1.05 / 3.10 USDC per M tokens",
    desc: "The deepest analysis available. Always used for appeals to ensure maximum thoroughness.",
    highlight: true,
  },
  {
    name: "GLM-4.7",
    tag: "Hybrid reasoning",
    icon: BrainIcon,
    speed: "~25s",
    pricing: "0.85 / 3.30 USDC per M tokens",
    desc: "Open-source MoE model with hybrid reasoning — strong analytical depth for complex disputes.",
  },
];

export default function AIModelsSection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {models.map((m) => (
          <div
            key={m.name}
            className={`relative rounded-2xl border bg-gradient-to-br from-purple-500/[0.06] to-transparent px-5 py-5 transition-all hover:scale-[1.01] hover:border-purple-500/25 ${
              m.highlight ? "border-purple-500/20 ring-1 ring-purple-500/20" : "border-purple-500/15"
            }`}
          >
            {m.highlight && (
              <span className="absolute -top-2.5 right-4 rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300">
                Used for all appeals
              </span>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-800/10 text-purple-300">
                <HugeiconsIcon icon={m.icon} size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{m.name}</h4>
                <span className="text-[10px] font-medium text-purple-300/80">{m.tag}</span>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-400">{m.desc}</p>
            <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400">
              <span className="rounded-full border border-purple-500/10 bg-purple-500/[0.05] px-2 py-0.5">{m.speed}</span>
              <span className="rounded-full border border-purple-500/10 bg-purple-500/[0.05] px-2 py-0.5">{m.pricing}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-purple-500/10 bg-black/30 px-5 py-5">
          <h4 className="mb-3 text-sm font-semibold text-white">Standard Review</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            {[
              "2-3 investigation rounds",
              "Model chosen by the contract creator",
              "Each round is TEE-signed and verified on-chain",
              "Can be appealed by either party",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-purple-400/50" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.04] to-transparent px-5 py-5">
          <h4 className="mb-3 text-sm font-semibold text-white">Appeal (Deep Investigation)</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            {[
              "3-5 investigation rounds",
              "Always uses DeepSeek V3.1 for maximum depth",
              "Each round is TEE-signed and verified on-chain",
              "Final decision — no further appeals",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-purple-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
