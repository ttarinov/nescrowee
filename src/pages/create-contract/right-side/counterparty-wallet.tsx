import type { UserRole } from "../types";

type CounterpartyStatus = "idle" | "checking" | "valid" | "invalid" | "bad-format";

interface CounterpartyWalletProps {
  value: string;
  status: CounterpartyStatus;
  onChange: (value: string) => void;
  userRole: UserRole;
}

export function CounterpartyWallet({ value, status, onChange, userRole }: CounterpartyWalletProps) {
  const placeholder =
    userRole === "client"
      ? "freelancer's wallet or empty to generate a link"
      : "client's wallet or empty to generate a link";

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-colors font-mono text-sm border-0"
      />
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
    </div>
  );
}
