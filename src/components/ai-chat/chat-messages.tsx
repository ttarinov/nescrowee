import { useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiBrain01Icon } from "@hugeicons/core-free-icons";
import type { ChatMessage } from "./mock-responses";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isThinking?: boolean;
}

export function ChatMessages({ messages, isThinking }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full min-h-[12rem]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-900/30 mb-4">
              <HugeiconsIcon icon={AiBrain01Icon} size={24} className="text-purple-300" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">Welcome to Nescrowee AI Assistant</p>
            <p className="text-xs text-muted-foreground">Ask me anything about the platform, security, escrow, or disputes!</p>
          </div>
        </div>
      )}

      {messages.map((message, index) => {
        const isUser = message.role === "user";
        return (
          <div key={index} className={`py-2 ${isUser ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block max-w-[85%] py-2 px-3 ${
                isUser ? "bg-primary/10" : "bg-muted/50"
              } rounded-lg`}
            >
              {!isUser && (
                <div className="flex items-center gap-2 mb-1">
                  <HugeiconsIcon icon={AiBrain01Icon} size={14} className="text-primary" />
                  <p className="text-xs text-muted-foreground font-mono">AI Assistant</p>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}

      {isThinking && (
        <div className="py-2 text-left">
          <div className="inline-block max-w-[85%] py-2 px-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <HugeiconsIcon icon={AiBrain01Icon} size={14} className="text-primary" />
              <p className="text-xs text-muted-foreground font-mono">AI Assistant</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
