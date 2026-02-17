export interface ApiMethodData {
  name: string;
  type: "view" | "change";
  description: string;
  parameters: Array<{ name: string; type: string; description: string; required?: boolean }>;
  returns?: string;
  example?: string;
}

export const VIEW_METHODS: ApiMethodData[] = [
  {
    name: "get_contract",
    type: "view",
    description: "Retrieve a contract by its ID. Returns the full contract state including milestones, disputes, and funding status.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID (e.g., 'c1', 'c2')", required: true },
    ],
    returns: "EscrowContract | null",
    example: `const contract = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_contract",
  args: { contract_id: "c1" }
});`,
  },
  {
    name: "get_contracts_by_account",
    type: "view",
    description: "Get all contracts associated with a specific NEAR account (as client or freelancer).",
    parameters: [
      { name: "account_id", type: "string", description: "NEAR account ID (e.g., 'alice.testnet')", required: true },
    ],
    returns: "EscrowContract[]",
    example: `const contracts = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_contracts_by_account",
  args: { account_id: "alice.testnet" }
});`,
  },
  {
    name: "get_dispute",
    type: "view",
    description: "Get dispute information for a specific milestone.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "milestone_id", type: "string", description: "The milestone ID (e.g., 'm1', 'm2')", required: true },
    ],
    returns: "Dispute | null",
    example: `const dispute = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_dispute",
  args: { contract_id: "c1", milestone_id: "m1" }
});`,
  },
  {
    name: "get_prompt_hash",
    type: "view",
    description: "Get the SHA-256 hash of the AI prompt used for dispute resolution. Used to verify prompt integrity.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
    ],
    returns: "string | null",
    example: `const promptHash = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_prompt_hash",
  args: { contract_id: "c1" }
});`,
  },
  {
    name: "get_ai_processing_fee",
    type: "view",
    description: "Get the current AI processing fee in yoctoNEAR. This fee is deducted from the security pool when a dispute is resolved.",
    parameters: [],
    returns: "string (yoctoNEAR)",
    example: `const fee = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_ai_processing_fee",
  args: {}
});`,
  },
  {
    name: "get_trusted_tee_addresses",
    type: "view",
    description: "Get the list of trusted TEE signing addresses. Only resolutions signed by these addresses are accepted.",
    parameters: [],
    returns: "Vec<Vec<u8>>",
    example: `const addresses = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_trusted_tee_addresses",
  args: {}
});`,
  },
];

