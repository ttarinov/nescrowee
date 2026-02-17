const ERROR_MESSAGES: Record<string, string> = {
  "User rejected": "Transaction cancelled",
  "user reject": "Transaction cancelled",
  "User denied": "Transaction cancelled",
  "user cancel": "Transaction cancelled",
  "wallet not connected": "Please connect your wallet first",
  "insufficient funds": "Insufficient NEAR balance",
  "NotEnoughBalance": "Insufficient NEAR balance",
  "not enough balance": "Insufficient NEAR balance",
  "GasExceeded": "Transaction ran out of gas — try again",
  "Expired": "Transaction expired — try again",
};

export function formatWalletError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  for (const [pattern, friendly] of Object.entries(ERROR_MESSAGES)) {
    if (raw.toLowerCase().includes(pattern.toLowerCase())) return friendly;
  }
  if (raw.length > 120) return raw.slice(0, 117) + "...";
  return raw;
}
