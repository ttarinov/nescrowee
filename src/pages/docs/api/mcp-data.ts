export const MCP_TOOLS = [
  { name: "create_contract", description: "Create a new escrow contract. Returns the contract ID." },
  { name: "fund_contract", description: "Fund a contract with NEAR. Attach NEAR as deposit." },
  { name: "get_contract", description: "Get contract state including milestones, disputes, and funding status." },
  { name: "start_milestone", description: "Start working on a milestone. Only freelancer can call." },
  { name: "request_payment", description: "Request payment for a completed milestone. Sets 48-hour deadline." },
  { name: "approve_milestone", description: "Approve a milestone and release payment. Only client can call." },
  { name: "raise_dispute", description: "Raise a dispute on a milestone. Only client can call." },
  { name: "get_dispute", description: "Get dispute information for a milestone." },
];

export const MCP_RESOURCES = [
  {
    title: "contract:{contract_id}",
    description: "Get full contract state including milestones, disputes, and funding status.",
    uri: "contract",
    example: `{
  "uri": "nescrowee://contract/c1",
  "name": "Contract c1",
  "description": "Full contract state",
  "mimeType": "application/json"
}`,
  },
  {
    title: "dispute:{contract_id}:{milestone_id}",
    description: "Get dispute information for a specific milestone.",
    uri: "dispute",
    example: `{
  "uri": "nescrowee://dispute/c1/m1",
  "name": "Dispute for milestone m1",
  "description": "Dispute details and resolution",
  "mimeType": "application/json"
}`,
  },
  {
    title: "contracts:{account_id}",
    description: "List all contracts for an account.",
    uri: "contracts",
    example: `{
  "uri": "nescrowee://contracts/alice.testnet",
  "name": "Contracts for alice.testnet",
  "description": "All contracts where account is client or freelancer",
  "mimeType": "application/json"
}`,
  },
];
