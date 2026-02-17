import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  LockIcon,
  CheckmarkCircle02Icon,
  File02Icon,
  SecurityBlockIcon,
  Loading01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  Alert02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import type { InvestigationStep } from "@/hooks/useContract";
import { AI_SYSTEM_PROMPT } from "@/constants/ai-prompt";

interface StepConfig {
  key: InvestigationStep;
  label: string;
  icon: typeof AiBrain01Icon;
}

const STEPS: StepConfig[] = [
  { key: "collecting_evidence", label: "Collecting evidence from encrypted vault", icon: File02Icon },
  { key: "anonymizing", label: "Anonymizing contract context", icon: SecurityBlockIcon },
  { key: "connecting_tee", label: "Connecting to TEE-protected AI", icon: LockIcon },
  { key: "analyzing", label: "Analyzing dispute", icon: AiBrain01Icon },
  { key: "retrieving_signature", label: "Retrieving TEE signature", icon: LockIcon },
  { key: "submitting_onchain", label: "Submitting resolution on-chain", icon: ArrowRight01Icon },
];

function getStepIndex(step: InvestigationStep): number {
  return STEPS.findIndex((s) => s.key === step);
}

function ResolutionBadge({ resolution }: { resolution: string }) {
  const colors: Record<string, string> = {
    Freelancer: "bg-success/10 text-success border-success/20",
    Client: "bg-destructive/10 text-destructive border-destructive/20",
    ContinueWork: "bg-warning/10 text-warning border-warning/20",
  };
  const isSplit = resolution.startsWith("{");
  const colorClass = isSplit
    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
    : colors[resolution] || "bg-muted text-muted-foreground border-border";
  const label = isSplit ? `Split ${JSON.parse(resolution)?.Split?.freelancer_pct}%` : resolution;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
      {label}
    </span>
  );
}

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: typeof AiBrain01Icon;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-muted/50 transition-colors"
      >
        <HugeiconsIcon icon={icon} size={14} className="text-muted-foreground shrink-0" />
        <span className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <HugeiconsIcon
          icon={open ? ArrowUp01Icon : ArrowDown01Icon}
          size={14}
          className="text-muted-foreground ml-auto"
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface InvestigationPanelProps {
  currentStep: InvestigationStep;
  detail?: string;
  error?: string;
  context?: string;
  rawResponse?: string;
  result?: {
    resolution: string;
    explanation: string;
    confidence: number;
    context_for_freelancer: string | null;
  };
  onClose?: () => void;
}

export function InvestigationPanel({
  currentStep,
  detail,
  error,
  context,
  rawResponse,
  result,
  onClose,
}: InvestigationPanelProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isDone = currentStep === "done";
  const isError = currentStep === "error";
  const isRunning = !isDone && !isError;
  const activeIndex = getStepIndex(currentStep);

  useEffect(() => {
    if (!isRunning) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isRunning]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="rounded-xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden shadow-lg"
    >
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={AiBrain01Icon} size={18} className="text-primary" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">AI Investigation</h3>
          <p className="text-[10px] font-mono text-muted-foreground">
            {isDone ? "Completed" : isError ? "Failed" : "In progress"} · {elapsedSeconds}s
          </p>
        </div>
        {isDone && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-success bg-success/10 px-2 py-0.5 rounded-full">
            <HugeiconsIcon icon={LockIcon} size={10} />
            TEE Verified
          </span>
        )}
        {(isDone || isError) && onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <HugeiconsIcon icon={Cancel01Icon} size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {isRunning && (
        <div className="px-4 py-2 bg-warning/5 border-b border-warning/10 flex items-center gap-2">
          <HugeiconsIcon icon={Alert02Icon} size={14} className="text-warning shrink-0" />
          <p className="text-[11px] text-warning/90">
            For your security, the investigation runs in your browser. Please keep this tab open until complete.
          </p>
        </div>
      )}

      <div className="px-4 py-3 space-y-1.5">
        {STEPS.map((step, i) => {
          const isActive = i === activeIndex;
          const isCompleted = isDone || i < activeIndex;
          const isPending = !isDone && i > activeIndex;

          return (
            <motion.div
              key={step.key}
              initial={false}
              animate={{ opacity: isPending ? 0.4 : 1 }}
              className="flex items-center gap-2.5 py-1"
            >
              <span className="w-5 h-5 flex items-center justify-center shrink-0">
                {isCompleted ? (
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-success" />
                ) : isActive ? (
                  <HugeiconsIcon icon={Loading01Icon} size={16} className="text-primary animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                )}
              </span>
              <span
                className={`text-xs ${
                  isActive ? "text-foreground font-medium" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/50"
                }`}
              >
                {step.label}
                {isActive && step.key === "analyzing" && detail && (
                  <span className="text-primary ml-1">({detail.split("/").pop()})</span>
                )}
              </span>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isDone && result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="border-t border-border px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-mono text-primary uppercase tracking-wider">Decision</p>
                <ResolutionBadge resolution={result.resolution} />
                <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                  {result.confidence}% confidence
                </span>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed">{result.explanation}</p>
              {result.context_for_freelancer && (
                <div className="p-2.5 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-[10px] font-mono text-warning mb-1 uppercase tracking-wider">
                    Instructions for Freelancer
                  </p>
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {result.context_for_freelancer}
                  </p>
                </div>
              )}
            </div>

            {rawResponse && (
              <CollapsibleSection title="AI Reasoning" icon={AiBrain01Icon}>
                <pre className="text-[11px] text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {rawResponse}
                </pre>
              </CollapsibleSection>
            )}

            {context && (
              <CollapsibleSection title="Context Provided" icon={SecurityBlockIcon}>
                <pre className="text-[11px] text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {context}
                </pre>
              </CollapsibleSection>
            )}

            <div className="border-t border-border px-4 py-2">
              <button
                onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
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
                    <pre className="mt-2 text-[11px] text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {AI_SYSTEM_PROMPT}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {isDone && !result && detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="px-4 py-3">
              <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Resolution</p>
              <p className="text-xs text-foreground/90 leading-relaxed">{detail}</p>
            </div>
          </motion.div>
        )}

        {isError && error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-destructive/20"
          >
            <div className="px-4 py-3 bg-destructive/5">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
