import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Clock01Icon,
  AiBrain01Icon,
  LockIcon,
  Loading01Icon,
  Alert01Icon,
  RefreshIcon,
  Loading02Icon,
} from "@hugeicons/core-free-icons";
import StatusBadge from "@/components/status-badge";
import type { EscrowContract } from "@/types/escrow";
import type { SocialMessage, AiResolutionData } from "@/near/social";
import type { InvestigationStep } from "@/hooks/useContract";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { AiProcessDialog } from "../dialogs/ai-process-dialog";

export interface InvestigationState {
  step: InvestigationStep;
  detail?: string;
  error?: string;
  elapsed: number;
  onRetry?: () => void;
  onDismiss?: () => void;
}

interface ChatPanelProps {
  contract: EscrowContract;
  messages: SocialMessage[];
  onSendMessage: (content: string) => void;
  sendPending?: boolean;
  accountId: string | null;
  onEvidenceUploaded?: () => void;
  investigation?: InvestigationState | null;
  chatError?: boolean;
}

export function ChatPanel({
  contract,
  messages,
  onSendMessage,
  sendPending,
  accountId,
  onEvidenceUploaded,
  investigation,
  chatError,
}: ChatPanelProps) {
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiDialogData, setAiDialogData] = useState<AiResolutionData | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isClient = accountId === contract.client;
  const isFreelancer = accountId === contract.freelancer;
  const userRole = isClient ? "client" : isFreelancer ? "freelancer" : null;

  const handleOpenAiProcess = (data: AiResolutionData) => {
    setAiDialogData(data);
    setAiDialogOpen(true);
  };

  const reviewMilestone = contract.milestones.find(
    (m) => m.status === "SubmittedForReview" && m.payment_request_deadline_ns,
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [investigation?.step]);

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 rounded-xl bg-muted/20">
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <Link
          to="/contracts"
          className="text-white/40 hover:text-white/70 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Link>
        <h2 className="text-sm font-semibold text-white truncate">{contract.title}</h2>
        <StatusBadge status={contract.status} />
      </div>
      <div className="flex-1 min-h-0 flex flex-col min-w-0 relative">
        <div className="flex-1 min-h-0 overflow-y-scroll p-4 pb-0">
          {chatError && (
            <div className="flex items-center justify-center h-full min-h-[12rem]">
              <p className="text-sm text-destructive">
                Failed to load messages. Check your connection and try again.
              </p>
            </div>
          )}
          {!chatError && messages.length === 0 && !investigation && (
            <div className="flex items-center justify-center h-full min-h-[12rem]">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation.
              </p>
            </div>
          )}
          <MessageList
            messages={messages}
            contract={contract}
            accountId={accountId}
            onOpenAiProcess={handleOpenAiProcess}
          />
          {investigation && <InvestigationMessage investigation={investigation} />}
          <div ref={chatEndRef} className="h-4" />
        </div>

        {reviewMilestone && (
          <DeadlineBanner
            milestoneTitle={reviewMilestone.title}
            deadlineNs={reviewMilestone.payment_request_deadline_ns!}
          />
        )}

        {userRole && accountId && (
          <ChatInput
            onSend={onSendMessage}
            sendPending={sendPending}
            accountId={accountId}
            contract={contract}
            onEvidenceUploaded={onEvidenceUploaded}
          />
        )}
      </div>

      {aiDialogData && (
        <AiProcessDialog
          open={aiDialogOpen}
          onOpenChange={setAiDialogOpen}
          resolutionData={aiDialogData}
        />
      )}
    </div>
  );
}

const STEP_LABELS: Record<string, string> = {
  collecting_evidence: "Collecting evidence",
  anonymizing: "Anonymizing context",
  connecting_tee: "Connecting to TEE",
  analyzing: "Analyzing dispute",
  retrieving_signature: "Getting TEE signature",
  submitting_onchain: "Submitting on-chain",
  done: "Complete",
  error: "Failed",
};

function InvestigationMessage({ investigation }: { investigation: InvestigationState }) {
  const { step, detail, error, elapsed, onRetry, onDismiss } = investigation;
  const isDone = step === "done";
  const isError = step === "error";
  const isRunning = !isDone && !isError;

  if (isDone) return null;

  return (
    <div className="flex flex-col items-center py-2">
      <div className="w-full max-w-md rounded-xl border overflow-hidden transition-colors"
        style={{
          borderColor: isError ? "rgba(239,68,68,0.2)" : "rgba(var(--primary-rgb,124,58,237),0.2)",
          background: isError ? "rgba(239,68,68,0.05)" : "rgba(var(--primary-rgb,124,58,237),0.05)",
        }}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: isError ? "rgba(239,68,68,0.1)" : "rgba(var(--primary-rgb,124,58,237),0.1)" }}
          >
            {isRunning ? (
              <HugeiconsIcon icon={Loading02Icon} size={16} className="text-primary animate-spin" />
            ) : (
              <HugeiconsIcon icon={Alert01Icon} size={16} className="text-destructive" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground flex items-center gap-2">
              AI Investigation
              {isRunning && (
                <span className="text-[10px] font-mono text-muted-foreground font-normal">{elapsed}s</span>
              )}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isError ? error : STEP_LABELS[step] || step}
              {isRunning && step === "analyzing" && detail && (
                <span className="text-primary ml-1">({detail.split("/").pop()})</span>
              )}
            </p>
          </div>
          {isRunning && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-success shrink-0">
              <HugeiconsIcon icon={LockIcon} size={10} />
              TEE
            </span>
          )}
        </div>

        {isError && (
          <div className="px-4 pb-3 flex items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-xs font-medium text-primary transition-colors"
              >
                <HugeiconsIcon icon={RefreshIcon} size={12} />
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-1.5 rounded-lg hover:bg-muted/50 text-xs text-muted-foreground transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DeadlineBanner({ milestoneTitle, deadlineNs }: { milestoneTitle: string; deadlineNs: number }) {
  const [timeLeft, setTimeLeft] = useState(() => formatDeadline(deadlineNs));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(formatDeadline(deadlineNs)), 60_000);
    return () => clearInterval(interval);
  }, [deadlineNs]);

  if (timeLeft === "Expired") return null;

  return (
    <div className="shrink-0 mx-4 mb-2 px-4 py-2.5 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-2">
      <HugeiconsIcon icon={Clock01Icon} size={14} className="text-warning shrink-0" />
      <p className="text-xs text-warning font-mono">
        <span className="font-semibold">{milestoneTitle}</span> — payment auto-approves in {timeLeft}
      </p>
    </div>
  );
}

function formatDeadline(deadlineNs: number): string {
  const diff = deadlineNs - Date.now() * 1e6;
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (3600 * 1e9));
  const minutes = Math.floor((diff % (3600 * 1e9)) / (60 * 1e9));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
