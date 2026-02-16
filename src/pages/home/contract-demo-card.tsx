import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Clock01Icon,
  EyeIcon,
  Wallet01Icon,
  LockIcon,
  Progress01Icon,
} from "@hugeicons/core-free-icons";

type MilestoneStatus = "Funded" | "SubmittedForReview" | "Completed";

const milestoneTitles = ["Design mockups", "Frontend build", "Launch & handoff"];
const milestoneAmounts = ["2.5", "5.0", "2.5"];

const iconMap = {
  Completed: CheckmarkCircle01Icon,
  InProgress: Clock01Icon,
  SubmittedForReview: EyeIcon,
  Funded: Wallet01Icon,
};

const steps: { funded: string; milestones: MilestoneStatus[]; aiMilestoneIndex: number | null }[] = [
  { funded: "0", milestones: ["Funded", "Funded", "Funded"], aiMilestoneIndex: null },
  { funded: "2.5", milestones: ["SubmittedForReview", "Funded", "Funded"], aiMilestoneIndex: null },
  { funded: "2.5", milestones: ["SubmittedForReview", "Funded", "Funded"], aiMilestoneIndex: 0 },
  { funded: "6.25", milestones: ["Completed", "SubmittedForReview", "Funded"], aiMilestoneIndex: null },
  { funded: "8.75", milestones: ["Completed", "SubmittedForReview", "Funded"], aiMilestoneIndex: 1 },
  { funded: "10.00", milestones: ["Completed", "Completed", "Completed"], aiMilestoneIndex: null },
];

const STEP_DURATION_MS = 3500;

const ContractDemoCard = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, STEP_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  const current = steps[step];
  const completed = current.milestones.filter((s) => s === "Completed").length;
  const progress = (completed / current.milestones.length) * 100;
  const isDone = step === steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.05 }}
      className="w-full max-w-lg mx-auto flex flex-col font-sans text-white relative overflow-hidden rounded-[40px] shadow-2xl border border-white/20 bg-black/40 backdrop-blur-2xl"
    >
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-50px] right-[-50px] w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="p-8 pb-4 relative z-10 flex justify-between items-end">
        <div>
          <div className="text-sm font-medium text-white/50 mb-1 tracking-wide">
            {isDone ? "Completed" : "Active contract"}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">Website Redesign</h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
          <motion.div
            className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 relative z-10">
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <label className="text-sm font-medium text-white/60">Milestones</label>
            <span className="text-xs font-mono text-white/50">{completed}/{current.milestones.length}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-purple-500 rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <div className="space-y-2">
          {current.milestones.map((status, i) => {
            const Icon = iconMap[status];
            const isInReview = status === "SubmittedForReview";
            const isActive = isInReview;
            const showAiCard = current.aiMilestoneIndex === i;
            
            return (
              <div key={i} className="space-y-2">
                <motion.div
                  layout
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2 items-center px-2 py-3 rounded-xl border transition-colors ${
                    isActive
                      ? "bg-purple-500/10 border-purple-500/30"
                      : "bg-white/5 border-white/5"
                  }`}
                >
                  <span className="text-white/30 text-xs font-mono w-4">{i + 1}</span>
                  {Icon && (
                    <span className="shrink-0">
                      {isInReview ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="inline-block"
                        >
                          <HugeiconsIcon icon={Progress01Icon} size={14} className="text-purple-400" />
                        </motion.div>
                      ) : (
                        <HugeiconsIcon icon={Icon} size={14} className="text-white/50" />
                      )}
                    </span>
                  )}
                  <span className="text-sm text-white flex-1 truncate">{milestoneTitles[i]}</span>
                  <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg">
                    <span className="text-right text-xs text-white font-mono">{milestoneAmounts[i]}</span>
                    <span className="text-[10px] text-white/40">N</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                    status === "Completed"
                      ? "bg-white text-black"
                      : status === "SubmittedForReview"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-white/5 text-white/60"
                  }`}>
                    {status === "SubmittedForReview" ? "In review" : status === "Completed" ? "Paid" : "Funded"}
                  </span>
                </motion.div>
                <AnimatePresence>
                  {showAiCard && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.35 }}
                      className="ml-6"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <HugeiconsIcon icon={Progress01Icon} size={20} className="text-purple-500 shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-lg font-bold text-white">AI verifying</h3>
                            <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-[200px]">
                              Checking deliverables vs agreement. TEE-signed on-chain.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
                          <HugeiconsIcon icon={LockIcon} size={10} />
                          TEE
                        </div>
                      </div>
                      <p className="text-[10px] text-white/30 mt-3">Round 1/2 · All models run in TEE — signatures verified on-chain.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
      <div className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/10 z-20">
        <div className="flex justify-between text-xs">
          <span className="text-white/40">Total</span>
          <span className="font-mono font-bold text-white">10.00 NEAR</span>
        </div>
        <div className="text-xs font-mono text-white/50 mt-1.5">10.00 NEAR · {current.funded} funded</div>
      </div>
    </motion.div>
  );
};

export default ContractDemoCard;
