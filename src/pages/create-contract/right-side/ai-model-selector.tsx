import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Shield01Icon, CpuIcon, BulbIcon } from "@hugeicons/core-free-icons";
import { AI_MODELS } from "@/types/ai";
import { MODEL_COST_LABEL } from "../utils";
import type { ModelId } from "../types";

interface AiModelSelectorProps {
  selectedModel: ModelId;
  selectedModelName: string;
  popoverOpen: boolean;
  onPopoverOpenChange: (open: boolean) => void;
  onSelect: (modelId: ModelId) => void;
}

const MAX_LEVEL = 5;

function IntelligenceBulbs({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Intelligence: ${count} of ${MAX_LEVEL}`}>
      {Array.from({ length: MAX_LEVEL }, (_, i) => (
        <HugeiconsIcon
          key={i}
          icon={BulbIcon}
          size={10}
          className={i < count ? "text-purple-400" : "text-purple-400/25"}
        />
      ))}
    </span>
  );
}

export function AiModelSelector({
  selectedModel,
  selectedModelName,
  popoverOpen,
  onPopoverOpenChange,
  onSelect,
}: AiModelSelectorProps) {
  const selectedCost = MODEL_COST_LABEL[selectedModel];
  return (
    <div className="space-y-4">
      <div className="ml-2">
        <Popover open={popoverOpen} onOpenChange={onPopoverOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-2 py-2 px-2 -mx-2 rounded-xl text-left transition-colors hover:bg-white/5"
            >
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-950">
                    <HugeiconsIcon icon={CpuIcon} size={14} className="text-white" />
                  </span>
                  <span className="bg-gradient-to-r from-purple-400 to-purple-950 bg-clip-text text-transparent">
                    AI Dispute Model
                  </span>
                </h3>
                <p className="text-sm text-white/60 mt-0.5">{selectedModelName}</p>
                {selectedCost && (
                  <p className="text-[10px] text-white/40 mt-0.5">{selectedCost}</p>
                )}
              </div>
              <HugeiconsIcon icon={ArrowDown01Icon} size={20} className="text-white/50 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] rounded-2xl border-white/10 bg-card p-2"
            align="start"
          >
            <p className="text-xs text-muted-foreground px-2 py-1 mb-2">
              Standard disputes: 2 rounds. Appeals use DeepSeek V3.1.
            </p>
            <div className="space-y-1">
              {AI_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                const costLabel = MODEL_COST_LABEL[model.id];
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onSelect(model.id);
                      onPopoverOpenChange(false);
                    }}
                    className={`w-full flex justify-between items-start p-3 rounded-xl text-left transition-all ${isSelected ? "bg-primary/20 text-primary" : "hover:bg-muted"}`}
                  >
                    <div className="min-w-0">
                      <span className="font-medium block">{model.name}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <IntelligenceBulbs count={model.stars} />
                        <span>{model.speed}</span>
                        <span>{costLabel ?? "—"}</span>
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 px-2 flex items-center gap-1">
              <HugeiconsIcon icon={Shield01Icon} size={10} /> TEE — signatures verified on-chain.
            </p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
