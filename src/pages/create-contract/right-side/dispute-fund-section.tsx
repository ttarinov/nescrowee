import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InformationCircleIcon,
  Wallet01Icon,
  Shield01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { DISPUTE_FUND_MIN, DISPUTE_FUND_MAX } from "../utils";
import { AiModelSelector } from "./ai-model-selector";
import type { ModelId } from "../types";

interface DisputeFundSectionProps {
  value: string;
  isValid: boolean;
  onChange: (value: string) => void;
  selectedModel: ModelId;
  selectedModelName: string;
  aiModelPopoverOpen: boolean;
  onAiModelPopoverOpenChange: (open: boolean) => void;
  onSelectModel: (modelId: ModelId) => void;
  promptHash: string;
}

function DisputeFundInfoPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-1 rounded-full text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label="About Dispute Fund"
        >
          <HugeiconsIcon icon={InformationCircleIcon} size={18} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-80 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-0 overflow-hidden shadow-2xl"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Wallet01Icon} size={18} className="text-white/90" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">From each milestone</p>
              <p className="text-xs text-white/60">
                A percentage is reserved from every funded milestone into the dispute fund.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Shield01Icon} size={18} className="text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">TEE-verified AI</p>
              <p className="text-xs text-white/60">
                The fund pays for the AI investigation if a dispute is raised. Runs in trusted hardware.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={UserIcon} size={18} className="text-white/90" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Leftover to freelancer</p>
              <p className="text-xs text-white/60">
                Any unused dispute fund from a milestone goes back to the freelancer.
              </p>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-white/10 bg-white/5">
          <p className="text-[10px] text-white/50">
            Choose {DISPUTE_FUND_MIN}–{DISPUTE_FUND_MAX}% per milestone. Higher % = more coverage for disputes.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DisputeFundSection({
  value,
  isValid,
  onChange,
  selectedModel,
  selectedModelName,
  aiModelPopoverOpen,
  onAiModelPopoverOpenChange,
  onSelectModel,
  promptHash,
}: DisputeFundSectionProps) {
  return (
    <div>
      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white">Dispute Fund</h3>
          <DisputeFundInfoPopover />
        </div>
        <div className="flex items-center gap-0 shrink-0 text-2xl text-white/60">
          {[5, 10, 15].map((pctVal, i) => (
            <span key={pctVal} className="flex items-center gap-0">
              {i > 0 && <span className="px-0.5">/</span>}
              <button
                type="button"
                onClick={() => onChange(String(pctVal))}
                className={`transition-colors hover:text-white/80 ${value === String(pctVal) ? "text-white font-semibold" : ""}`}
              >
                {pctVal}%
              </button>
            </span>
          ))}
        </div>
      </div>
      {!isValid && value && (
        <p className="text-[10px] text-red-400 text-left mb-2">
          Minimum {DISPUTE_FUND_MIN}%, maximum {DISPUTE_FUND_MAX}%
        </p>
      )}
      <div className="pt-4 border-t border-white/12">
        <AiModelSelector
          selectedModel={selectedModel}
          selectedModelName={selectedModelName}
          popoverOpen={aiModelPopoverOpen}
          onPopoverOpenChange={onAiModelPopoverOpenChange}
          onSelect={onSelectModel}
        />
      </div>
      {promptHash && (
        <div className="pt-4 mt-4 border-t border-white/12">
          <div className="text-[10px] font-mono text-white/40">{promptHash.slice(0, 44)}...</div>
          <Link to="/how-it-works" className="text-xs text-white font-medium mt-0.5 hover:underline inline-block">
            How it works →
          </Link>
        </div>
      )}
    </div>
  );
}
