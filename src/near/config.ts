const NETWORK = import.meta.env.VITE_NEAR_NETWORK || "testnet";

const configs = {
  testnet: {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://testnet.mynearwallet.com",
    contractId: "nescrowee.testnet",
    socialDbContract: "v1.social08.testnet",
    explorerUrl: "https://testnet.nearblocks.io",
  },
  mainnet: {
    networkId: "mainnet",
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://app.mynearwallet.com",
    contractId: "nescrowee.near",
    socialDbContract: "social.near",
    explorerUrl: "https://nearblocks.io",
  },
} as const;

export const nearConfig = configs[NETWORK as keyof typeof configs] || configs.testnet;

export const hotPayItemId = import.meta.env.VITE_HOT_PAY_ITEM_ID || "";
export const hotPayCheckoutBase = "https://pay.hot-labs.org/payment";
