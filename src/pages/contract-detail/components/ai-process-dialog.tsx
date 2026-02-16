import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  LockIcon,
  File02Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import type { AiResolutionData, SocialMessage } from "@/near/social";
import type { EscrowContract } from "@/types/escrow";

interface AiProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resolutionData: AiResolutionData;
  contract: EscrowContract;
  messages: SocialMessage[];
}

function SummaryCard({
  summary,
  modelId,
  confidence,
}: {
  summary: string;
  modelId: string;
  confidence: number;
}) {
  return (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-primary shrink-0" />
        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
          Summary
        </span>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          {modelId} · {confidence}%
        </span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{summary}</p>
    </div>
  );
}

function FileTriggeredCard({ fileName, source }: { fileName: string; source: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center gap-2">
        <HugeiconsIcon icon={File02Icon} size={16} className="text-muted-foreground shrink-0" />
        <span className="font-mono text-sm font-medium truncate">{fileName}</span>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto shrink-0">
          {source}
        </span>
      </div>
    </div>
  );
}

function ProcessStep({
  step,
  label,
  isActive,
}: {
  step: number;
  label: string;
  isActive: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold ${
          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {String(step).padStart(2, "0")}
      </span>
      <span className={`text-sm ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

export function AiProcessDialog({
  open,
  onOpenChange,
  resolutionData,
  contract,
  messages,
}: AiProcessDialogProps) {
  const evidenceMessages = messages.filter((m) => m.type === "evidence");
  const chatMessages = messages.filter((m) => m.type === "text");

  const stages = [
    "Load chat history",
    "Load evidence files (NOVA)",
    "Anonymize context (Party A/B)",
    "Call NEAR AI Cloud (TEE)",
    "Verify Ed25519 signature",
    "Resolution complete",
  ];

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

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 py-5 space-y-6">
          <SummaryCard
            summary={resolutionData.analysis || resolutionData.explanation}
            modelId={resolutionData.model_id}
            confidence={resolutionData.confidence}
          />

          <section>
            <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              Pipeline
            </h3>
            <div className="space-y-2">
              {stages.map((stage, i) => (
                <ProcessStep
                  key={stage}
                  step={i + 1}
                  label={stage}
                  isActive={i === stages.length - 1}
                />
              ))}
            </div>
          </section>

          {evidenceMessages.length > 0 && (
            <section>
              <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <HugeiconsIcon icon={File02Icon} size={14} />
                Evidence Files Used
              </h3>
              <div className="space-y-3">
                {evidenceMessages.map((msg) => {
                  const evidence = msg.data as { fileName?: string } | undefined;
                  return (
                    <FileTriggeredCard
                      key={msg.id}
                      fileName={evidence?.fileName || "Unknown file"}
                      source="NOVA evidence vault"
                    />
                  );
                })}
              </div>
            </section>
          )}

          {chatMessages.length > 0 && (
            <section>
              <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Chat History Analyzed
              </h3>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  {chatMessages.length} message{chatMessages.length !== 1 ? "s" : ""} from contract chat
                </p>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Resolution
            </h3>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-sm font-medium mb-2">{resolutionData.resolution}</p>
              {resolutionData.explanation && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {resolutionData.explanation}
                </p>
              )}
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
            </div>
          </section>

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
