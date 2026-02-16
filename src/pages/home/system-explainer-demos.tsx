import { Fragment, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  LockIcon,
  LegalDocument01Icon,
  Coins01Icon,
  ZapIcon,
  Wallet03Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

const demoPanel =
  "rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-black overflow-hidden";

const AI_STEPS = [
  "Checking contract & milestones…",
  "Reading chat & messages…",
  "Checking uploaded files & evidence…",
  "Weighing claims…",
  "Proposing resolution…",
];

export function AIDemo() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % AI_STEPS.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`${demoPanel} w-full min-h-[240px] sm:min-h-[260px] flex flex-col p-4 gap-3 justify-center`}>
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium text-white/70">
          A
        </div>
        <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/5 px-3 py-2 max-w-[85%]">
          <p className="text-[10px] font-mono text-white/50 mb-0.5">Party A</p>
          <p className="text-xs text-white/80">Dispute: deliverable not as agreed. Evidence attached.</p>
        </div>
      </div>
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/25 to-violet-600/20 text-purple-300">
          <HugeiconsIcon icon={AiBrain01Icon} size={12} />
        </div>
        <div className="rounded-2xl rounded-tl-md border border-purple-500/20 bg-purple-500/10 px-3 py-2 max-w-[85%]">
          <p className="text-[10px] font-mono text-purple-400/90 mb-0.5">AI</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-white/90"
            >
              {AI_STEPS[step]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <p className="text-[10px] font-mono text-white/45 pt-1">
        Each step signed by TEE → on-chain
      </p>
    </div>
  );
}

export function MoneyDemo() {
  return (
    <div className={`${demoPanel} w-full min-h-[240px] sm:min-h-[260px] flex flex-col justify-center p-5`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="rounded-xl border border-purple-500/15 bg-purple-500/10 px-3 py-2 text-center min-w-0 flex-1">
            <p className="text-[10px] font-mono uppercase text-purple-400/80 mb-0.5">Client</p>
            <p className="text-xs font-medium text-white/90">Funds</p>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-purple-500/50 shrink-0" />
          <div className="rounded-xl border border-purple-500/25 bg-gradient-to-r from-purple-600/20 to-purple-800/20 px-3 py-2.5 text-center min-w-0 flex-1 flex items-center justify-center gap-1.5">
            <HugeiconsIcon icon={LockIcon} size={14} className="text-purple-300 shrink-0" />
            <span className="text-[10px] font-mono uppercase text-purple-300">Escrow</span>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-purple-500/50 shrink-0 opacity-50" />
          <div className="rounded-xl border border-purple-500/15 bg-white/5 px-3 py-2 text-center min-w-0 flex-1">
            <p className="text-[10px] font-mono uppercase text-white/40 mb-0.5">Freelancer</p>
            <p className="text-xs font-medium text-white/70">On approval</p>
          </div>
        </div>
        <div className="rounded-lg bg-black/30 border border-white/5 px-3 py-2">
          <p className="text-[10px] font-mono text-white/50">
            Smart contract holds funds. No company custody. Release = milestone approved.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DisagreeDemo() {
  const steps = ["Raise dispute", "AI reviews", "Resolution"];
  return (
    <div className={`${demoPanel} w-full min-h-[240px] sm:min-h-[260px] flex flex-col justify-center p-5`}>
      <div className="flex flex-col gap-3">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-800/20 text-purple-300 font-mono text-xs font-bold">
              {i + 1}
            </div>
            <span className="text-sm font-medium text-white/90">{label}</span>
            {i < steps.length - 1 && (
              <div className="ml-auto flex items-center gap-1">
                <div className="h-px w-4 bg-purple-500/30" />
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="text-purple-500/40" />
              </div>
            )}
          </div>
        ))}
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-purple-500/15 bg-purple-500/5 px-3 py-2">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-purple-400 shrink-0" />
          <p className="text-[10px] font-mono text-white/60">Decision stored on-chain → contract releases funds</p>
        </div>
      </div>
    </div>
  );
}

export function PayDisputesDemo() {
  return (
    <div className={`${demoPanel} w-full min-h-[240px] sm:min-h-[260px] flex flex-col justify-center p-5`}>
      <div className="space-y-4">
        <div className="rounded-xl border border-purple-500/15 bg-black/30 p-4">
          <p className="text-[10px] font-mono uppercase text-purple-400/80 mb-2">Milestone payment split</p>
          <div className="h-3 w-full rounded-full bg-black/50 overflow-hidden flex">
            <motion.div
              className="h-full rounded-l-full bg-gradient-to-r from-purple-500/30 to-purple-600/20"
              initial={{ width: 0 }}
              animate={{ width: "12%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/10"
              initial={{ width: 0 }}
              animate={{ width: "88%" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono">
            <span className="text-purple-400/90">Dispute fund 12%</span>
            <span className="text-white/50">Rest → freelancer</span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
          <HugeiconsIcon icon={Coins01Icon} size={14} className="text-white/40 shrink-0" />
          <p className="text-[10px] font-mono text-white/50">If no dispute → fund goes to freelancer</p>
        </div>
      </div>
    </div>
  );
}

export function SignPayDemo() {
  const flow = [
    { label: "Wallet", icon: Wallet03Icon },
    { label: "Sign", icon: LegalDocument01Icon },
    { label: "On-chain", icon: ZapIcon },
  ];
  return (
    <div className={`${demoPanel} w-full min-h-[240px] sm:min-h-[260px] flex flex-col justify-center p-5`}>
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {flow.map((item, i) => (
          <Fragment key={item.label}>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/15 to-black text-purple-300">
                <HugeiconsIcon icon={item.icon} size={22} />
              </div>
              <span className="text-[10px] font-mono uppercase text-white/70">{item.label}</span>
            </div>
            {i < flow.length - 1 && (
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-purple-500/40 shrink-0 self-center" />
            )}
          </Fragment>
        ))}
      </div>
      <p className="mt-5 text-center text-[10px] font-mono text-white/50">
        Create contract · Fund escrow · Approve milestone → auto payout
      </p>
    </div>
  );
}
