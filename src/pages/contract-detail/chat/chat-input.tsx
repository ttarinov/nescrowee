import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon, Attachment01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import type { EscrowContract } from "@/types/escrow";
import { sendStructuredMessage } from "@/near/social";
import { uploadEvidence as novaUpload, createEvidenceVault, isVaultMember } from "@/nova/client";
import type { EvidenceData } from "@/near/social";

interface ChatInputProps {
  onSend: (content: string) => Promise<void> | void;
  sendPending?: boolean;
  accountId: string | null;
  contract: EscrowContract;
  onEvidenceUploaded?: () => void;
}

export function ChatInput({
  onSend,
  sendPending,
  accountId,
  contract,
  onEvidenceUploaded,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!value.trim() || sendPending) return;
    try {
      await onSend(value);
      setValue("");
    } catch { /* keep text on error */ }
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accountId || !contract) return;
    e.target.value = "";

    setUploadingEvidence(true);
    try {
      const hasVault = await isVaultMember(accountId, contract.id);
      if (!hasVault) {
        await createEvidenceVault(accountId, contract.id);
      }

      const fileBuffer = await file.arrayBuffer();
      const result = await novaUpload(accountId, contract.id, fileBuffer, file.name);

      const evidence: EvidenceData = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        cid: result.cid,
      };
      await sendStructuredMessage(
        accountId,
        contract.id,
        `Evidence: ${file.name}`,
        "evidence",
        evidence as unknown as Record<string, unknown>,
      );
      toast.success(`Evidence encrypted & uploaded via NOVA`);
      onEvidenceUploaded?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Evidence upload failed: ${msg}`);
    } finally {
      setUploadingEvidence(false);
    }
  };

  return (
    <div className="p-3 shrink-0">
      <div className="relative flex items-end rounded-2xl bg-muted/40 focus-within:bg-muted/60 transition-colors">
        <Textarea
          placeholder="Type a message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[64px] max-h-[160px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl px-4 py-3.5 pr-14 text-sm placeholder:text-muted-foreground"
          rows={3}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.txt,.doc,.docx"
          className="hidden"
          onChange={handleEvidenceUpload}
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingEvidence}
            title="Upload evidence (encrypted via NOVA)"
          >
            <HugeiconsIcon icon={Attachment01Icon} size={16} />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 w-8 p-0 rounded-full shrink-0"
            onClick={handleSend}
            disabled={sendPending || !value.trim()}
          >
            <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
