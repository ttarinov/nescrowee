import { useCallback, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

function formatPromptContent(text: string) {
  const lines = text.split(/\n/);
  const out: ReactNode[] = [];
  let listItems: string[] = [];
  const flushList = () => {
    if (listItems.length > 0) {
      out.push(
        <ul key={out.length} className="list-disc list-inside my-2 space-y-1 text-sm text-gray-300">
          {listItems.map((item, i) => (
            <li key={i}>{item.replace(/^[-*]\s*/, "").replace(/\*\*(.+?)\*\*/g, "$1")}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line;
    if (/^#+\s/.test(trimmed)) {
      flushList();
      const level = trimmed.match(/^(#+)/)?.[1].length ?? 1;
      const label = trimmed.replace(/^#+\s*/, "");
      out.push(
        <h4
          key={out.length}
          className={`font-semibold text-white mt-4 mb-1 first:mt-0 ${level === 1 ? "text-base" : "text-sm"}`}
        >
          {label}
        </h4>
      );
    } else if (/^-\s/.test(trimmed) || /^\*\s/.test(trimmed)) {
      listItems.push(trimmed);
    } else if (/^```/.test(trimmed)) {
      flushList();
      const block: string[] = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith("```")) {
        block.push(lines[j]);
        j++;
      }
      out.push(
        <pre key={out.length} className="my-3 p-4 rounded-lg bg-black/40 border border-purple-500/10 text-xs text-gray-300 overflow-x-auto">
          <code>{block.join("\n")}</code>
        </pre>
      );
      i = j;
    } else if (trimmed === "") {
      flushList();
      out.push(<div key={out.length} className="h-2" />);
    } else {
      flushList();
      out.push(
        <p key={out.length} className="text-sm text-gray-300 leading-relaxed my-1">
          {trimmed.replace(/\*\*(.+?)\*\*/g, "$1")}
        </p>
      );
    }
  }
  flushList();
  return out;
}

export default function PromptDialog({
  open,
  onOpenChange,
  title,
  content,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    toast.success("Prompt copied to clipboard");
  }, [content]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col gap-0 p-0 border border-purple-500/10 bg-background">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-lg font-semibold text-white pr-8">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-gray-400 hover:text-white"
              onClick={handleCopy}
            >
              <HugeiconsIcon icon={Copy01Icon} size={16} className="mr-1.5" />
              Copy
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0 px-6 pb-6">
          <div className="font-mono rounded-lg border border-purple-500/10 bg-black/30 p-5 text-sm leading-relaxed">
            {formatPromptContent(content)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
