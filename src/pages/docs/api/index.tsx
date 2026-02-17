import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { ApiMethodCard } from "../doc-components/api-method-card";
import { CodeBlock } from "../doc-components/code-block";
import OnThisPageSidebar from "../on-this-page-sidebar";
import { VIEW_METHODS, CHANGE_METHODS, OWNER_METHODS } from "./methods";
import { MCP_TOOLS, MCP_RESOURCES } from "./mcp-data";

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
              {VIEW_METHODS.map((method) => (
                <ApiMethodCard key={method.name} {...method} />
              ))}
            </div>
          </section>

          <section id="change-methods" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Change Methods</h2>
            <p className="text-gray-300 mb-6">
              Change methods modify contract state and require authentication. All change methods require gas fees.
            </p>
            <div className="space-y-6">
              {CHANGE_METHODS.map((method) => (
                <ApiMethodCard key={method.name} {...method} />
              ))}
            </div>
          </section>

          <section id="owner-methods" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Owner Methods</h2>
            <p className="text-gray-300 mb-6">
              These methods can only be called by the contract owner.
            </p>
            <div className="space-y-6">
              {OWNER_METHODS.map((method) => (
                <ApiMethodCard key={method.name} {...method} />
              ))}
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
            <h2 className="text-4xl font-bold text-white mb-2">MCP Server</h2>
            <p className="text-lg text-gray-400 mb-6">
              A real MCP server that lets AI agents create and manage escrow contracts directly. See the <Link to="/docs/mcp-specification" className="text-purple-400 hover:text-purple-300 underline">MCP documentation</Link> for setup and full details.
            </p>
          </div>

          <section id="mcp-overview" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
            <p className="text-gray-300 mb-6">
              Nescrowee has a working MCP (Model Context Protocol) server that wraps all smart contract methods, making them accessible to AI agents like Claude Desktop, OpenClaw, and rentahuman.ai. Agents can hire humans or other agents trustlessly, with disputes resolved by AI in a TEE.
            </p>
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
          </section>

          <section id="mcp-tools" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">MCP Tools</h2>
            <p className="text-gray-300 mb-6">
              The following tools are available to AI agents. They wrap the smart contract methods documented above.
            </p>
            <div className="space-y-4">
              {MCP_TOOLS.map((tool) => (
                <div key={tool.name} className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{tool.name}</h3>
                  <p className="text-gray-300 mb-2">{tool.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="mcp-resources" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">MCP Resources</h2>
            <p className="text-gray-300 mb-6">
              Resources provide read-only access to contract data:
            </p>
            <div className="space-y-6">
              {MCP_RESOURCES.map((resource) => (
                <div key={resource.uri} className="border border-slate-800 rounded-xl bg-slate-900/50 p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{resource.title}</h3>
                  <p className="text-gray-300 mb-4">{resource.description}</p>
                  <CodeBlock code={resource.example} language="json" />
                </div>
              ))}
            </div>
          </section>

          <section id="mcp-examples" className="scroll-mt-28 mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Integration Examples</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">OpenClaw Integration</h3>
                <p className="text-gray-300 mb-4">
                  How an OpenClaw agent uses MCP tools to create and manage escrow contracts:
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
                  rentahuman.ai agents use MCP to hire humans trustlessly with on-chain escrow:
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
