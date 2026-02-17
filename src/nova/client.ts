const PROXY_URL = "/api/nova-proxy";

async function novaCall<T>(action: string, params: Record<string, unknown>): Promise<T> {
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...params }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Nova ${action} failed`);
  return data as T;
}

function getGroupName(contractId: string): string {
  return `nescrowee-${contractId}`;
}

const NOVA_NETWORK = import.meta.env.VITE_NEAR_NETWORK || "testnet";

function getNovaAccountId(nearAccountId: string): string {
  return NOVA_NETWORK === "testnet"
    ? `${nearAccountId.replace(".testnet", "")}.nova-sdk-6.testnet`
    : `${nearAccountId.replace(".near", "")}.nova-sdk.near`;
}

export async function createEvidenceVault(
  nearAccountId: string,
  contractId: string,
): Promise<string> {
  const result = await novaCall<{ groupName: string }>("registerGroup", {
    nearAccountId,
    contractId,
  });
  return result.groupName;
}

export async function addVaultMember(
  ownerAccountId: string,
  contractId: string,
  memberNearAccountId: string,
): Promise<void> {
  await novaCall("addMember", { ownerAccountId, contractId, memberNearAccountId });
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
  const base64 = btoa(
    new Uint8Array(fileData).reduce((s, b) => s + String.fromCharCode(b), ""),
  );
  return novaCall<UploadResult>("upload", {
    nearAccountId,
    contractId,
    fileData: base64,
    fileName,
  });
}

export async function retrieveEvidence(
  nearAccountId: string,
  contractId: string,
  cid: string,
): Promise<Uint8Array> {
  const { data } = await novaCall<{ data: string }>("retrieve", {
    nearAccountId,
    contractId,
    cid,
  });
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function isVaultMember(
  nearAccountId: string,
  contractId: string,
): Promise<boolean> {
  const { authorized } = await novaCall<{ authorized: boolean }>("isAuthorized", {
    nearAccountId,
    contractId,
  });
  return authorized;
}

export { getGroupName, getNovaAccountId };
