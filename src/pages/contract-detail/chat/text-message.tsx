import type { SocialMessage } from "@/near/social";
import type { EscrowContract } from "@/types/escrow";

interface TextMessageProps {
  message: SocialMessage;
  isSelf: boolean;
  contract: EscrowContract;
}

export function TextMessage({ message, isSelf, contract }: TextMessageProps) {
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
        <p className="text-sm">{message.content}</p>
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
