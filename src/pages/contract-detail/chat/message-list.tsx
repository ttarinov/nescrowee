import type { EscrowContract } from "@/types/escrow";
import type { EvidenceData, SocialMessage, AiResolutionData } from "@/near/social";
import { TextMessage } from "./text-message";
import { EvidenceMessage } from "./evidence-message";
import { AiResolutionMessage } from "./ai-resolution-message";

interface MessageListProps {
  messages: SocialMessage[];
  contract: EscrowContract;
  accountId: string | null;
  onOpenAiProcess?: (data: AiResolutionData) => void;
}

function isUserMessage(msg: SocialMessage) {
  return msg.type !== "ai_resolution";
}

export function MessageList({
  messages,
  contract,
  accountId,
  onOpenAiProcess,
}: MessageListProps) {
  return (
    <div className="flex flex-col">
      {messages.map((msg, i) => {
        const prev = messages[i - 1];
        const next = messages[i + 1];

        const sameAsPrev = prev && isUserMessage(prev) && isUserMessage(msg) && prev.sender === msg.sender;
        const sameAsNext = next && isUserMessage(next) && isUserMessage(msg) && next.sender === msg.sender;

        const isFirstInGroup = !sameAsPrev;
        const isLastInGroup = !sameAsNext;

        const gap = isFirstInGroup ? "mt-6" : "mt-1";

        if (msg.type === "ai_resolution") {
          const data = msg.data as AiResolutionData | undefined;
          if (!data) return null;
          return (
            <div key={msg.id} className="mt-6">
              <AiResolutionMessage
                message={msg}
                data={data}
                onClick={() => onOpenAiProcess?.(data)}
              />
            </div>
          );
        }

        if (msg.type === "evidence") {
          const evidence = msg.data as EvidenceData | undefined;
          const isSelf = msg.sender === accountId;
          return (
            <div key={msg.id} className={gap}>
              <EvidenceMessage
                message={msg}
                evidence={evidence}
                isSelf={isSelf}
                contract={contract}
                showAvatar={isLastInGroup}
                isFirstInGroup={isFirstInGroup}
              />
            </div>
          );
        }

        const isSelf = msg.sender === accountId;
        return (
          <div key={msg.id} className={gap}>
            <TextMessage
              message={msg}
              isSelf={isSelf}
              contract={contract}
              showAvatar={isLastInGroup}
              isFirstInGroup={isFirstInGroup}
            />
          </div>
        );
      })}
    </div>
  );
}
