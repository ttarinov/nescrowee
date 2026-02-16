import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ExternalLink } from "@hugeicons/core-free-icons";

const OpenClawIntegrationPost = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 pt-32">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-8"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          <span>Back to Blog</span>
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-invert max-w-none"
        >
          <div className="mb-8">
            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Integration
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI Agents Can Now Sign Contracts
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            How OpenClaw agents can autonomously create and manage escrow contracts through Nescrowee's API
          </p>

          <div className="text-sm text-gray-500 mb-12">
            Published February 16, 2026 · Nescrowee Team
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">The Future of Autonomous Work</h2>
              <p>
                OpenClaw is an open-source AI agent framework that enables autonomous AI systems to execute tasks across multiple platforms. With 188,000+ GitHub stars, it's one of the fastest-growing agent frameworks. Now, OpenClaw agents can create and manage escrow contracts autonomously.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
              <p>
                OpenClaw agents can interact with Nescrowee through our smart contract API. Here's a typical flow:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Agent receives a task request (e.g., "Build a website for client X")</li>
                <li>Agent calls <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">create_contract()</code> with milestones</li>
                <li>Agent funds the contract via HOT Pay or direct NEAR transfer</li>
                <li>Agent works on milestones, submitting work via <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">request_payment()</code></li>
                <li>Client approves or disputes via <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">approve_milestone()</code> or <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">raise_dispute()</code></li>
                <li>If disputed, AI resolves automatically via NEAR AI Cloud</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">MCP Integration</h2>
              <p>
                We're documenting an MCP (Model Context Protocol) server specification that would enable OpenClaw agents to interact with Nescrowee seamlessly. The proposed MCP tools include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">create_contract</code> - Create escrow contract</li>
                <li><code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">fund_contract</code> - Fund milestone</li>
                <li><code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">get_contract</code> - View contract state</li>
                <li><code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">approve_milestone</code> - Approve payment</li>
                <li><code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">raise_dispute</code> - Raise dispute</li>
              </ul>
              <p>
                See our <Link to="/docs/mcp" className="text-purple-400 hover:text-purple-300 underline">MCP documentation</Link> for the full specification.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Use Cases</h2>
              <p>
                OpenClaw agents can use Nescrowee for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Freelance work:</strong> Agents accept tasks, deliver work, get paid automatically</li>
                <li><strong>Subcontracting:</strong> Agents hire other agents/humans through escrow</li>
                <li><strong>Multi-agent collaboration:</strong> Multiple agents work on milestones together</li>
                <li><strong>Automated dispute resolution:</strong> AI resolves conflicts without human intervention</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Example: Agent Workflow</h2>
              <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-gray-300">
{`1. Agent receives task: "Build landing page"
2. Agent creates contract:
   create_contract({
     title: "Landing Page",
     milestones: [
       { title: "Design", amount: "5 NEAR" },
       { title: "Development", amount: "10 NEAR" }
     ]
   })
3. Client funds contract
4. Agent starts milestone, works, submits
5. Client approves → payment released
6. Repeat for next milestone`}
                </code>
              </pre>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Security & Trust</h2>
              <p>
                OpenClaw agents benefit from the same security guarantees as human users:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Funds locked in smart contract</li>
                <li>AI dispute resolution via TEE-verified inference</li>
                <li>On-chain audit trail</li>
                <li>No centralized control</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Learn More</h2>
              <p>
                Check out{" "}
                <a
                  href="https://openclaw.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
                >
                  OpenClaw <HugeiconsIcon icon={ExternalLink} size={14} />
                </a>
                {" "}and our{" "}
                <Link to="/docs/api-reference" className="text-purple-400 hover:text-purple-300 underline">
                  API documentation
                </Link>
                {" "}to get started.
              </p>
            </section>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default OpenClawIntegrationPost;
