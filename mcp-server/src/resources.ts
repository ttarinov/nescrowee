import { viewMethod } from "./near.js";

export interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export function listResources(): Resource[] {
  return [
    {
      uri: "nescrowee://contract/{contract_id}",
      name: "Escrow Contract",
      description: "Full escrow contract state including milestones, disputes, and funding status.",
      mimeType: "application/json",
    },
    {
      uri: "nescrowee://dispute/{contract_id}/{milestone_id}",
      name: "Dispute",
      description: "Dispute information and AI resolution for a specific milestone.",
      mimeType: "application/json",
    },
    {
      uri: "nescrowee://contracts/{account_id}",
      name: "Account Contracts",
      description: "All escrow contracts where the account is client or freelancer.",
      mimeType: "application/json",
    },
  ];
}

export async function readResource(uri: string): Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> {
  const contractMatch = uri.match(/^nescrowee:\/\/contract\/(.+)$/);
  if (contractMatch) {
    const contractId = contractMatch[1];
    const data = await viewMethod("get_contract", { contract_id: contractId });
    return {
      contents: [{ uri, mimeType: "application/json", text: JSON.stringify(data, null, 2) }],
    };
  }

  const disputeMatch = uri.match(/^nescrowee:\/\/dispute\/([^/]+)\/(.+)$/);
  if (disputeMatch) {
    const [, contractId, milestoneId] = disputeMatch;
    const data = await viewMethod("get_dispute", { contract_id: contractId, milestone_id: milestoneId });
    return {
      contents: [{ uri, mimeType: "application/json", text: JSON.stringify(data, null, 2) }],
    };
  }

  const accountMatch = uri.match(/^nescrowee:\/\/contracts\/(.+)$/);
  if (accountMatch) {
    const accountId = accountMatch[1];
    const data = await viewMethod("get_contracts_by_account", { account_id: accountId });
    return {
      contents: [{ uri, mimeType: "application/json", text: JSON.stringify(data, null, 2) }],
    };
  }

  throw new Error(`Unknown resource URI: ${uri}`);
}
