import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { getMockAiResponse, type ChatMessage } from "./mock-responses";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = async (content: string) => {
    const userMessage: ChatMessage = {
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const aiResponse = await getMockAiResponse(content);
      const aiMessage: ChatMessage = {
        role: "ai",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-800">
          <DialogTitle className="flex items-center gap-2">
            <span>AI Assistant</span>
            <span className="text-xs font-normal text-muted-foreground">Ask about Nescrowee</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex flex-col">
          <ChatMessages messages={messages} isThinking={isThinking} />
          <ChatInput onSend={handleSend} disabled={isThinking} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
