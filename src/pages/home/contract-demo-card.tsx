import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Clock01Icon,
  EyeIcon,
  Wallet01Icon,
  AiBrain01Icon,
  LockIcon,
} from "@hugeicons/core-free-icons";

const demoMilestones = [
  { title: "Design mockups", amount: "2.5", status: "Completed" as const },
  { title: "Frontend build", amount: "5.0", status: "SubmittedForReview" as const },
  { title: "Launch & handoff", amount: "2.5", status: "Funded" as const },
];

const iconMap = {
  Completed: CheckmarkCircle01Icon,
  InProgress: Clock01Icon,
  SubmittedForReview: EyeIcon,
  Funded: Wallet01Icon,
};

const completed = demoMilestones.filter((m) => m.status === "Completed").length;
const progress = (completed / demoMilestones.length) * 100;

const ContractDemoCard = () => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="w-full max-w-lg mx-auto flex flex-col font-sans text-white relative overflow-hidden rounded-[40px] shadow-2xl border border-white/20 bg-black/40 backdrop-blur-2xl"
  >
    <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
    <div className="absolute bottom-[-50px] right-[-50px] w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
    <div className="p-8 pb-4 relative z-10 flex justify-between items-end">
      <div>
        <div className="text-sm font-medium text-white/50 mb-1 tracking-wide">Active contract</div>
        <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">Website Redesign</h2>
      </div>
      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400" />
      </div>
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 relative z-10">
      <div className="text-xs font-mono text-white/50">
        10.00 NEAR · 6.25 funded
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <label className="text-sm font-medium text-white/60">Milestones</label>
          <span className="text-xs font-mono text-white/50">{completed}/{demoMilestones.length}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-white/20 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
      </div>
      <div className="space-y-2">
        {demoMilestones.map((m, i) => {
          const Icon = iconMap[m.status];
          return (
            <div
              key={i}
              className="flex gap-2 items-center px-2 py-3 bg-white/5 rounded-xl border border-white/5"
            >
              <span className="text-white/30 text-xs font-mono w-4">{i + 1}</span>
              {Icon && (
                <HugeiconsIcon icon={Icon} size={14} className="text-white/50 shrink-0" />
              )}
              <span className="text-sm text-white flex-1 truncate">{m.title}</span>
              <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg">
                <span className="text-right text-xs text-white font-mono">{m.amount}</span>
                <span className="text-[10px] text-white/40">N</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                m.status === "Completed" ? "bg-white text-black" : "bg-white/5 text-white/60"
              }`}>
                {m.status === "SubmittedForReview" ? "In review" : m.status === "Completed" ? "Paid" : "Funded"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="bg-white/5 rounded-[32px] p-6 border border-white/10 backdrop-blur-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">AI verifying</h3>
            <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-[200px]">
              Checking deliverables vs agreement. TEE-signed on-chain.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
            <HugeiconsIcon icon={LockIcon} size={10} />
            TEE
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-white/20 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "72%" }}
              transition={{ duration: 1.2, delay: 0.5 }}
            />
          </div>
          <span className="text-xs font-mono text-white/50 w-8">72%</span>
        </div>
        <p className="text-[10px] text-white/30 text-center">Round 1/2 · All models run in TEE — signatures verified on-chain.</p>
      </div>
    </div>
    <div className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/10 z-20">
      <div className="flex justify-between text-xs">
        <span className="text-white/40">Total</span>
        <span className="font-mono font-bold text-white">10.00 NEAR</span>
      </div>
    </div>
  </motion.div>
);

export default ContractDemoCard;
