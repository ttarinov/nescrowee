import { HugeiconsIcon } from "@hugeicons/react";
import { LockIcon } from "@hugeicons/core-free-icons";

export function AiProcessingIndicator() {
  return (
    <div className="flex justify-center py-3">
      <div className="px-4 py-2 rounded-full bg-primary/5 border border-primary/20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <p className="text-xs font-mono text-primary">
          AI analyzing dispute...
        </p>
        <span className="flex items-center gap-1 text-[10px] font-mono text-success">
          <HugeiconsIcon icon={LockIcon} size={10} />
          TEE
        </span>
      </div>
    </div>
  );
}
