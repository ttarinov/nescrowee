import { useState, useRef } from "react";
import type { EscrowContract } from "@/types/escrow";
import type { SocialMessage, AiResolutionData } from "@/near/social";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { AiProcessingIndicator } from "./ai-processing-indicator";
import { AiProcessDialog } from "../components/ai-process-dialog";

interface ChatPanelProps {
  contract: EscrowContract;
  messages: SocialMessage[];
  onSendMessage: (content: string) => void;
  accountId: string | null;
  aiProcessing: string | null;
  onEvidenceUploaded?: () => void;
}

export function ChatPanel({
  contract,
  messages,
  onSendMessage,
  accountId,
  aiProcessing,
  onEvidenceUploaded,
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

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0 rounded-xl bg-muted/20">
      <div className="flex-1 min-h-0 flex flex-col min-w-0">
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-0">
          {messages.length === 0 && (
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
          {aiProcessing && <AiProcessingIndicator />}
          <div ref={chatEndRef} />
        </div>

        {userRole && accountId && (
          <ChatInput
            onSend={onSendMessage}
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
          contract={contract}
          messages={messages}
        />
      )}
    </div>
  );
}
