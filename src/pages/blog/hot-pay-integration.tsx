import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ExternalLink } from "@hugeicons/core-free-icons";

const HotPayIntegrationPost = () => {
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
            Multi-Chain Payments with HOT Pay
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            How Nescrowee enables escrow funding from 30+ chains through HOT Pay's seamless payment infrastructure
          </p>

          <div className="text-sm text-gray-500 mb-12">
            Published February 16, 2026 · Nescrowee Team
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">The Problem</h2>
              <p>
                Traditional escrow platforms require users to hold specific tokens. If you're a freelancer working with a client who only has USDC on Ethereum, but the escrow contract is on NEAR, you're stuck. Either the client needs to bridge tokens (expensive, slow, confusing) or you need to accept a different payment method.
              </p>
              <p>
                This friction kills adoption. We wanted Nescrowee to accept payments from anywhere, in any token, while still settling everything on NEAR Protocol where our smart contract lives.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Enter HOT Pay</h2>
              <p>
                HOT Pay solves this elegantly. It's a payment infrastructure that lets users pay with tokens from 30+ chains (Ethereum, BNB Chain, Polygon, Arbitrum, Base, and more) while you receive NEAR on-chain. No bridging. No manual steps. Just a checkout flow.
              </p>
              <p>
                Here's how it works in Nescrowee:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Client clicks "Fund Milestone" and chooses HOT Pay</li>
                <li>They're redirected to HOT Pay checkout</li>
                <li>Client pays with USDC, USDT, ETH, BNB, or any supported token</li>
                <li>HOT Pay settles on NEAR via OmniBridge + NEAR Intents</li>
                <li>Webhook notifies our server</li>
                <li>Relay account calls <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">fund_contract()</code> with the NEAR</li>
                <li>Funds are locked in escrow</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Security: Function-Call-Only Account</h2>
              <p>
                The relay account is a critical security feature. It's a NEAR account with a function-call-only access key that can ONLY call <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">fund_contract()</code> on our contract. It has no full-access key, so it can't:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Steal funds</li>
                <li>Call any other contract method</li>
                <li>Transfer tokens anywhere else</li>
              </ul>
              <p>
                This is publicly verifiable. Anyone can check <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">near keys relay.nescrowee.testnet</code> and see that it only has function-call permissions for <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">fund_contract</code>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Webhook Verification</h2>
              <p>
                Every webhook from HOT Pay is verified with HMAC-SHA256 signature. The server checks the signature before executing any relay transaction. This prevents forged webhooks from draining the relay account.
              </p>
              <p>
                The memo field (<code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">mt-{`{contractId}-{milestoneId}`}</code>) ensures payments are routed to the correct contract and milestone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Benefits</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Multi-chain support:</strong> Accept payments from 30+ chains without manual bridging</li>
                <li><strong>Better UX:</strong> Clients pay with what they have, freelancers get NEAR</li>
                <li><strong>Non-custodial:</strong> Funds go directly to smart contract, no intermediate custody</li>
                <li><strong>On-chain settlement:</strong> All transactions verified on NEAR blockchain</li>
                <li><strong>Automatic processing:</strong> Webhook automatically funds contract</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Technical Details</h2>
              <p>
                The integration consists of:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Frontend: Payment link generation with contract/milestone IDs in memo</li>
                <li>Backend: Vercel serverless function that verifies webhooks and relays transactions</li>
                <li>Relay account: Function-call-only NEAR account for secure funding</li>
                <li>Smart contract: Open <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300">fund_contract()</code> method that anyone can call</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Learn More</h2>
              <p>
                Want to integrate HOT Pay into your own project? Check out our{" "}
                <Link to="/docs/api-reference" className="text-purple-400 hover:text-purple-300 underline">
                  API documentation
                </Link>{" "}
                or visit{" "}
                <a
                  href="https://pay.hot-labs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
                >
                  HOT Pay <HugeiconsIcon icon={ExternalLink} size={14} />
                </a>
                .
              </p>
            </section>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default HotPayIntegrationPost;
