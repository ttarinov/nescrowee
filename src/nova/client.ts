import { NovaSdk } from "nova-sdk-js";

const NOVA_API_KEY = import.meta.env.VITE_NOVA_API_KEY || "";
const NOVA_NETWORK = import.meta.env.VITE_NEAR_NETWORK || "testnet";

const TESTNET_CONFIG = {
  rpcUrl: "https://rpc.testnet.near.org",
  contractId: "nova-sdk-6.testnet",
} as const;

function getNovaAccountId(nearAccountId: string): string {
  return NOVA_NETWORK === "testnet"
    ? `${nearAccountId.replace(".testnet", "")}.nova-sdk-6.testnet`
    : `${nearAccountId.replace(".near", "")}.nova-sdk.near`;
}

function getGroupName(contractId: string): string {
  return `nescrowee-${contractId}`;
}

function createSdk(nearAccountId: string): NovaSdk {
  const novaAccount = getNovaAccountId(nearAccountId);
  const options: Record<string, unknown> = { apiKey: NOVA_API_KEY };

  if (NOVA_NETWORK === "testnet") {
    options.rpcUrl = TESTNET_CONFIG.rpcUrl;
    options.contractId = TESTNET_CONFIG.contractId;
  }

  return new NovaSdk(novaAccount, options);
}

export async function createEvidenceVault(
  nearAccountId: string,
  contractId: string,
): Promise<string> {
  const sdk = createSdk(nearAccountId);
  const groupName = getGroupName(contractId);
  await sdk.registerGroup(groupName);
  return groupName;
}

export async function addVaultMember(
  ownerAccountId: string,
  contractId: string,
  memberNearAccountId: string,
): Promise<void> {
  const sdk = createSdk(ownerAccountId);
  const groupName = getGroupName(contractId);
  const memberNovaId = getNovaAccountId(memberNearAccountId);
  await sdk.addGroupMember(groupName, memberNovaId);
}

export interface UploadResult {
  cid: string;
  fileHash: string;
  transactionId: string;
}

export async function uploadEvidence(
  nearAccountId: string,
  contractId: string,
  fileData: ArrayBuffer,
  fileName: string,
): Promise<UploadResult> {
  const sdk = createSdk(nearAccountId);
  const groupName = getGroupName(contractId);
  const buffer = Buffer.from(fileData);
  const result = await sdk.upload(groupName, buffer, fileName);
  return {
    cid: result.cid,
    fileHash: result.file_hash,
    transactionId: result.trans_id,
  };
}

export async function retrieveEvidence(
  nearAccountId: string,
  contractId: string,
  cid: string,
): Promise<Buffer> {
  const sdk = createSdk(nearAccountId);
  const groupName = getGroupName(contractId);
  const { data } = await sdk.retrieve(groupName, cid);
  return data;
}

export async function isVaultMember(
  nearAccountId: string,
  contractId: string,
): Promise<boolean> {
  const sdk = createSdk(nearAccountId);
  const groupName = getGroupName(contractId);
  try {
    return await sdk.isAuthorized(groupName);
  } catch {
    return false;
  }
}

export { getGroupName, getNovaAccountId };
