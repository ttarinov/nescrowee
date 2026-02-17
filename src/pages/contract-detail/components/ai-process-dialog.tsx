import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  LockIcon,
  CheckmarkCircle02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  SecurityBlockIcon,
  ViewIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import type { AiResolutionData, SocialMessage } from "@/near/social";
import type { EscrowContract } from "@/types/escrow";
import { AI_SYSTEM_PROMPT } from "@/constants/ai-prompt";

interface AiProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resolutionData: AiResolutionData;
  contract: EscrowContract;
  messages: SocialMessage[];
}

export function AiProcessDialog({
  open,
  onOpenChange,
  resolutionData,
}: AiProcessDialogProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showFullContext, setShowFullContext] = useState(false);

  if (!open) return null;

  const fullPayload = JSON.stringify(
    {
      system_prompt: AI_SYSTEM_PROMPT,
      resolution_data: {
        resolution: resolutionData.resolution,
        explanation: resolutionData.explanation,
        confidence: resolutionData.confidence,
        context_for_freelancer: resolutionData.context_for_freelancer ?? null,
      },
      raw_ai_response: resolutionData.raw_response ?? null,
      context_sent_to_ai: resolutionData.context ?? null,
      model_id: resolutionData.model_id,
      tee_verified: resolutionData.tee_verified,
    },
    null,
    2,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#080512] border border-white/10 shadow-2xl rounded-2xl font-sans"
      >
        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0a0616] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <HugeiconsIcon icon={AiBrain01Icon} size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Arbitration Analysis</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Completed successfully</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-scroll px-6 py-0">
          <div className="py-8 border-b border-white/5">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">Resolution Outcome</span>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {resolutionData.resolution} Wins
                </span>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium flex items-center gap-1.5">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                  {resolutionData.confidence}% Confidence
                </div>
              </div>
              <p className="text-base text-slate-300 leading-relaxed max-w-xl">
                {resolutionData.explanation}
              </p>
            </div>
          </div>

          {resolutionData.analysis && resolutionData.analysis !== resolutionData.explanation && (
            <div className="py-8 space-y-4 border-b border-white/5">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <HugeiconsIcon icon={AiBrain01Icon} size={16} />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Reasoning</h3>
              </div>
              <div className="text-sm text-slate-300/90 leading-7 whitespace-pre-wrap font-light">
                {resolutionData.analysis}
              </div>
            </div>
          )}

          {resolutionData.context_for_freelancer && (
            <div className="py-6 border-b border-white/5">
              <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <HugeiconsIcon icon={SecurityBlockIcon} size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">Private Action Items</span>
                </div>
                <p className="text-sm text-amber-100/80 leading-relaxed">
                  {resolutionData.context_for_freelancer}
                </p>
              </div>
            </div>
          )}

          <div className="py-4 border-b border-white/5">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="w-full flex items-center justify-between group py-2"
            >
              <div className="flex items-center gap-2 text-slate-500 group-hover:text-purple-400 transition-colors">
                <HugeiconsIcon icon={AiBrain01Icon} size={14} />
                <span className="text-xs font-mono">AI Response & Context Sent</span>
              </div>
              <HugeiconsIcon icon={showRaw ? ArrowUp01Icon : ArrowDown01Icon} size={14} className="text-slate-600" />
            </button>
            <AnimatePresence>
              {showRaw && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-4">
                    {resolutionData.raw_response && (
                      <div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2">Raw AI Response</div>
                        <pre className="p-4 rounded-lg bg-[#050308] border border-white/5 font-mono text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap select-text max-h-64 overflow-y-auto">
                          {resolutionData.raw_response}
                        </pre>
                      </div>
                    )}
                    {resolutionData.context && (
                      <div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2">Context Provided to AI</div>
                        <pre className="p-4 rounded-lg bg-[#050308] border border-white/5 font-mono text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap select-text max-h-64 overflow-y-auto">
                          {resolutionData.context}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="py-4 border-b border-white/5">
            <button
              onClick={() => setShowFullContext(!showFullContext)}
              className="w-full flex items-center justify-between group py-2"
            >
              <div className="flex items-center gap-2 text-slate-500 group-hover:text-purple-400 transition-colors">
                <HugeiconsIcon icon={SecurityBlockIcon} size={14} />
                <span className="text-xs font-mono">Full Payload (Prompt + Context + Response)</span>
              </div>
              <HugeiconsIcon icon={showFullContext ? ArrowUp01Icon : ArrowDown01Icon} size={14} className="text-slate-600" />
            </button>
            <AnimatePresence>
              {showFullContext && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <pre className="mt-4 p-4 rounded-lg bg-[#050308] border border-white/5 font-mono text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap select-text max-h-80 overflow-y-auto">
                    {fullPayload}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="py-4">
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-purple-400 transition-colors"
            >
              <HugeiconsIcon icon={ViewIcon} size={12} />
              {showSystemPrompt ? "Hide" : "View"} System Prompt
            </button>
            <AnimatePresence>
              {showSystemPrompt && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <pre className="mt-2 text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap font-mono bg-[#050308] rounded-lg p-3 max-h-64 overflow-y-auto border border-white/5">
                    {AI_SYSTEM_PROMPT}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="shrink-0 bg-[#0d091a] border-t border-white/5 px-6 py-3 flex items-center justify-between text-[10px] text-slate-500 rounded-b-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={SecurityBlockIcon} size={12} className="text-slate-600" />
              <span className="font-mono">ID: {resolutionData.model_id.split("-")[1] || resolutionData.model_id}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon
                icon={LockIcon}
                size={12}
                className={resolutionData.tee_verified ? "text-emerald-500/70" : "text-slate-600"}
              />
              <span className={resolutionData.tee_verified ? "text-emerald-500/70" : ""}>
                {resolutionData.tee_verified ? "TEE Enclave Verified" : "Unverified"}
              </span>
            </div>
          </div>
          <div className="font-mono opacity-50">v2.4.0</div>
        </div>
      </motion.div>
    </div>
  );
}
