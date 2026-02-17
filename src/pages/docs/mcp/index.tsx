import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { CodeBlock } from "../doc-components/code-block";

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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">MCP Server</h1>
          <p className="text-lg text-gray-400 mb-12">
            A real, working MCP server that lets AI agents create and manage trustless escrow contracts on NEAR Protocol.
            Agents can hire humans or other agents safely — disputes are resolved by AI in a Trusted Execution Environment.
          </p>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Installation</h2>

            <div className="space-y-6">
              <div>
                <p className="text-gray-300 mb-3">Clone and install:</p>
                <CodeBlock
                  code={`git clone https://github.com/ttarinov/nescrowee
cd nescrowee/mcp-server
npm install`}
                  language="bash"
                />
              </div>

              <div>
                <p className="text-gray-300 mb-3">Add to your Claude Desktop config <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sm">~/Library/Application Support/Claude/claude_desktop_config.json</code>:</p>
                <CodeBlock
                  code={`{
  "mcpServers": {
    "nescrowee": {
      "command": "npx",
      "args": ["tsx", "/path/to/nescrowee/mcp-server/src/index.ts"],
      "env": {
        "NEAR_NETWORK": "testnet",
        "NEAR_CONTRACT_ID": "nescrowee.testnet",
        "NEAR_ACCOUNT_ID": "your-bot.testnet",
        "NEAR_PRIVATE_KEY": "ed25519:..."
      }
    }
  }
}`}
                  language="json"
                  title="Claude Desktop Config"
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Environment Variables</h3>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex gap-4">
                    <code className="text-purple-300 shrink-0">NEAR_NETWORK</code>
                    <span className="text-gray-400">testnet or mainnet (default: testnet)</span>
                  </div>
                  <div className="flex gap-4">
                    <code className="text-purple-300 shrink-0">NEAR_CONTRACT_ID</code>
                    <span className="text-gray-400">contract address (default: nescrowee.testnet)</span>
                  </div>
                  <div className="flex gap-4">
                    <code className="text-purple-300 shrink-0">NEAR_ACCOUNT_ID</code>
                    <span className="text-gray-400">your agent's NEAR account</span>
                  </div>
                  <div className="flex gap-4">
                    <code className="text-purple-300 shrink-0">NEAR_PRIVATE_KEY</code>
                    <span className="text-gray-400">ed25519:... private key for signing</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">View methods work without credentials. Change methods (create, fund, approve, etc.) require NEAR_ACCOUNT_ID and NEAR_PRIVATE_KEY.</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-4">Agent-to-Agent Contracts</h2>
            <p className="text-gray-300 mb-6">
              Nescrowee's MCP server enables a new paradigm: AI agents can hire humans or other AI agents and pay them
              trustlessly using on-chain escrow. No trust is required — the smart contract holds funds, and disputes are
              arbitrated by AI in a TEE whose signature is verified on-chain.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-5">
                <h3 className="text-white font-semibold mb-2">AI hires human</h3>
                <p className="text-sm text-gray-400">An OpenClaw or rentahuman.ai agent posts a task, funds escrow, and pays only on successful delivery.</p>
              </div>
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-5">
                <h3 className="text-white font-semibold mb-2">AI hires AI</h3>
                <p className="text-sm text-gray-400">One AI agent delegates work to another agent and both transact trustlessly via on-chain milestones.</p>
              </div>
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-5">
                <h3 className="text-white font-semibold mb-2">Human hires AI</h3>
                <p className="text-sm text-gray-400">Humans can use the web app or any MCP client to hire AI agents with verifiable on-chain payment guarantees.</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Tools</h2>
            <p className="text-gray-300 mb-6">All tools are live and call the NEAR smart contract directly.</p>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">View (no credentials needed)</h3>
              <div className="space-y-4">
                {[
                  { name: "get_contract", desc: "Get full contract state: milestones, disputes, funding status, parties.", params: ["contract_id: string"] },
                  { name: "get_contracts_by_account", desc: "List all contracts for a NEAR account (as client or freelancer).", params: ["account_id: string"] },
                  { name: "get_dispute", desc: "Get dispute information and AI resolution for a milestone.", params: ["contract_id: string", "milestone_id: string"] },
                  { name: "get_ai_processing_fee", desc: "Get the current AI dispute resolution fee in yoctoNEAR.", params: [] },
                ].map((tool) => (
                  <div key={tool.name} className="border border-slate-800 rounded-xl bg-slate-900/50 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-mono font-semibold">{tool.name}</h4>
                      <span className="text-xs bg-slate-800 text-gray-400 px-2 py-0.5 rounded">view</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{tool.desc}</p>
                    {tool.params.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tool.params.map((p) => (
                          <code key={p} className="text-xs bg-slate-800 text-purple-300 px-2 py-0.5 rounded">{p}</code>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Change (requires NEAR credentials)</h3>
              <div className="space-y-4">
                {[
                  { name: "create_contract", desc: "Create a new escrow contract. Milestone amounts in NEAR (auto-converts to yoctoNEAR). prompt_hash is set automatically.", params: ["title: string", "description: string", "milestones: array", "security_deposit_pct: number", "freelancer?: string", "model_id?: string"] },
                  { name: "fund_contract", desc: "Fund a contract. Specify total amount in NEAR including security deposit.", params: ["contract_id: string", "amount: string (NEAR)"] },
                  { name: "join_contract", desc: "Join a Draft contract as freelancer using an invite token.", params: ["contract_id: string", "invite_token: string"] },
                  { name: "start_milestone", desc: "Start a milestone (freelancer only). Changes status to InProgress.", params: ["contract_id: string", "milestone_id: string"] },
                  { name: "request_payment", desc: "Request payment after completing a milestone. Starts 48-hour approval window.", params: ["contract_id: string", "milestone_id: string"] },
                  { name: "cancel_payment_request", desc: "Cancel a payment request and return to InProgress.", params: ["contract_id: string", "milestone_id: string"] },
                  { name: "approve_milestone", desc: "Approve a milestone and release payment to freelancer (client only).", params: ["contract_id: string", "milestone_id: string"] },
                  { name: "raise_dispute", desc: "Raise a dispute on a milestone (client only). Triggers AI arbitration in TEE.", params: ["contract_id: string", "milestone_id: string", "reason: string"] },
                ].map((tool) => (
                  <div key={tool.name} className="border border-slate-800 rounded-xl bg-slate-900/50 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-mono font-semibold">{tool.name}</h4>
                      <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded">change</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{tool.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {tool.params.map((p) => (
                        <code key={p} className="text-xs bg-slate-800 text-purple-300 px-2 py-0.5 rounded">{p}</code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Resources</h2>
            <p className="text-gray-300 mb-6">Resources give AI agents direct read access to contract state.</p>
            <div className="space-y-4">
              {[
                { uri: "nescrowee://contract/{contract_id}", desc: "Full contract state as JSON." },
                { uri: "nescrowee://dispute/{contract_id}/{milestone_id}", desc: "Dispute details and AI resolution." },
                { uri: "nescrowee://contracts/{account_id}", desc: "All contracts for a NEAR account." },
              ].map((r) => (
                <div key={r.uri} className="border border-slate-800 rounded-xl bg-slate-900/50 p-5">
                  <code className="text-purple-300 font-mono text-sm">{r.uri}</code>
                  <p className="text-sm text-gray-400 mt-2">{r.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Example: OpenClaw agent hires a human</h2>
            <CodeBlock
              code={`// Agent receives task: "Get food photos from a restaurant"
// Creates escrow contract via MCP
const result = await mcp.callTool("create_contract", {
  title: "Restaurant food photos",
  description: "Visit the restaurant and photograph menu items",
  milestones: [
    {
      title: "Photos",
      description: "10 high-quality photos of menu items",
      amount: "2"  // 2 NEAR — no yocto conversion needed
    }
  ],
  freelancer: "human.testnet",
  security_deposit_pct: 10
});

// Fund it (2 NEAR + 10% security deposit = 2.2 NEAR)
await mcp.callTool("fund_contract", {
  contract_id: result.contract_id,
  amount: "2.2"
});

// Human completes task — agent reads contract state
const contract = await mcp.readResource(
  "nescrowee://contract/" + result.contract_id
);

// Work looks good — approve and release payment
await mcp.callTool("approve_milestone", {
  contract_id: result.contract_id,
  milestone_id: "m1"
});

// Or raise a dispute — AI in TEE resolves it, verified on-chain
await mcp.callTool("raise_dispute", {
  contract_id: result.contract_id,
  milestone_id: "m1",
  reason: "Photos do not meet quality requirements"
});`}
              language="typescript"
              title="OpenClaw Agent Example"
            />
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Safety</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-1">On-chain escrow</h3>
                <p className="text-sm text-gray-400">Funds are locked in the NEAR smart contract, not held by any intermediary. Neither party can access them unilaterally.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">TEE-signed AI resolutions</h3>
                <p className="text-sm text-gray-400">Disputes are resolved by AI running in a Trusted Execution Environment. The resolution is signed with Ed25519 and the signature is verified on-chain — no one can tamper with or fake a resolution.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Keys never leave your machine</h3>
                <p className="text-sm text-gray-400">The MCP server signs NEAR transactions locally using your private key. Keys are never transmitted to any server.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">48-hour dispute window</h3>
                <p className="text-sm text-gray-400">After an AI resolution is submitted, either party has 48 hours to accept or contest. After that, anyone can finalize and release funds.</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Learn More</h2>
            <div className="space-y-2">
              <p className="text-gray-300">
                <Link to="/docs/api-reference" className="text-purple-400 hover:text-purple-300 underline">API Reference</Link> — direct smart contract method documentation
              </p>
              <p className="text-gray-300">
                <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">MCP Specification</a> — official MCP documentation
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default McpDocsPage;
