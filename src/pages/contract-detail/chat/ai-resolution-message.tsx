import { HugeiconsIcon } from "@hugeicons/react";
import { AiBrain01Icon, LockIcon } from "@hugeicons/core-free-icons";
import type { SocialMessage, AiResolutionData } from "@/near/social";

interface AiResolutionMessageProps {
  message: SocialMessage;
  data: AiResolutionData;
  onClick?: () => void;
}

export function AiResolutionMessage({
  message,
  data,
  onClick,
}: AiResolutionMessageProps) {
  return (
    <div className="flex flex-col items-center py-1">
      <button
        type="button"
        onClick={onClick}
        className="w-full max-w-md p-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 space-y-2 text-left transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-primary flex items-center gap-2">
            <HugeiconsIcon icon={AiBrain01Icon} size={14} className="text-primary" />
            AI Resolution
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-success flex items-center gap-1">
              <HugeiconsIcon icon={LockIcon} size={10} />
              TEE
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {data.confidence}%
            </span>
          </div>
        </div>
        <div className="w-full bg-secondary/50 rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all"
            style={{ width: `${data.confidence}%` }}
          />
        </div>
        <p className="text-sm font-medium">{data.resolution}</p>
        {data.explanation && (
          <p className="text-sm text-muted-foreground">{data.explanation}</p>
        )}
        {data.context_for_freelancer && (
          <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-[10px] font-mono text-warning mb-0.5">
              What to fix
            </p>
            <p className="text-sm text-muted-foreground">
              {data.context_for_freelancer}
            </p>
          </div>
        )}
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground pt-1">
          <span>Model: {data.model_id}</span>
          {data.tee_verified && <span className="text-success">Ed25519 verified</span>}
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </button>
    </div>
  );
}
