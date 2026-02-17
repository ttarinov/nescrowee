import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import StatusBadge from "@/components/status-badge";
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
  sendPending?: boolean;
  accountId: string | null;
  aiProcessing: string | null;
  onEvidenceUploaded?: () => void;
}

export function ChatPanel({
  contract,
  messages,
  onSendMessage,
  sendPending,
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
          contract={contract}
          messages={messages}
        />
      )}
    </div>
  );
}
