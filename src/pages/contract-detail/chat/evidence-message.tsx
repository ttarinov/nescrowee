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

function senderRole(sender: string, contract: EscrowContract): string {
  if (sender === contract.client) return "Client";
  if (sender === contract.freelancer) return "Freelancer";
  return sender;
}

function initial(sender: string, contract: EscrowContract): string {
  if (sender === contract.client) return "C";
  if (sender === contract.freelancer) return "F";
  return sender.slice(0, 1).toUpperCase() || "?";
}

export function EvidenceMessage({
  message,
  evidence,
  isSelf,
  contract,
}: EvidenceMessageProps) {
  const role = senderRole(message.sender, contract);
  const letter = initial(message.sender, contract);

  return (
    <div className={`py-2 flex gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"} items-end max-w-md ${isSelf ? "ml-auto" : ""}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-white/10 text-white/90 border border-white/10"
        aria-hidden
      >
        {letter}
      </div>
      <div className="min-w-[14rem] flex flex-col items-start max-w-[85%]">
        <p className="text-[10px] font-mono text-white/50 mb-0.5 px-0.5">
          {role.toLowerCase()}
        </p>
        <div className="w-full min-w-[12rem] py-2 px-3 rounded-lg bg-purple-500/10">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Attachment01Icon}
              size={16}
              className="text-accent shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-white/95">
                {evidence?.fileName || "File"}
              </p>
              <p className="text-[10px] font-mono text-white/50">
                {evidence?.fileSize
                  ? `${(evidence.fileSize / 1024).toFixed(1)} KB`
                  : ""}
                {evidence?.cid ? (
                  <span className="text-emerald-400/80"> · encrypted via NOVA</span>
                ) : " · pending upload"}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-white/40 font-mono mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