export const CHANGE_METHODS: ApiMethodData[] = [
  {
    name: "create_contract",
    type: "change",
    description: "Create a new escrow contract. The caller becomes the client. Returns the contract ID.",
    parameters: [
      { name: "title", type: "string", description: "Contract title", required: true },
      { name: "description", type: "string", description: "Contract description", required: true },
      { name: "milestones", type: "MilestoneInput[]", description: "Array of milestones with title, description, and amount (in yoctoNEAR)", required: true },
      { name: "freelancer", type: "string | null", description: "Optional freelancer account ID. If null, contract is in Draft status until joined.", required: false },
      { name: "security_deposit_pct", type: "u8", description: "Security deposit percentage (5-30%). Used to cover AI dispute costs.", required: true },
      { name: "prompt_hash", type: "string", description: "SHA-256 hash of the AI prompt used for disputes", required: true },
      { name: "model_id", type: "string", description: "AI model ID for dispute resolution (e.g., 'Qwen/Qwen3-30B-A3B')", required: true },
    ],
    returns: "string (contract_id)",
    example: `const contractId = await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "create_contract",
  args: {
    title: "Website Development",
    description: "Build a landing page",
    milestones: [
      {
        title: "Design",
        description: "Create mockups",
        amount: "5000000000000000000000000" // 5 NEAR in yoctoNEAR
      }
    ],
    freelancer: "bob.testnet",
    security_deposit_pct: 10,
    prompt_hash: "abc123...",
    model_id: "Qwen/Qwen3-30B-A3B"
  },
  gas: "300000000000000"
});`,
  },
  {
    name: "join_contract",
    type: "change",
    description: "Join a contract as freelancer using an invite token. Only works for Draft contracts.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "invite_token", type: "string", description: "Invite token from contract creation", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "join_contract",
  args: {
    contract_id: "c1",
    invite_token: "abc123def456"
  },
  gas: "300000000000000"
});`,
  },
  {
    name: "fund_contract",
    type: "change",
    description: "Fund a contract. Attach NEAR as deposit. Funds are split into main pool and security pool based on security_deposit_pct.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "fund_contract",
  args: { contract_id: "c1" },
  gas: "300000000000000",
  attachedDeposit: "11000000000000000000000000" // 11 NEAR (10 + 10% security)
});`,
  },
  {
    name: "start_milestone",
    type: "change",
    description: "Start working on a milestone. Only the freelancer can call this. Changes status from Funded to InProgress.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "milestone_id", type: "string", description: "The milestone ID", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "start_milestone",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`,
  },
  {
    name: "request_payment",
    type: "change",
    description: "Request payment for a completed milestone. Sets 48-hour deadline for client approval. Only freelancer can call.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "milestone_id", type: "string", description: "The milestone ID", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "request_payment",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`,
  },
  {
    name: "cancel_payment_request",
    type: "change",
    description: "Cancel a payment request and return milestone to InProgress status. Only freelancer can call.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "milestone_id", type: "string", description: "The milestone ID", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "cancel_payment_request",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`,
  },
  {
    name: "approve_milestone",
    type: "change",
    description: "Approve a milestone and release payment to freelancer. Only client can call. Milestone must be in SubmittedForReview status.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "milestone_id", type: "string", description: "The milestone ID", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "approve_milestone",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`,
  },
  {
    name: "auto_approve_payment",
    type: "change",
    description: "Auto-approve payment after 48-hour deadline expires. Anyone can call this. Pays freelancer automatically.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "milestone_id", type: "string", description: "The milestone ID", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "auto_approve_payment",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`,
  },
  {
    name: "raise_dispute",
    type: "change",
    description: "Raise a dispute on a milestone. Only client can call. Requires sufficient security pool for AI fee. Milestone must be in SubmittedForReview status.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "milestone_id", type: "string", description: "The milestone ID", required: true },
      { name: "reason", type: "string", description: "Reason for dispute", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "raise_dispute",
  args: {
    contract_id: "c1",
    milestone_id: "m1",
    reason: "Work does not meet requirements"
  },
  gas: "300000000000000"
});`,
  },
  {
    name: "submit_ai_resolution",
    type: "change",
    description: "Submit AI resolution for a dispute. Verifies Ed25519 TEE signature on-chain. Only resolutions from trusted TEE addresses are accepted.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "milestone_id", type: "string", description: "The milestone ID", required: true },
      { name: "resolution", type: "Resolution", description: "Resolution type: Freelancer | Client | ContinueWork | Split { freelancer_pct: u8 }", required: true },
      { name: "explanation", type: "string", description: "AI explanation of the resolution", required: true },
      { name: "signature", type: "Vec<u8>", description: "Ed25519 signature from TEE", required: true },
      { name: "signing_address", type: "Vec<u8>", description: "Ed25519 public key of TEE signer", required: true },
      { name: "tee_text", type: "string", description: "The text that was signed", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "submit_ai_resolution",
  args: {
    contract_id: "c1",
    milestone_id: "m1",
    resolution: { Freelancer: {} },
    explanation: "Work meets requirements...",
    signature: [/* Ed25519 signature bytes */],
    signing_address: [/* TEE public key bytes */],
    tee_text: "Resolution: Freelancer..."
  },
  gas: "300000000000000"
});`,
  },
  {
    name: "accept_resolution",
    type: "change",
    description: "Accept an AI resolution early (before 48-hour deadline). Either party can accept. Immediately finalizes the resolution.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "milestone_id", type: "string", description: "The milestone ID", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "accept_resolution",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`,
  },
  {
    name: "finalize_resolution",
    type: "change",
    description: "Finalize a resolution after 48-hour deadline expires. Anyone can call this.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "milestone_id", type: "string", description: "The milestone ID", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "finalize_resolution",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`,
  },
  {
    name: "release_dispute_funds",
    type: "change",
    description: "Release funds according to finalized resolution. Transfers NEAR to freelancer, client, or both based on resolution type.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
      { name: "milestone_id", type: "string", description: "The milestone ID", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "release_dispute_funds",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`,
  },
  {
    name: "complete_contract_security",
    type: "change",
    description: "Release remaining security pool to freelancer after all milestones are completed. Anyone can call.",
    parameters: [
      { name: "contract_id", type: "string", description: "The contract ID", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "complete_contract_security",
  args: { contract_id: "c1" },
  gas: "300000000000000"
});`,
  },
];

export const OWNER_METHODS: ApiMethodData[] = [
  {
    name: "register_tee_address",
    type: "change",
    description: "Register a trusted TEE signing address. Only owner can call.",
    parameters: [
      { name: "address", type: "Vec<u8>", description: "Ed25519 public key bytes from TEE attestation", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "register_tee_address",
  args: { address: [/* TEE public key bytes */] },
  gas: "300000000000000"
});`,
  },
  {
    name: "remove_tee_address",
    type: "change",
    description: "Remove a trusted TEE signing address. Only owner can call.",
    parameters: [
      { name: "address", type: "Vec<u8>", description: "Ed25519 public key bytes to remove", required: true },
    ],
    returns: "void",
  },
  {
    name: "set_ai_processing_fee",
    type: "change",
    description: "Set the AI processing fee in yoctoNEAR. Deducted from security pool per dispute.",
    parameters: [
      { name: "fee_yoctonear", type: "u128", description: "Fee in yoctoNEAR (1 NEAR = 10^24 yoctoNEAR)", required: true },
    ],
    returns: "void",
    example: `await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "set_ai_processing_fee",
  args: { fee_yoctonear: "50000000000000000000000" }, // 0.05 NEAR
  gas: "300000000000000"
});`,
  },
];
