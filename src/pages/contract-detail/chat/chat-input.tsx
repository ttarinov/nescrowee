import { useState, useRef } from "react";
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
  const [isFocused, setIsFocused] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!value.trim() || sendPending) return;
    try {
      await onSend(value);
      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
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

  const hasContent = value.trim().length > 0;

  return (
    <div className="shrink-0 p-4 md:p-6 bg-gradient-to-t from-[#030014] via-[#030014] to-transparent">
      <div className="max-w-3xl mx-auto">
        <div
          className={`relative flex items-end gap-2 p-2 pl-3 rounded-[32px] transition-all duration-300 ${
            isFocused
              ? "bg-[#1a1625] shadow-[0_0_30px_rgba(139,92,246,0.1)]"
              : "bg-[#13101c] hover:bg-[#1a1625]"
          }`}
        >
          <div className="flex items-center gap-1 pb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={handleEvidenceUpload}
            />
            <button
              className="p-2 rounded-full text-gray-400 hover:text-purple-300 hover:bg-purple-500/20 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingEvidence}
              title="Upload evidence (encrypted via NOVA)"
            >
              <HugeiconsIcon icon={Attachment01Icon} size={18} />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message..."
            rows={1}
            className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 text-sm py-3 px-1 focus:outline-none resize-none max-h-32 custom-scrollbar min-h-[44px]"
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />

          <div className="pb-1 pr-1">
            <button
              className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                hasContent && !sendPending
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95"
                  : "bg-[#2a2438] text-gray-500 cursor-not-allowed"
              }`}
              disabled={!hasContent || sendPending}
              onClick={handleSend}
            >
              <HugeiconsIcon icon={ArrowUp01Icon} size={18} />
            </button>
          </div>
        </div>

        <div className="text-center mt-3">
          <span className="text-[10px] text-gray-600 font-medium">
            Stored on NEAR Social DB · Each message costs gas
          </span>
        </div>
      </div>
    </div>
  );
}
