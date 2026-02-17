import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <section>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
      >
        <HugeiconsIcon icon={icon} size={14} className="text-muted-foreground shrink-0" />
        <span className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
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
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function AiProcessDialog({
  open,
  onOpenChange,
  resolutionData,
}: AiProcessDialogProps) {
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0 border rounded-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 pr-12 border-b border-border space-y-0">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={AiBrain01Icon} size={22} className="text-primary" />
            </span>
            <span>AI Resolution</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-success bg-success/10 px-2 py-0.5 rounded-full ml-auto">
              <HugeiconsIcon icon={LockIcon} size={10} />
              TEE
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">
          <section>
            <div className="flex items-center gap-2 mb-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-primary shrink-0" />
              <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                Decision
              </span>
              <ResolutionBadge resolution={resolutionData.resolution} />
              <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                {resolutionData.model_id} · {resolutionData.confidence}%
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {resolutionData.analysis || resolutionData.explanation}
            </p>
            {resolutionData.context_for_freelancer && (
              <div className="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-[10px] font-mono text-warning mb-1 uppercase tracking-wider">
                  Instructions for Freelancer
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {resolutionData.context_for_freelancer}
                </p>
              </div>
            )}
          </section>

          {resolutionData.raw_response && (
            <CollapsibleSection title="AI Reasoning" icon={AiBrain01Icon}>
              <pre className="text-[11px] text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-3 max-h-64 overflow-y-auto custom-scrollbar">
                {resolutionData.raw_response}
              </pre>
            </CollapsibleSection>
          )}

          {resolutionData.context && (
            <CollapsibleSection title="Context Provided" icon={SecurityBlockIcon}>
              <pre className="text-[11px] text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-3 max-h-64 overflow-y-auto custom-scrollbar">
                {resolutionData.context}
              </pre>
            </CollapsibleSection>
          )}

          <section>
            <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Verification
            </h3>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                {resolutionData.tee_verified ? (
                  <>
                    <HugeiconsIcon icon={LockIcon} size={16} className="text-success" />
                    <p className="text-sm text-foreground">
                      Ed25519 signature verified on-chain via TEE
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Verification pending
                  </p>
                )}
              </div>
            </div>
          </section>

          <section>
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
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
