import { HugeiconsIcon } from "@hugeicons/react";
import { Attachment01Icon } from "@hugeicons/core-free-icons";
import type { SocialMessage, EvidenceData } from "@/near/social";
import type { EscrowContract } from "@/types/escrow";

interface EvidenceMessageProps {
  message: SocialMessage;
  evidence: EvidenceData | undefined;
  isSelf: boolean;
  contract: EscrowContract;
}

export function EvidenceMessage({
  message,
  evidence,
  isSelf,
  contract,
}: EvidenceMessageProps) {
  const senderLabel =
    message.sender === contract.client
      ? "Client"
      : message.sender === contract.freelancer
        ? "Freelancer"
        : message.sender;

  return (
    <div className={`py-2 ${isSelf ? "text-right" : "text-left"}`}>
      <div
        className={`inline-block max-w-[85%] py-2 px-3 ${
          isSelf ? "bg-primary/10" : "bg-muted/50"
        } rounded-lg`}
      >
        <p className="text-xs text-muted-foreground mb-1 font-mono">
          {senderLabel}
        </p>
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Attachment01Icon}
            size={16}
            className="text-accent shrink-0"
          />
          <div>
            <p className="text-sm font-medium">
              {evidence?.fileName || "File"}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground">
              {evidence?.fileSize
                ? `${(evidence.fileSize / 1024).toFixed(1)} KB`
                : ""}
              {evidence?.cid ? (
                <span className="text-emerald-400/80"> · encrypted via NOVA</span>
              ) : " · pending upload"}
            </p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
