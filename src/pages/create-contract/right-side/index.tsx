import { Link } from "react-router-dom";
import { RoleSelector } from "./role-selector";
import { CounterpartyWallet } from "./counterparty-wallet";
import { DisputeFundSection } from "./dispute-fund-section";
import { SummaryAndSubmit } from "./summary-and-submit";
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
  createPending,
  submitDisabled,
}: RightSideProps) {
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col h-full min-h-0">
      <div className="flex flex-col flex-1 min-h-0 font-sans text-white relative overflow-hidden rounded-[40px] shadow-2xl bg-black/40 backdrop-blur-2xl">
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[-50px] w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-8 space-y-4 relative z-10">
          <RoleSelector value={userRole} onChange={onUserRoleChange} />
          <CounterpartyWallet
            value={counterpartyAddress}
            status={counterpartyStatus}
            onChange={onCounterpartyChange}
            userRole={userRole}
          />
          <DisputeFundSection
            value={disputeFundPct}
            isValid={disputeFundValid}
            onChange={onDisputeFundChange}
            selectedModel={selectedModel}
            selectedModelName={selectedModelName}
            aiModelPopoverOpen={aiModelPopoverOpen}
            onAiModelPopoverOpenChange={onAiModelPopoverOpenChange}
            onSelectModel={onSelectModel}
            promptHash={promptHash}
          />
        </div>
      <SummaryAndSubmit
        totalNear={totalNear}
        isPending={createPending}
        submitDisabled={submitDisabled}
      />
      </div>
      <p className="text-[10px] text-white/40 mt-2 text-center">
        Gas ~0.001 USDC/action, paid by your wallet.{" "}
        <Link to="/how-it-works" className="text-white/60 hover:text-white underline">
          Read more
        </Link>
      </p>
    </div>
  );
}

export { RoleSelector } from "./role-selector";
export { CounterpartyWallet } from "./counterparty-wallet";
export { DisputeFundSection } from "./dispute-fund-section";
export { AiModelSelector } from "./ai-model-selector";
export { PromptHashCard } from "./prompt-hash-card";
export { SummaryAndSubmit } from "./summary-and-submit";
