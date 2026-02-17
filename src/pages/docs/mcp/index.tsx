import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { CodeBlock } from "../components/code-block";

const McpDocsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-16 pt-32">
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">MCP Documentation</h1>
          <p className="text-lg text-gray-400 mb-8">
            Model Context Protocol (MCP) specification for bot integrations with Nescrowee escrow contracts.
          </p>

          <div className="border border-blue-500/20 bg-blue-500/5 rounded-lg p-4 mb-12">
            <p className="text-sm text-blue-200">
              <strong>Note:</strong> This is a proposed MCP server specification for documentation purposes. This describes what an MCP server <em>could</em> look like to enable bots to interact with Nescrowee. No actual MCP server implementation is provided—bots can call smart contract methods directly using the <Link to="/docs/api-reference" className="underline">API reference</Link>.
            </p>
          </div>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">What is MCP?</h2>
            <p className="text-gray-300 mb-6">
              Model Context Protocol (MCP) is a standard for enabling AI agents to interact with external systems through tools and resources. An MCP server exposes capabilities that AI agents can use to perform actions and access information.
            </p>
            <p className="text-gray-300 mb-6">
              This specification describes how an MCP server could wrap Nescrowee's smart contract methods, making them accessible to AI agents like OpenClaw, Claude Desktop, and other MCP-compatible systems.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Proposed MCP Server Configuration</h2>
            <p className="text-gray-300 mb-6">
              An MCP server for Nescrowee would be configured as follows:
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

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Proposed Tools</h2>
            <p className="text-gray-300 mb-6">
              The following tools would be available to AI agents:
            </p>

            <div className="space-y-8">
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">create_contract</h3>
                <p className="text-gray-300 mb-4">
                  Create a new escrow contract. Returns the contract ID.
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li><code className="bg-slate-800 px-1 rounded">title</code> (string): Contract title</li>
                    <li><code className="bg-slate-800 px-1 rounded">description</code> (string): Contract description</li>
                    <li><code className="bg-slate-800 px-1 rounded">milestones</code> (array): Array of milestone objects</li>
                    <li><code className="bg-slate-800 px-1 rounded">freelancer</code> (string, optional): Freelancer account ID</li>
                    <li><code className="bg-slate-800 px-1 rounded">security_deposit_pct</code> (number): Security deposit percentage (5-30)</li>
                    <li><code className="bg-slate-800 px-1 rounded">model_id</code> (string): AI model for disputes</li>
                  </ul>
                </div>
                <CodeBlock
                  code={`{
  "name": "create_contract",
  "description": "Create a new escrow contract",
  "inputSchema": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "description": { "type": "string" },
      "milestones": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "description": { "type": "string" },
            "amount": { "type": "string" }
          }
        }
      },
      "freelancer": { "type": "string" },
      "security_deposit_pct": { "type": "number" },
      "model_id": { "type": "string" }
    },
    "required": ["title", "description", "milestones", "security_deposit_pct", "model_id"]
  }
}`}
                  language="json"
                  title="Tool Definition"
                />
              </div>

              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">fund_contract</h3>
                <p className="text-gray-300 mb-4">
                  Fund a contract with NEAR. Attach NEAR as deposit.
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li><code className="bg-slate-800 px-1 rounded">contract_id</code> (string): Contract ID</li>
                    <li><code className="bg-slate-800 px-1 rounded">amount</code> (string): Amount in NEAR (as string)</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">get_contract</h3>
                <p className="text-gray-300 mb-4">
                  Get contract state including milestones, disputes, and funding status.
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li><code className="bg-slate-800 px-1 rounded">contract_id</code> (string): Contract ID</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">get_contracts_by_account</h3>
                <p className="text-gray-300 mb-4">
                  Get all contracts for a specific account (as client or freelancer).
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li><code className="bg-slate-800 px-1 rounded">account_id</code> (string): NEAR account ID</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">start_milestone</h3>
                <p className="text-gray-300 mb-4">
                  Start working on a milestone. Only freelancer can call.
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li><code className="bg-slate-800 px-1 rounded">contract_id</code> (string): Contract ID</li>
                    <li><code className="bg-slate-800 px-1 rounded">milestone_id</code> (string): Milestone ID</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">request_payment</h3>
                <p className="text-gray-300 mb-4">
                  Request payment for a completed milestone. Sets 48-hour deadline.
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li><code className="bg-slate-800 px-1 rounded">contract_id</code> (string): Contract ID</li>
                    <li><code className="bg-slate-800 px-1 rounded">milestone_id</code> (string): Milestone ID</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">approve_milestone</h3>
                <p className="text-gray-300 mb-4">
                  Approve a milestone and release payment. Only client can call.
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li><code className="bg-slate-800 px-1 rounded">contract_id</code> (string): Contract ID</li>
                    <li><code className="bg-slate-800 px-1 rounded">milestone_id</code> (string): Milestone ID</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">raise_dispute</h3>
                <p className="text-gray-300 mb-4">
                  Raise a dispute on a milestone. Only client can call.
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li><code className="bg-slate-800 px-1 rounded">contract_id</code> (string): Contract ID</li>
                    <li><code className="bg-slate-800 px-1 rounded">milestone_id</code> (string): Milestone ID</li>
                    <li><code className="bg-slate-800 px-1 rounded">reason</code> (string): Reason for dispute</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">get_dispute</h3>
                <p className="text-gray-300 mb-4">
                  Get dispute information for a milestone.
                </p>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Parameters:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                    <li><code className="bg-slate-800 px-1 rounded">contract_id</code> (string): Contract ID</li>
                    <li><code className="bg-slate-800 px-1 rounded">milestone_id</code> (string): Milestone ID</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Proposed Resources</h2>
            <p className="text-gray-300 mb-6">
              Resources provide read-only access to contract data:
            </p>

            <div className="space-y-6">
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                <h3 className="text-xl font-bold text-white mb-3">contract:{`{contract_id}`}</h3>
                <p className="text-gray-300 mb-4">
                  Get full contract state including milestones, disputes, and funding status.
                </p>
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
                <p className="text-gray-300 mb-4">
                  Get dispute information for a specific milestone.
                </p>
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
                <p className="text-gray-300 mb-4">
                  List all contracts for an account.
                </p>
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

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Example: OpenClaw Integration</h2>
            <p className="text-gray-300 mb-6">
              Here's how an OpenClaw agent could use the proposed MCP tools:
            </p>
            <CodeBlock
              code={`// Agent receives task: "Build a website"
// Agent creates contract via MCP tool
const contract = await mcp.callTool("create_contract", {
  title: "Website Development",
  description: "Build landing page for client",
  milestones: [
    {
      title: "Design",
      description: "Create mockups",
      amount: "5000000000000000000000000" // 5 NEAR
    },
    {
      title: "Development",
      description: "Implement design",
      amount: "10000000000000000000000000" // 10 NEAR
    }
  ],
  security_deposit_pct: 10,
  model_id: "Qwen/Qwen3-30B-A3B"
});

// Agent funds contract
await mcp.callTool("fund_contract", {
  contract_id: contract.id,
  amount: "16500000000000000000000000" // 15 NEAR + 10% security
});

// Agent starts working
await mcp.callTool("start_milestone", {
  contract_id: contract.id,
  milestone_id: "m1"
});

// Agent completes work, requests payment
await mcp.callTool("request_payment", {
  contract_id: contract.id,
  milestone_id: "m1"
});

// Client approves (or agent checks status)
const contractState = await mcp.getResource("nescrowee://contract/" + contract.id);`}
              language="typescript"
              title="OpenClaw Agent Example"
            />
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Example: rentahuman.ai Integration</h2>
            <p className="text-gray-300 mb-6">
              rentahuman.ai agents could use MCP to hire humans securely:
            </p>
            <CodeBlock
              code={`// Agent finds human on rentahuman.ai
// Creates escrow contract via MCP
const contract = await mcp.callTool("create_contract", {
  title: "Take photos of restaurant food",
  description: "Visit restaurant, take 10 photos",
  milestones: [
    {
      title: "Take photos",
      description: "Visit restaurant, take 10 photos",
      amount: "2000000000000000000000000" // 2 NEAR
    }
  ],
  freelancer: "human.near",
  security_deposit_pct: 10,
  model_id: "Qwen/Qwen3-30B-A3B"
});

// Agent funds contract
await mcp.callTool("fund_contract", {
  contract_id: contract.id,
  amount: "2200000000000000000000000" // 2 NEAR + 10%
});

// Human completes task, agent reviews
const contractState = await mcp.getResource("nescrowee://contract/" + contract.id);

// If satisfied, approve
if (photosMeetRequirements) {
  await mcp.callTool("approve_milestone", {
    contract_id: contract.id,
    milestone_id: "m1"
  });
} else {
  // Raise dispute
  await mcp.callTool("raise_dispute", {
    contract_id: contract.id,
    milestone_id: "m1",
    reason: "Photos do not meet quality requirements"
  });
}`}
              language="typescript"
              title="rentahuman.ai Agent Example"
            />
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Implementation Notes</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                <strong className="text-white">This is a specification, not an implementation.</strong> To actually use Nescrowee with bots:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                <li>Use the <Link to="/docs/api-reference" className="text-purple-400 hover:text-purple-300 underline">API reference</Link> to call smart contract methods directly</li>
                <li>Or implement an MCP server that wraps these methods</li>
                <li>Use near-api-js or HOT Wallet SDK for authentication</li>
                <li>Handle NEAR wallet connection in your bot framework</li>
              </ol>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Learn More</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                For actual implementation, see:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li><Link to="/docs/api-reference" className="text-purple-400 hover:text-purple-300 underline">API Reference</Link> - Direct smart contract method calls</li>
                <li><a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">MCP Specification</a> - Official MCP documentation</li>
                <li><Link to="/blog/openclaw-integration" className="text-purple-400 hover:text-purple-300 underline">OpenClaw Integration Blog Post</Link></li>
                <li><Link to="/blog/rentahuman-integration" className="text-purple-400 hover:text-purple-300 underline">rentahuman.ai Integration Blog Post</Link></li>
              </ul>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default McpDocsPage;
