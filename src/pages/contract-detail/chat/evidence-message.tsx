import { HugeiconsIcon } from "@hugeicons/react";
import { Attachment01Icon } from "@hugeicons/core-free-icons";
import type { SocialMessage, EvidenceData } from "@/near/social";
import type { EscrowContract } from "@/types/escrow";

interface EvidenceMessageProps {
  message: SocialMessage;
  evidence: EvidenceData | undefined;
  isSelf: boolean;
  contract: EscrowContract;
  showAvatar?: boolean;
  isFirstInGroup?: boolean;
}

function initial(sender: string, contract: EscrowContract): string {
  if (sender === contract.client) return "C";
  if (sender === contract.freelancer) return "F";
  return sender.slice(0, 1).toUpperCase() || "?";
}

function senderRole(sender: string, contract: EscrowContract): string {
  if (sender === contract.client) return "Client";
  if (sender === contract.freelancer) return "Freelancer";
  return sender;
}

export function EvidenceMessage({
  message,
  evidence,
  isSelf,
  contract,
  showAvatar = true,
  isFirstInGroup = true,
}: EvidenceMessageProps) {
  const role = senderRole(message.sender, contract);
  const letter = initial(message.sender, contract);
  const isClient = message.sender === contract.client;

  return (
    <div className={`flex gap-4 ${isSelf ? "flex-row-reverse" : ""} group`}>
      {showAvatar ? (
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 mt-1 text-xs font-medium ${
            isClient ? "bg-indigo-600 text-white/90" : "bg-slate-700 text-white/80"
          }`}
          aria-hidden
        >
          {letter}
        </div>
      ) : (
        <div className="w-8 shrink-0" />
      )}
      <div className={`flex flex-col gap-1 max-w-[85%] ${isSelf ? "items-end" : "items-start"}`}>
        {isFirstInGroup && (
          <div className={`flex items-baseline gap-2 ${isSelf ? "mr-1" : "ml-1"}`}>
            <span className="text-[10px] text-slate-600">{role}</span>
          </div>
        )}
        <div
          className={`relative p-3 px-4 text-sm leading-relaxed shadow-sm ${
            isSelf
              ? "bg-[#2e1065] border border-indigo-500/20 rounded-[20px] rounded-tr-none text-indigo-100"
              : "bg-[#1e1b2e] border border-white/5 rounded-[20px] rounded-tl-none text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Attachment01Icon} size={16} className="text-purple-400 shrink-0" />
            <div>
              <p className="text-sm font-medium">{evidence?.fileName || "File"}</p>
              <p className="text-[10px] font-mono text-white/50">
                {evidence?.fileSize ? `${(evidence.fileSize / 1024).toFixed(1)} KB` : ""}
                {evidence?.cid ? (
                  <span className="text-emerald-400/80"> · encrypted via NOVA</span>
                ) : " · pending upload"}
              </p>
            </div>
          </div>
          <div className={`text-[9px] mt-1 ${isSelf ? "text-indigo-300/50 text-right" : "text-slate-600"}`}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
