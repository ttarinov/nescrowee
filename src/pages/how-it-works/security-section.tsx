import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  ShieldKeyIcon,
  FingerAccessIcon,
  SourceCodeIcon,
  ViewIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";

const features = [
  {
    icon: Shield01Icon,
    title: "Money in a smart contract",
    desc: "Your NEAR goes directly to the escrow contract on the NEAR blockchain. It's not in someone's bank account — it's in code that can only release funds when conditions are met.",
  },
  {
    icon: ShieldKeyIcon,
    title: "TEE-signed AI responses",
    desc: "Every AI analysis is signed inside a Trusted Execution Environment — special hardware that nobody can tamper with. The smart contract verifies every signature using ed25519_verify.",
  },
  {
    icon: FingerAccessIcon,
    title: "Privacy by default",
    desc: 'Before anything is sent to the AI, all names and personal info are removed. The AI only sees "Party A" and "Party B" — it never knows who you are.',
  },
  {
    icon: SourceCodeIcon,
    title: "Open-source prompts",
    desc: "The AI prompts are published and their SHA-256 hash is stored on-chain when a contract is created. You can verify the exact same prompt is used for your dispute.",
  },
  {
    icon: ViewIcon,
    title: "Full audit trail",
    desc: "Every investigation round, every AI analysis, every signature — all stored on-chain. Anyone can independently verify every step of every dispute.",
  },
  {
    icon: UserMultiple02Icon,
    title: "No middleman",
    desc: "There is no company between you and your money. The browser talks directly to the blockchain and NEAR AI. No backend, no server, no admin panel.",
  },
];

export default function SecuritySection() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <div
          key={f.title}
          className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.04] to-transparent px-5 py-5 transition-all hover:scale-[1.01] hover:border-purple-500/25"
        >
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-800/10 text-purple-300">
            <HugeiconsIcon icon={f.icon} size={18} />
          </div>
          <h4 className="mb-1.5 text-sm font-semibold text-white">{f.title}</h4>
          <p className="text-xs leading-relaxed text-gray-400">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
