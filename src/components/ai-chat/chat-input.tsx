import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="p-3 shrink-0 border-t border-slate-800">
      <div className="relative flex items-end rounded-2xl bg-muted/40 focus-within:bg-muted/60 transition-colors">
        <Textarea
          placeholder="Ask about Nescrowee..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[52px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl px-4 py-3 pr-14 text-sm placeholder:text-muted-foreground"
          rows={2}
          disabled={disabled}
        />
        <div className="absolute right-2 bottom-2">
          <Button
            variant="default"
            size="sm"
            className="h-8 w-8 p-0 rounded-full shrink-0"
            onClick={handleSend}
            disabled={disabled || !value.trim()}
          >
            <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
