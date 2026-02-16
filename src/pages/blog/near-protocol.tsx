import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ExternalLink } from "@hugeicons/core-free-icons";

const NearProtocolPost = () => {
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
              Technical
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Building on NEAR Protocol
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Why NEAR's architecture makes Nescrowee possible: Social DB, NEAR AI Cloud, and TEE verification
          </p>

          <div className="text-sm text-gray-500 mb-12">
            Published February 16, 2026 · Nescrowee Team
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Why NEAR?</h2>
              <p>
                Nescrowee needed a blockchain that could handle smart contracts, on-chain data storage, AI inference, and human-readable accounts—all with low fees and fast finality. NEAR Protocol delivers all of this.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Smart Contracts</h2>
              <p>
                Our escrow contract is written in Rust using near-sdk. It handles:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contract creation and milestone management</li>
                <li>Fund locking and release</li>
                <li>Dispute tracking</li>
                <li>TEE signature verification via <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">env::ed25519_verify</code></li>
                <li>Security pool management</li>
              </ul>
              <p>
                NEAR's account model means every user has a human-readable account ID (like <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">alice.near</code>), making onboarding seamless compared to Ethereum's hex addresses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">NEAR Social DB</h2>
              <p>
                Instead of building a backend database, we use NEAR Social DB—an on-chain key-value store. Chat messages, evidence metadata, and structured data are stored directly on-chain at paths like:
              </p>
              <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-gray-300">
                  {`{accountId}/nescrowee/chat/{contractId}/{msgId}`}
                </code>
              </pre>
              <p>
                This means:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>No database to maintain</li>
                <li>All data is on-chain and verifiable</li>
                <li>Users own their data</li>
                <li>Censorship-resistant</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">NEAR AI Cloud</h2>
              <p>
                NEAR AI Cloud provides TEE-protected AI inference. When a dispute is raised:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Browser calls NEAR AI Cloud API directly (no backend)</li>
                <li>AI runs inside Trusted Execution Environment</li>
                <li>Response is signed with Ed25519 inside TEE</li>
                <li>Browser submits signature to smart contract</li>
                <li>Contract verifies signature via <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">env::ed25519_verify</code></li>
              </ol>
              <p>
                This creates cryptographic proof that the AI produced the response, verified on-chain. No oracle accounts. No trust assumptions. Just math.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">TEE Verification</h2>
              <p>
                Trusted Execution Environments (TEEs) are secure hardware enclaves. NEAR AI Cloud runs AI models inside TEEs, ensuring:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI code runs in isolation</li>
                <li>Responses are cryptographically signed</li>
                <li>Attestation reports prove TEE integrity</li>
                <li>On-chain verification via Ed25519 signatures</li>
              </ul>
              <p>
                Anyone can verify the TEE attestation by calling NEAR AI Cloud's attestation endpoint (no auth required). The public key from the attestation is registered on our contract, and every AI resolution is verified against it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Performance & Cost</h2>
              <p>
                NEAR's architecture delivers:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Sub-second finality:</strong> Transactions confirm in ~1 second</li>
                <li><strong>Low fees:</strong> Gas costs under 0.01 USDC for most operations</li>
                <li><strong>Scalability:</strong> Nightshade sharding handles millions of contracts</li>
                <li><strong>Developer experience:</strong> Rust SDK, TypeScript SDK, excellent tooling</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">The Stack</h2>
              <p>
                Nescrowee leverages NEAR's full stack:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Smart Contracts:</strong> Rust + near-sdk for escrow logic</li>
                <li><strong>Social DB:</strong> On-chain chat and metadata storage</li>
                <li><strong>NEAR AI Cloud:</strong> TEE-protected dispute resolution</li>
                <li><strong>HOT Wallet:</strong> MPC wallet for seamless UX</li>
                <li><strong>HOT Pay:</strong> Multi-chain payment infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Learn More</h2>
              <p>
                Explore NEAR Protocol at{" "}
                <a
                  href="https://near.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
                >
                  near.org <HugeiconsIcon icon={ExternalLink} size={14} />
                </a>
                {" "}or check out our{" "}
                <Link to="/how-it-works" className="text-purple-400 hover:text-purple-300 underline">
                  How It Works
                </Link>{" "}
                page for technical details.
              </p>
            </section>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default NearProtocolPost;
