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

export function MessageList({
  messages,
  contract,
  accountId,
  onOpenAiProcess,
}: MessageListProps) {
  return (
    <>
      {messages.map((msg) => {
        if (msg.type === "ai_resolution") {
          const data = msg.data as AiResolutionData | undefined;
          if (!data) return null;
          return (
            <AiResolutionMessage
              key={msg.id}
              message={msg}
              data={data}
              onClick={() => onOpenAiProcess?.(data)}
            />
          );
        }

        if (msg.type === "evidence") {
          const evidence = msg.data as EvidenceData | undefined;
          const isSelf = msg.sender === accountId;
          return (
            <EvidenceMessage
              key={msg.id}
              message={msg}
              evidence={evidence}
              isSelf={isSelf}
              contract={contract}
            />
          );
        }

        const isSelf = msg.sender === accountId;
        return (
          <TextMessage
            key={msg.id}
            message={msg}
            isSelf={isSelf}
            contract={contract}
          />
        );
      })}
    </>
  );
}
