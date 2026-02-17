import { HugeiconsIcon } from "@hugeicons/react";
import {
  LegalDocument01Icon,
  Wallet01Icon,
  Briefcase01Icon,
  CheckmarkCircle01Icon,
  Dollar01Icon,
  Alert01Icon,
  AiBrain01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";

const FlowNode = ({
  icon: Icon,
  title,
  desc,
  color = "default",
  isMain = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color?: "default" | "success" | "danger" | "purple";
  isMain?: boolean;
}) => {
  const styles = {
    default: "border-white/10 text-gray-200 bg-surface",
    success: "border-green-500/20 text-green-100 bg-green-900/10",
    danger: "border-red-500/20 text-red-100 bg-red-900/10",
    purple: "border-primary/20 text-purple-100 bg-primary/5",
  };
  const iconColors = {
    default: "text-gray-400",
    success: "text-green-400",
    danger: "text-red-400",
    purple: "text-primary",
  };
  return (
    <div
      className={`relative flex flex-col items-start p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 w-52 md:w-60 z-10 ${styles[color]} ${isMain ? "shadow-lg shadow-black/40" : ""}`}
    >
      <div className={`mb-3 p-2.5 rounded-xl bg-white/5 ${iconColors[color]}`}>
        <HugeiconsIcon icon={Icon} size={24} />
      </div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed font-light">{desc}</p>
    </div>
  );
};

const Arrow = () => (
  <div className="hidden md:flex items-center justify-center w-12 text-gray-700">
    <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
  </div>
);

const FlowDiagramEscrow = () => (
  <div className="w-full py-12 overflow-x-auto">
    <div className="min-w-[1100px] flex flex-col items-start px-4 md:px-0">
      <div className="flex items-center">
        <FlowNode
          icon={LegalDocument01Icon}
          title="1. Agreement"
          desc="Client & Freelancer define terms & milestones on-chain."
        />
        <Arrow />
        <FlowNode
          icon={Wallet01Icon}
          title="2. Fund"
          desc="Client funds escrow via NEAR wallet or HOT Pay (any chain). Money is locked on-chain."
        />
        <Arrow />
        <div className="relative group">
          <FlowNode
            icon={Briefcase01Icon}
            title="3. Work"
            desc="Freelancer delivers work for the milestone."
            isMain
          />
          <div className="absolute top-full left-1/2 w-[1px] h-16 bg-gradient-to-b from-gray-700 to-gray-700/50 hidden md:block" />
          <div className="absolute top-[calc(100%+4rem)] left-1/2 w-4 h-4 border-l-[1px] border-b-[1px] border-gray-700 rounded-bl-xl -translate-x-[1px] -translate-y-[1px] hidden md:block" />
        </div>
        <Arrow />
        <FlowNode
          icon={CheckmarkCircle01Icon}
          title="4. Approve"
          desc="Client reviews and accepts the work."
          color="success"
        />
        <Arrow />
        <div className="relative">
          <FlowNode
            icon={Dollar01Icon}
            title="5. Paid"
            desc="Funds release instantly to the freelancer."
            color="success"
          />
        </div>
      </div>
      <div className="flex items-center mt-16 ml-[calc(15rem*2+6rem)] pl-[0.2rem]">
        <div className="flex items-center">
          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-2 text-[10px] uppercase tracking-wider font-bold text-gray-500">
              If Disagreement
            </div>
            <FlowNode
              icon={Alert01Icon}
              title="Raise Dispute"
              desc="Either party flags an issue. Funds remain locked."
              color="danger"
            />
          </div>
          <Arrow />
          <FlowNode
            icon={AiBrain01Icon}
            title="AI Jury"
            desc="Evidence is anonymized. TEE agent decides the split."
            color="purple"
          />
          <div className="hidden md:flex flex-col ml-4 h-full justify-center">
            <div className="flex items-center text-gray-600">
              <div className="w-8 h-[1px] bg-gray-700" />
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={24} className="ml-2" />
              <span className="text-xs ml-2 text-gray-500">Funds Released</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default FlowDiagramEscrow;
