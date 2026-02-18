import { createContext, useCallback, useState, type ReactNode } from "react";
import { getAccountId } from "@/near/wallet-account";

interface WalletContextType {
  accountId: string | null;
  isConnected: boolean;
  isWalletLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType>({
  accountId: null,
  isConnected: false,
  isWalletLoading: false,
  connect: async () => {},
  disconnect: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(() => getAccountId());
  const [isWalletLoading, setIsWalletLoading] = useState(false);

  const connect = useCallback(async () => {
    setIsWalletLoading(true);
    try {
      const { connectWallet } = await import("@/near/wallet");
      const id = await connectWallet();
      if (id) setAccountId(id);
    } finally {
      setIsWalletLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setIsWalletLoading(true);
    try {
      const { disconnectWallet } = await import("@/near/wallet");
      await disconnectWallet();
      setAccountId(null);
    } finally {
      setIsWalletLoading(false);
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        accountId,
        isConnected: !!accountId,
        isWalletLoading,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
