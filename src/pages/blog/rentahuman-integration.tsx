import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ExternalLink } from "@hugeicons/core-free-icons";

const RentahumanIntegrationPost = () => {
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
            rentahuman.ai Meets Escrow
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Enabling AI agents to hire humans securely through milestone-based escrow contracts
          </p>

          <div className="text-sm text-gray-500 mb-12">
            Published February 16, 2026 · Nescrowee Team
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">The Meatspace Layer</h2>
              <p>
                rentahuman.ai is a gig marketplace that allows AI agents to hire humans for physical-world tasks. Launched in early 2026, it's grown to 50,000+ signups in its first week. Now, rentahuman.ai agents can use Nescrowee to secure payments when hiring humans.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">The Problem</h2>
              <p>
                When an AI agent hires a human through rentahuman.ai, how do they ensure:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The human completes the task?</li>
                <li>The human gets paid if they do good work?</li>
                <li>The agent gets a refund if the work is unsatisfactory?</li>
                <li>Disputes are resolved fairly?</li>
              </ul>
              <p>
                Traditional payment methods don't solve this. Nescrowee's milestone-based escrow does.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
              <p>
                rentahuman.ai agents can create escrow contracts through Nescrowee:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Agent finds a human on rentahuman.ai (e.g., "Take photos of restaurant food")</li>
                <li>Agent creates Nescrowee contract with milestones</li>
                <li>Agent funds contract (via HOT Pay or NEAR)</li>
                <li>Human completes task, submits evidence</li>
                <li>Agent reviews, approves or disputes</li>
                <li>If disputed, AI resolves via NEAR AI Cloud</li>
                <li>Payment released based on resolution</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Integration Flow</h2>
              <p>
                rentahuman.ai agents can use Nescrowee's API to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create contracts programmatically via <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">create_contract()</code></li>
                <li>Fund via HOT Pay (accepting payments from any chain)</li>
                <li>Track milestone progress via <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">get_contract()</code></li>
                <li>Approve payments via <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">approve_milestone()</code></li>
                <li>Raise disputes via <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">raise_dispute()</code></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Example: Food Photography Task</h2>
              <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-gray-300">
{`1. Agent needs photos of restaurant food
2. Finds human on rentahuman.ai
3. Creates Nescrowee contract:
   create_contract({
     title: "Restaurant Food Photography",
     milestones: [
       { title: "Visit restaurant, take 10 photos", amount: "2 NEAR" },
       { title: "Edit photos, upload", amount: "1 NEAR" }
     ],
     freelancer: "human.near"
   })
4. Funds contract (3 NEAR total)
5. Human completes task, uploads photos via NOVA
6. Agent reviews, approves → payment released
7. If quality issues, agent disputes → AI resolves`}
                </code>
              </pre>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Benefits for AI Agents</h2>
              <p>
                Nescrowee provides:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Payment security:</strong> Funds locked until work approved</li>
                <li><strong>Dispute resolution:</strong> AI resolves conflicts automatically</li>
                <li><strong>Multi-chain payments:</strong> Accept payments from any chain via HOT Pay</li>
                <li><strong>Evidence storage:</strong> Encrypted evidence via NOVA</li>
                <li><strong>On-chain audit:</strong> All transactions verifiable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Benefits for Humans</h2>
              <p>
                Humans hired by AI agents get:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Guaranteed payment:</strong> Funds locked in smart contract</li>
                <li><strong>Fair disputes:</strong> AI resolves conflicts impartially</li>
                <li><strong>Payment flexibility:</strong> Receive NEAR or other tokens</li>
                <li><strong>Evidence protection:</strong> Encrypted storage via NOVA</li>
                <li><strong>No intermediaries:</strong> Direct payment from agent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">MCP Integration</h2>
              <p>
                rentahuman.ai agents can use our proposed MCP server to interact with Nescrowee. See our{" "}
                <Link to="/docs/mcp" className="text-purple-400 hover:text-purple-300 underline">
                  MCP documentation
                </Link>
                {" "}for details on how agents can programmatically create and manage contracts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Learn More</h2>
              <p>
                Check out{" "}
                <a
                  href="https://rentahuman.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
                >
                  rentahuman.ai <HugeiconsIcon icon={ExternalLink} size={14} />
                </a>
                {" "}and our{" "}
                <Link to="/docs/api-reference" className="text-purple-400 hover:text-purple-300 underline">
                  API documentation
                </Link>
                {" "}to integrate escrow into your agent workflows.
              </p>
            </section>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default RentahumanIntegrationPost;
