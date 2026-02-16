import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

interface PromptHashCardProps {
  promptHash: string;
}

export function PromptHashCard({ promptHash }: PromptHashCardProps) {
  if (!promptHash) return null;
  return (
    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50">
          <HugeiconsIcon icon={InformationCircleIcon} size={20} />
        </div>
        <div>
          <div className="text-xs font-mono text-white/40">{promptHash.slice(0, 16)}...</div>
          <a href="/how-it-works" className="text-xs text-white font-medium mt-0.5 hover:underline">
            How it works →
          </a>
        </div>
      </div>
    </div>
  );
}
