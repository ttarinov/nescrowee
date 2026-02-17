import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { ApiMethodCard } from "../components/api-method-card";
import { CodeBlock } from "../components/code-block";
import OnThisPageSidebar from "../on-this-page-sidebar";

const ApiDocsPage = () => {
  return (
    <div className="bg-background min-h-screen">
      <OnThisPageSidebar />
      <div className="max-w-7xl mx-auto px-4 py-16 pt-32 space-y-24 lg:pl-56 xl:pl-64">
        <Link
          to="/docs"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-8"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          <span>Back to Documentation</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-2">API Reference</h2>
            <p className="text-lg text-gray-400 mb-6">
              Complete reference for all Nescrowee smart contract methods. All methods can be called directly against the NEAR smart contract.
            </p>
            <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4">
              <p className="text-sm text-yellow-200">
                <strong>Note:</strong> This documentation describes existing smart contract methods. No separate API server is required—call these methods directly on the NEAR blockchain.
              </p>
            </div>
          </div>

          <section id="authentication" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Authentication</h2>
            <p className="text-gray-300 mb-6">
              All change methods require authentication via NEAR wallet. View methods can be called without authentication. Use HOT Wallet SDK or near-api-js for wallet integration.
            </p>
            <CodeBlock
              code={`import { connect, keyStores, KeyPair } from "near-api-js";

const keyStore = new keyStores.InMemoryKeyStore();
await keyStore.setKey("testnet", "your-account.testnet", KeyPair.fromString("ed25519:..."));

const near = await connect({
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  keyStore,
});

const account = await near.account("your-account.testnet");`}
              language="typescript"
              title="NEAR Wallet Connection"
            />
          </section>

          <section id="view-methods" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">View Methods</h2>
            <p className="text-gray-300 mb-6">
              View methods don't modify state and can be called without authentication.
            </p>

            <div className="space-y-6">
              <ApiMethodCard
                name="get_contract"
                type="view"
                description="Retrieve a contract by its ID. Returns the full contract state including milestones, disputes, and funding status."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID (e.g., 'c1', 'c2')",
                    required: true,
                  },
                ]}
                returns="EscrowContract | null"
                example={`const contract = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_contract",
  args: { contract_id: "c1" }
});`}
              />

              <ApiMethodCard
                name="get_contracts_by_account"
                type="view"
                description="Get all contracts associated with a specific NEAR account (as client or freelancer)."
                parameters={[
                  {
                    name: "account_id",
                    type: "string",
                    description: "NEAR account ID (e.g., 'alice.testnet')",
                    required: true,
                  },
                ]}
                returns="EscrowContract[]"
                example={`const contracts = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_contracts_by_account",
  args: { account_id: "alice.testnet" }
});`}
              />

              <ApiMethodCard
                name="get_dispute"
                type="view"
                description="Get dispute information for a specific milestone."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "milestone_id",
                    type: "string",
                    description: "The milestone ID (e.g., 'm1', 'm2')",
                    required: true,
                  },
                ]}
                returns="Dispute | null"
                example={`const dispute = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_dispute",
  args: { contract_id: "c1", milestone_id: "m1" }
});`}
              />

              <ApiMethodCard
                name="get_prompt_hash"
                type="view"
                description="Get the SHA-256 hash of the AI prompt used for dispute resolution. Used to verify prompt integrity."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                ]}
                returns="string | null"
                example={`const promptHash = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_prompt_hash",
  args: { contract_id: "c1" }
});`}
              />

              <ApiMethodCard
                name="get_ai_processing_fee"
                type="view"
                description="Get the current AI processing fee in yoctoNEAR. This fee is deducted from the security pool when a dispute is resolved."
                parameters={[]}
                returns="string (yoctoNEAR)"
                example={`const fee = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_ai_processing_fee",
  args: {}
});`}
              />

              <ApiMethodCard
                name="get_trusted_tee_addresses"
                type="view"
                description="Get the list of trusted TEE signing addresses. Only resolutions signed by these addresses are accepted."
                parameters={[]}
                returns="Vec<Vec<u8>>"
                example={`const addresses = await account.viewFunction({
  contractId: "nescrowee.testnet",
  methodName: "get_trusted_tee_addresses",
  args: {}
});`}
              />
            </div>
          </section>

          <section id="change-methods" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Change Methods</h2>
            <p className="text-gray-300 mb-6">
              Change methods modify contract state and require authentication. All change methods require gas fees.
            </p>

            <div className="space-y-6">
              <ApiMethodCard
                name="create_contract"
                type="change"
                description="Create a new escrow contract. The caller becomes the client. Returns the contract ID."
                parameters={[
                  {
                    name: "title",
                    type: "string",
                    description: "Contract title",
                    required: true,
                  },
                  {
                    name: "description",
                    type: "string",
                    description: "Contract description",
                    required: true,
                  },
                  {
                    name: "milestones",
                    type: "MilestoneInput[]",
                    description: "Array of milestones with title, description, and amount (in yoctoNEAR)",
                    required: true,
                  },
                  {
                    name: "freelancer",
                    type: "string | null",
                    description: "Optional freelancer account ID. If null, contract is in Draft status until joined.",
                    required: false,
                  },
                  {
                    name: "security_deposit_pct",
                    type: "u8",
                    description: "Security deposit percentage (5-30%). Used to cover AI dispute costs.",
                    required: true,
                  },
                  {
                    name: "prompt_hash",
                    type: "string",
                    description: "SHA-256 hash of the AI prompt used for disputes",
                    required: true,
                  },
                  {
                    name: "model_id",
                    type: "string",
                    description: "AI model ID for dispute resolution (e.g., 'Qwen/Qwen3-30B-A3B')",
                    required: true,
                  },
                ]}
                returns="string (contract_id)"
                example={`const contractId = await account.functionCall({
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
});`}
              />

              <ApiMethodCard
                name="join_contract"
                type="change"
                description="Join a contract as freelancer using an invite token. Only works for Draft contracts."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "invite_token",
                    type: "string",
                    description: "Invite token from contract creation",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "join_contract",
  args: {
    contract_id: "c1",
    invite_token: "abc123def456"
  },
  gas: "300000000000000"
});`}
              />

              <ApiMethodCard
                name="fund_contract"
                type="change"
                description="Fund a contract. Attach NEAR as deposit. Funds are split into main pool and security pool based on security_deposit_pct."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "fund_contract",
  args: { contract_id: "c1" },
  gas: "300000000000000",
  attachedDeposit: "11000000000000000000000000" // 11 NEAR (10 + 10% security)
});`}
              />

              <ApiMethodCard
                name="start_milestone"
                type="change"
                description="Start working on a milestone. Only the freelancer can call this. Changes status from Funded to InProgress."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "milestone_id",
                    type: "string",
                    description: "The milestone ID",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "start_milestone",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`}
              />

              <ApiMethodCard
                name="request_payment"
                type="change"
                description="Request payment for a completed milestone. Sets 48-hour deadline for client approval. Only freelancer can call."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "milestone_id",
                    type: "string",
                    description: "The milestone ID",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "request_payment",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`}
              />

              <ApiMethodCard
                name="cancel_payment_request"
                type="change"
                description="Cancel a payment request and return milestone to InProgress status. Only freelancer can call."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "milestone_id",
                    type: "string",
                    description: "The milestone ID",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "cancel_payment_request",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`}
              />

              <ApiMethodCard
                name="approve_milestone"
                type="change"
                description="Approve a milestone and release payment to freelancer. Only client can call. Milestone must be in SubmittedForReview status."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "milestone_id",
                    type: "string",
                    description: "The milestone ID",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "approve_milestone",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`}
              />

              <ApiMethodCard
                name="auto_approve_payment"
                type="change"
                description="Auto-approve payment after 48-hour deadline expires. Anyone can call this. Pays freelancer automatically."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "milestone_id",
                    type: "string",
                    description: "The milestone ID",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "auto_approve_payment",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`}
              />

              <ApiMethodCard
                name="raise_dispute"
                type="change"
                description="Raise a dispute on a milestone. Only client can call. Requires sufficient security pool for AI fee. Milestone must be in SubmittedForReview status."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "milestone_id",
                    type: "string",
                    description: "The milestone ID",
                    required: true,
                  },
                  {
                    name: "reason",
                    type: "string",
                    description: "Reason for dispute",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "raise_dispute",
  args: {
    contract_id: "c1",
    milestone_id: "m1",
    reason: "Work does not meet requirements"
  },
  gas: "300000000000000"
});`}
              />

              <ApiMethodCard
                name="submit_ai_resolution"
                type="change"
                description="Submit AI resolution for a dispute. Verifies Ed25519 TEE signature on-chain. Only resolutions from trusted TEE addresses are accepted."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "milestone_id",
                    type: "string",
                    description: "The milestone ID",
                    required: true,
                  },
                  {
                    name: "resolution",
                    type: "Resolution",
                    description: "Resolution type: Freelancer | Client | ContinueWork | Split { freelancer_pct: u8 }",
                    required: true,
                  },
                  {
                    name: "explanation",
                    type: "string",
                    description: "AI explanation of the resolution",
                    required: true,
                  },
                  {
                    name: "signature",
                    type: "Vec<u8>",
                    description: "Ed25519 signature from TEE",
                    required: true,
                  },
                  {
                    name: "signing_address",
                    type: "Vec<u8>",
                    description: "Ed25519 public key of TEE signer",
                    required: true,
                  },
                  {
                    name: "tee_text",
                    type: "string",
                    description: "The text that was signed",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
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
});`}
              />

              <ApiMethodCard
                name="accept_resolution"
                type="change"
                description="Accept an AI resolution early (before 48-hour deadline). Either party can accept. Immediately finalizes the resolution."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "milestone_id",
                    type: "string",
                    description: "The milestone ID",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "accept_resolution",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`}
              />

              <ApiMethodCard
                name="finalize_resolution"
                type="change"
                description="Finalize a resolution after 48-hour deadline expires. Anyone can call this."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "milestone_id",
                    type: "string",
                    description: "The milestone ID",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "finalize_resolution",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`}
              />

              <ApiMethodCard
                name="release_dispute_funds"
                type="change"
                description="Release funds according to finalized resolution. Transfers NEAR to freelancer, client, or both based on resolution type."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                  {
                    name: "milestone_id",
                    type: "string",
                    description: "The milestone ID",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "release_dispute_funds",
  args: { contract_id: "c1", milestone_id: "m1" },
  gas: "300000000000000"
});`}
              />

              <ApiMethodCard
                name="complete_contract_security"
                type="change"
                description="Release remaining security pool to freelancer after all milestones are completed. Anyone can call."
                parameters={[
                  {
                    name: "contract_id",
                    type: "string",
                    description: "The contract ID",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "complete_contract_security",
  args: { contract_id: "c1" },
  gas: "300000000000000"
});`}
              />
            </div>
          </section>

          <section id="owner-methods" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Owner Methods</h2>
            <p className="text-gray-300 mb-6">
              These methods can only be called by the contract owner.
            </p>

            <div className="space-y-6">
              <ApiMethodCard
                name="register_tee_address"
                type="change"
                description="Register a trusted TEE signing address. Only owner can call."
                parameters={[
                  {
                    name: "address",
                    type: "Vec<u8>",
                    description: "Ed25519 public key bytes from TEE attestation",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "register_tee_address",
  args: { address: [/* TEE public key bytes */] },
  gas: "300000000000000"
});`}
              />

              <ApiMethodCard
                name="remove_tee_address"
                type="change"
                description="Remove a trusted TEE signing address. Only owner can call."
                parameters={[
                  {
                    name: "address",
                    type: "Vec<u8>",
                    description: "Ed25519 public key bytes to remove",
                    required: true,
                  },
                ]}
                returns="void"
              />

              <ApiMethodCard
                name="set_ai_processing_fee"
                type="change"
                description="Set the AI processing fee in yoctoNEAR. Deducted from security pool per dispute."
                parameters={[
                  {
                    name: "fee_yoctonear",
                    type: "u128",
                    description: "Fee in yoctoNEAR (1 NEAR = 10^24 yoctoNEAR)",
                    required: true,
                  },
                ]}
                returns="void"
                example={`await account.functionCall({
  contractId: "nescrowee.testnet",
  methodName: "set_ai_processing_fee",
  args: { fee_yoctonear: "50000000000000000000000" }, // 0.05 NEAR
  gas: "300000000000000"
});`}
              />
            </div>
          </section>

          <section id="ai-resolution-flow" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">AI Resolution Flow</h2>
            <p className="text-gray-300 mb-6">
              To resolve a dispute with AI, follow this flow:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4 mb-6">
              <li>Client calls <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">raise_dispute()</code></li>
              <li>Browser calls NEAR AI Cloud API with anonymized context</li>
              <li>AI responds with resolution, signed by TEE</li>
              <li>Browser calls <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">submit_ai_resolution()</code> with signature</li>
              <li>Contract verifies Ed25519 signature</li>
              <li>Parties accept or wait 48 hours</li>
              <li>Call <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">release_dispute_funds()</code> to transfer NEAR</li>
            </ol>
            <CodeBlock
              code={`// Example: Call NEAR AI Cloud
const response = await fetch("https://cloud-api.near.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "Qwen/Qwen3-30B-A3B",
    messages: [{ role: "user", content: prompt + context }],
    temperature: 0.3
  })
});

const { id: chatId } = await response.json();

// Get TEE signature
const sigResponse = await fetch(
  \`https://cloud-api.near.ai/v1/signature/\${chatId}?model=Qwen/Qwen3-30B-A3B&signing_algo=ed25519\`,
  { headers: { "Authorization": "Bearer YOUR_API_KEY" } }
);

const { signature, signing_key, text } = await sigResponse.json();

// Submit to contract
await submitAiResolution({
  contractId: "c1",
  milestoneId: "m1",
  resolution: parsedResolution,
  explanation: aiExplanation,
  signature: signatureBytes,
  signingAddress: signingKeyBytes,
  teeText: text
});`}
              language="typescript"
              title="AI Resolution Example"
            />
          </section>

          <section id="contract-addresses" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Contract Addresses</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Testnet</h3>
                  <code className="text-purple-300">nescrowee.testnet</code>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Mainnet</h3>
                  <code className="text-purple-300">nescrowee.near</code>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-800 pt-16 mt-16">
            <h2 className="text-4xl font-bold text-white mb-2">MCP Documentation</h2>
            <p className="text-lg text-gray-400 mb-12">
              Model Context Protocol specification for bot integrations with Nescrowee escrow contracts.
            </p>
          </div>

          <section id="mcp-overview" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
            <div className="border border-blue-500/20 bg-blue-500/5 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-200">
                <strong>Note:</strong> This is a proposed MCP server specification for documentation purposes. This describes what an MCP server <em>could</em> look like to enable bots to interact with Nescrowee. No actual MCP server implementation is provided—bots can call smart contract methods directly using the API reference above.
              </p>
            </div>
            <p className="text-gray-300 mb-6">
              Model Context Protocol (MCP) is a standard for enabling AI agents to interact with external systems through tools and resources. An MCP server exposes capabilities that AI agents can use to perform actions and access information.
            </p>
            <p className="text-gray-300 mb-6">
              This specification describes how an MCP server could wrap Nescrowee's smart contract methods, making them accessible to AI agents like OpenClaw, Claude Desktop, and other MCP-compatible systems.
            </p>
            <CodeBlock
              code={`{
  "mcpServers": {
    "nescrowee": {
      "command": "node",
      "args": ["nescrowee-mcp-server.js"],
      "env": {
        "NEAR_NETWORK": "testnet",
        "NEAR_CONTRACT_ID": "nescrowee.testnet",
        "NEAR_ACCOUNT_ID": "your-bot-account.testnet",
        "NEAR_PRIVATE_KEY": "ed25519:..."
      }
    }
  }
}`}
              language="json"
              title="MCP Server Configuration (proposed)"
            />
          </section>

          <section id="mcp-tools" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Proposed MCP Tools</h2>
            <p className="text-gray-300 mb-6">
              The following tools would be available to AI agents. These wrap the smart contract methods documented above.
            </p>
            <div className="space-y-4">
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">create_contract</h3>
                <p className="text-gray-300 mb-2">Create a new escrow contract. Returns the contract ID.</p>
              </div>
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">fund_contract</h3>
                <p className="text-gray-300 mb-2">Fund a contract with NEAR. Attach NEAR as deposit.</p>
              </div>
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">get_contract</h3>
                <p className="text-gray-300 mb-2">Get contract state including milestones, disputes, and funding status.</p>
              </div>
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">start_milestone</h3>
                <p className="text-gray-300 mb-2">Start working on a milestone. Only freelancer can call.</p>
              </div>
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">request_payment</h3>
                <p className="text-gray-300 mb-2">Request payment for a completed milestone. Sets 48-hour deadline.</p>
              </div>
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">approve_milestone</h3>
                <p className="text-gray-300 mb-2">Approve a milestone and release payment. Only client can call.</p>
              </div>
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">raise_dispute</h3>
                <p className="text-gray-300 mb-2">Raise a dispute on a milestone. Only client can call.</p>
              </div>
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">get_dispute</h3>
                <p className="text-gray-300 mb-2">Get dispute information for a milestone.</p>
              </div>
            </div>
          </section>

          <section id="mcp-resources" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Proposed MCP Resources</h2>
            <p className="text-gray-300 mb-6">
              Resources provide read-only access to contract data:
            </p>
            <div className="space-y-6">
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">contract:{`{contract_id}`}</h3>
                <p className="text-gray-300 mb-4">Get full contract state including milestones, disputes, and funding status.</p>
                <CodeBlock
                  code={`{
  "uri": "nescrowee://contract/c1",
  "name": "Contract c1",
  "description": "Full contract state",
  "mimeType": "application/json"
}`}
                  language="json"
                />
              </div>
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">dispute:{`{contract_id}`}:{`{milestone_id}`}</h3>
                <p className="text-gray-300 mb-4">Get dispute information for a specific milestone.</p>
                <CodeBlock
                  code={`{
  "uri": "nescrowee://dispute/c1/m1",
  "name": "Dispute for milestone m1",
  "description": "Dispute details and resolution",
  "mimeType": "application/json"
}`}
                  language="json"
                />
              </div>
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">contracts:{`{account_id}`}</h3>
                <p className="text-gray-300 mb-4">List all contracts for an account.</p>
                <CodeBlock
                  code={`{
  "uri": "nescrowee://contracts/alice.testnet",
  "name": "Contracts for alice.testnet",
  "description": "All contracts where account is client or freelancer",
  "mimeType": "application/json"
}`}
                  language="json"
                />
              </div>
            </div>
          </section>

          <section id="mcp-examples" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Integration Examples</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">OpenClaw Integration</h3>
                <p className="text-gray-300 mb-4">
                  Here's how an OpenClaw agent could use the proposed MCP tools:
                </p>
                <CodeBlock
                  code={`const contract = await mcp.callTool("create_contract", {
  title: "Website Development",
  description: "Build landing page for client",
  milestones: [
    { title: "Design", description: "Create mockups", amount: "5000000000000000000000000" },
    { title: "Development", description: "Implement design", amount: "10000000000000000000000000" }
  ],
  security_deposit_pct: 10,
  model_id: "Qwen/Qwen3-30B-A3B"
});

await mcp.callTool("fund_contract", {
  contract_id: contract.id,
  amount: "16500000000000000000000000"
});

await mcp.callTool("start_milestone", {
  contract_id: contract.id,
  milestone_id: "m1"
});`}
                  language="typescript"
                  title="OpenClaw Agent Example"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">rentahuman.ai Integration</h3>
                <p className="text-gray-300 mb-4">
                  rentahuman.ai agents could use MCP to hire humans securely:
                </p>
                <CodeBlock
                  code={`const contract = await mcp.callTool("create_contract", {
  title: "Take photos of restaurant food",
  description: "Visit restaurant, take 10 photos",
  milestones: [
    { title: "Take photos", description: "Visit restaurant, take 10 photos", amount: "2000000000000000000000000" }
  ],
  freelancer: "human.near",
  security_deposit_pct: 10,
  model_id: "Qwen/Qwen3-30B-A3B"
});

await mcp.callTool("fund_contract", {
  contract_id: contract.id,
  amount: "2200000000000000000000000"
});

const contractState = await mcp.getResource("nescrowee://contract/" + contract.id);`}
                  language="typescript"
                  title="rentahuman.ai Agent Example"
                />
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default ApiDocsPage;
