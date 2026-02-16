import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

type CounterpartyStatus = "idle" | "checking" | "valid" | "invalid" | "bad-format";

interface CounterpartyWalletProps {
  value: string;
  status: CounterpartyStatus;
  onChange: (value: string) => void;
}

export function CounterpartyWallet({ value, status, onChange }: CounterpartyWalletProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white/60 ml-2">Freelancer wallet (optional)</label>
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="alice.near or leave empty → invite link"
          className={`relative w-full bg-white/5 border rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)] font-mono text-sm ${
            status === "valid"
              ? "border-green-500/50"
              : status === "invalid" || status === "bad-format"
                ? "border-red-500/50"
                : "border-white/10"
          }`}
        />
      </div>
      {status === "bad-format" && (
        <p className="text-xs text-red-400 ml-2">Use format: alice.near / alice.testnet</p>
      )}
      {status === "invalid" && (
        <p className="text-xs text-red-400 ml-2">
          Account not found on {import.meta.env.VITE_NEAR_NETWORK || "testnet"}
        </p>
      )}
      {status === "valid" && (
        <p className="text-xs text-green-400 ml-2">Account verified on-chain ✓</p>
      )}
      {status === "idle" && (
        <p className="text-xs text-white/40 ml-2 flex items-center gap-1">
          <HugeiconsIcon icon={InformationCircleIcon} size={12} /> Leave empty to generate an invite
          link instead
        </p>
      )}
    </div>
  );
}
