import { RoleSelector } from "./RoleSelector";
import { CounterpartyWallet } from "./CounterpartyWallet";
import { DisputeFundSection } from "./DisputeFundSection";
import { AiModelSelector } from "./AiModelSelector";
import { PromptHashCard } from "./PromptHashCard";
import { SummaryAndSubmit } from "./SummaryAndSubmit";
import type { UserRole } from "../types";
import type { ModelId } from "../types";

type CounterpartyStatus = "idle" | "checking" | "valid" | "invalid" | "bad-format";

interface RightSideProps {
  userRole: UserRole;
  onUserRoleChange: (role: UserRole) => void;
  counterpartyAddress: string;
  counterpartyStatus: CounterpartyStatus;
  onCounterpartyChange: (value: string) => void;
  disputeFundPct: string;
  disputeFundValid: boolean;
  onDisputeFundChange: (value: string) => void;
  selectedModel: ModelId;
  selectedModelName: string;
  aiModelPopoverOpen: boolean;
  onAiModelPopoverOpenChange: (open: boolean) => void;
  onSelectModel: (modelId: ModelId) => void;
  promptHash: string;
  totalNear: number;
  totalUsd: number | null;
  disputeFundNear: number;
  milestonesCount: number;
  createPending: boolean;
  submitDisabled: boolean;
}

export function RightSide({
  userRole,
  onUserRoleChange,
  counterpartyAddress,
  counterpartyStatus,
  onCounterpartyChange,
  disputeFundPct,
  disputeFundValid,
  onDisputeFundChange,
  selectedModel,
  selectedModelName,
  aiModelPopoverOpen,
  onAiModelPopoverOpenChange,
  onSelectModel,
  promptHash,
  totalNear,
  totalUsd,
  disputeFundNear,
  milestonesCount,
  createPending,
  submitDisabled,
}: RightSideProps) {
  const pct = parseInt(disputeFundPct) || 0;
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col font-sans text-white relative overflow-hidden rounded-[40px] shadow-2xl border border-white/20 bg-black/40 backdrop-blur-2xl">
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-50px] right-[-50px] w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 relative z-10">
        <RoleSelector value={userRole} onChange={onUserRoleChange} />
        <CounterpartyWallet
          value={counterpartyAddress}
          status={counterpartyStatus}
          onChange={onCounterpartyChange}
        />
        <DisputeFundSection
          value={disputeFundPct}
          isValid={disputeFundValid}
          onChange={onDisputeFundChange}
        />
        <AiModelSelector
          selectedModel={selectedModel}
          selectedModelName={selectedModelName}
          popoverOpen={aiModelPopoverOpen}
          onPopoverOpenChange={onAiModelPopoverOpenChange}
          onSelect={onSelectModel}
        />
        <PromptHashCard promptHash={promptHash} />
      </div>
      <SummaryAndSubmit
        totalNear={totalNear}
        totalUsd={totalUsd}
        disputeFundPct={pct}
        disputeFundNear={disputeFundNear}
        aiModelName={selectedModelName}
        milestonesCount={milestonesCount}
        hasCounterparty={!!counterpartyAddress}
        isPending={createPending}
        submitDisabled={submitDisabled}
      />
    </div>
  );
}

export { RoleSelector } from "./RoleSelector";
export { CounterpartyWallet } from "./CounterpartyWallet";
export { DisputeFundSection } from "./DisputeFundSection";
export { AiModelSelector } from "./AiModelSelector";
export { PromptHashCard } from "./PromptHashCard";
export { SummaryAndSubmit } from "./SummaryAndSubmit";
