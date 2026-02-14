import { createContext, useCallback, useState, type ReactNode } from "react";
import { connectWallet, disconnectWallet, getAccountId } from "@/near/wallet";

interface WalletContextType {
  accountId: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType>({
  accountId: null,
  isConnected: false,
  connect: async () => {},
  disconnect: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(() => getAccountId());

  const connect = useCallback(async () => {
    const id = await connectWallet();
    if (id) setAccountId(id);
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    setAccountId(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        accountId,
        isConnected: !!accountId,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
