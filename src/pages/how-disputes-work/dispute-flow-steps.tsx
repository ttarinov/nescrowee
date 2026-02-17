import { HugeiconsIcon } from "@hugeicons/react";
import {
  LockIcon,
  Shield01Icon,
  JusticeScale01Icon,
} from "@hugeicons/core-free-icons";

const Step = ({
  number,
  icon: Icon,
  title,
  desc,
}: {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) => (
  <div className="relative flex-1 bg-surfaceHighlight/30 backdrop-blur-md rounded-2xl p-8 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
    <div className="absolute -top-4 -left-4 w-12 h-12 bg-background rounded-full border border-white/10 flex items-center justify-center text-xl font-bold text-primary shadow-lg shadow-purple-900/20">
      {number}
    </div>
    <div className="mb-6 flex justify-center">
      <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <HugeiconsIcon icon={Icon} size={40} className="text-purple-400" />
      </div>
    </div>
    <h3 className="text-xl font-bold text-white text-center mb-3">{title}</h3>
    <p className="text-sm text-gray-400 text-center leading-relaxed">{desc}</p>
  </div>
);

const DisputeFlowSteps = () => (
  <div className="w-full py-12">
    <div className="text-center mb-16">
      <h3 className="text-2xl font-bold text-white mb-2">Fairness by Design</h3>
      <p className="text-gray-400">How we solve conflicts without humans.</p>
    </div>
    <div className="flex flex-col md:flex-row gap-8 relative">
      <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent -z-10 transform -translate-y-12" />
      <Step
        number="01"
        icon={LockIcon}
        title="Total Privacy"
        desc="Your browser removes all names, emails, and links. The AI only sees 'Party A' and 'Party B' and the facts."
      />
      <Step
        number="02"
        icon={Shield01Icon}
        title="Secure Trial"
        desc="The AI runs inside a secure hardware enclave (TEE). It signs its verdict mathematically. It cannot be bribed."
      />
      <Step
        number="03"
        icon={JusticeScale01Icon}
        title="Instant Judgment"
        desc="The smart contract verifies the AI's signature. If valid, funds are unlocked automatically. No waiting."
      />
    </div>
  </div>
);

export default DisputeFlowSteps;
