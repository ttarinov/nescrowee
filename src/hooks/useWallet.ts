import { useContext } from "react";
import { WalletContext } from "@/contexts/wallet-context";

export function useWallet() {
  return useContext(WalletContext);
}
