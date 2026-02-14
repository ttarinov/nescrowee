import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  JusticeScale01Icon,
  Shield01Icon,
  AiBrain01Icon,
  Clock01Icon,
  EyeIcon,
  LockIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import {
  getStandardPromptHash,
  getAppealPromptHash,
  getInvestigationPromptHash,
  getInvestigationAppealPromptHash,
  standardPrompt,
  appealPrompt,
  investigationPrompt,
  investigationAppealPrompt,
} from "@/utils/promptHash";
import { AI_MODELS, APPEAL_MODEL_ID } from "@/types/ai";

const HowDisputesWorkPage = () => {
  const [standardHash, setStandardHash] = useState("");
  const [appealHash, setAppealHash] = useState("");
  const [investigationHash, setInvestigationHash] = useState("");
  const [investigationAppealHash, setInvestigationAppealHash] = useState("");
  const [showPrompt, setShowPrompt] = useState<"standard" | "appeal" | "investigation" | "investigation-appeal" | null>(null);

  useEffect(() => {
    getStandardPromptHash().then(setStandardHash);
    getAppealPromptHash().then(setAppealHash);
    getInvestigationPromptHash().then(setInvestigationHash);
    getInvestigationAppealPromptHash().then(setInvestigationAppealHash);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <HugeiconsIcon icon={JusticeScale01Icon} size={32} className="text-primary" />
            <h1 className="text-3xl font-bold">How Disputes Work</h1>
          </div>
          <p className="text-muted-foreground mb-10">
            Fully decentralized AI dispute resolution. No backend, no oracle — your browser calls NEAR AI Cloud directly, and the smart contract verifies Ed25519 TEE signatures on-chain.
          </p>

          {/* Architecture */}
          <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 mb-12">
            <h2 className="text-lg font-semibold mb-3">Zero-Trust Agentic Architecture</h2>
            <div className="space-y-2 text-sm font-mono text-muted-foreground">
              <p>1. Browser orchestrates multi-round AI investigation (no backend)</p>
              <p>2. Each round: Browser calls NEAR AI Cloud directly</p>
              <p>3. AI runs inside TEE hardware, signs each response with Ed25519</p>
              <p>4. Browser submits each round + signature to smart contract</p>
              <p>5. Contract calls env::ed25519_verify per round — full audit trail</p>
              <p>6. Final round's resolution becomes the dispute decision</p>
              <p>7. User watches investigation happen live, round by round</p>
            </div>
          </div>

          {/* Flow Steps */}
          <div className="space-y-6 mb-12">
            <h2 className="text-xl font-semibold">Dispute Resolution Flow</h2>
            {[
              {
                icon: AiBrain01Icon,
                step: "1",
                title: "Party Raises Dispute",
                desc: "Either client or freelancer can raise a dispute on an active milestone. The reason is recorded on-chain.",
              },
              {
                icon: Shield01Icon,
                step: "2",
                title: "AI Investigates (Multi-Round)",
                desc: "Your browser orchestrates a multi-round investigation. Round 1: identify claims and check scope. Round 2: cross-reference evidence and timelines. Round 3+: evaluate and decide. Each round calls NEAR AI Cloud directly — the AI runs inside TEE hardware that signs every response with Ed25519. You watch the investigation happen live.",
              },
              {
                icon: LockIcon,
                step: "3",
                title: "Each Round TEE-Verified On-Chain",
                desc: "After each investigation round, the browser submits the AI analysis + Ed25519 signature to the smart contract. The contract calls env::ed25519_verify per round, creating a full cryptographic audit trail. Anyone can verify every step of the AI's reasoning.",
              },
              {
                icon: EyeIcon,
                step: "4",
                title: "Accept or Appeal",
                desc: "Both parties can accept the resolution, or either party can appeal for a deeper investigation by DeepSeek V3.1 (up to 5 rounds). The appeal investigation also goes through the same per-round TEE verification flow.",
              },
              {
                icon: Clock01Icon,
                step: "5",
                title: "Auto-Execution (48h)",
                desc: "If both parties accept, or after 48 hours, the resolution is finalized and funds are transferred automatically per the AI's recommendation.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="flex gap-4 p-4 rounded-xl bg-card border border-border"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={item.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-primary/60">Step {item.step}</span>
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Model Options */}
          <div className="space-y-4 mb-12">
            <h2 className="text-xl font-semibold">AI Models (TEE-Protected)</h2>
            <p className="text-sm text-muted-foreground">
              Contract creators choose the standard dispute model. Appeals always use DeepSeek V3.1 for maximum thoroughness.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {AI_MODELS.map((model) => (
                <div
                  key={model.id}
                  className={`p-4 rounded-xl bg-card border ${
                    model.id === APPEAL_MODEL_ID ? "border-primary/30" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <HugeiconsIcon icon={AiBrain01Icon} size={16} className="text-primary" />
                    <h3 className="font-semibold text-sm">{model.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{model.description}</p>
                  <div className="text-xs font-mono text-muted-foreground space-y-0.5">
                    <p>Pricing: {model.pricing}</p>
                    <p>Speed: {model.speed}</p>
                    {model.id === APPEAL_MODEL_ID && (
                      <p className="text-primary">Used for all appeals</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Tiers */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-3">
                <HugeiconsIcon icon={AiBrain01Icon} size={20} className="text-primary" />
                <h3 className="font-semibold">Standard Review</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>2-3 investigation rounds</li>
                <li>Model chosen by contract creator</li>
                <li>Each round TEE-signed on-chain</li>
                <li>Can be appealed</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl bg-card border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <HugeiconsIcon icon={Shield01Icon} size={20} className="text-primary" />
                <h3 className="font-semibold">Appeal (Deep Investigation)</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>3-5 investigation rounds</li>
                <li>Always DeepSeek V3.1</li>
                <li>Each round TEE-signed on-chain</li>
                <li>Final decision (no further appeals)</li>
              </ul>
            </div>
          </div>

          {/* Prompt Transparency */}
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={LockIcon} size={20} className="text-primary" />
              <h2 className="text-xl font-semibold">Prompt Transparency</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              The AI prompts are open-source and verifiable. The SHA-256 hash of each prompt is stored on-chain at contract creation, so you can verify that the exact same prompt is used for dispute resolution.
            </p>

            {[
              { key: "standard" as const, title: "Standard Resolution Prompt", hash: standardHash, content: standardPrompt },
              { key: "appeal" as const, title: "Appeal Resolution Prompt", hash: appealHash, content: appealPrompt },
              { key: "investigation" as const, title: "Investigation Prompt", hash: investigationHash, content: investigationPrompt },
              { key: "investigation-appeal" as const, title: "Appeal Investigation Prompt", hash: investigationAppealHash, content: investigationAppealPrompt },
            ].map((prompt) => (
              <div key={prompt.key} className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{prompt.title}</h3>
                  <button
                    className="text-xs text-primary hover:underline"
                    onClick={() => setShowPrompt(showPrompt === prompt.key ? null : prompt.key)}
                  >
                    {showPrompt === prompt.key ? "Hide" : "View"} Full Prompt
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">SHA-256:</span>
                  <code className="text-xs font-mono text-primary break-all">{prompt.hash}</code>
                </div>
                {showPrompt === prompt.key && (
                  <motion.pre
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-muted-foreground bg-secondary/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto"
                  >
                    {prompt.content}
                  </motion.pre>
                )}
              </div>
            ))}
          </div>

          {/* Verify Yourself */}
          <div className="space-y-4 mb-12">
            <h2 className="text-xl font-semibold">Verify It Yourself</h2>
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <h3 className="font-semibold text-sm">TEE Attestation</h3>
              <p className="text-sm text-muted-foreground">
                You can independently verify the NEAR AI TEE attestation report to confirm the signing key belongs to genuine TEE hardware:
              </p>
              <code className="text-xs font-mono text-primary block bg-secondary/50 p-3 rounded-lg break-all">
                GET https://cloud-api.near.ai/v1/attestation/report?model=Qwen/Qwen3-30B-A3B&signing_algo=ed25519
              </code>
              <p className="text-xs text-muted-foreground">
                No authentication needed. The report contains the public key that signs AI responses — match it against the signing_address stored on-chain in each dispute.
              </p>
            </div>
          </div>

          {/* TEE Security */}
          <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <HugeiconsIcon icon={LockIcon} size={20} className="text-primary" />
              <h3 className="font-semibold">TEE-Secured, Cryptographically Verified</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All AI inference runs inside a Trusted Execution Environment (TEE) on NEAR AI Cloud.
              Every response is signed with Ed25519 — the same signature scheme NEAR uses for transactions.
              The smart contract verifies these signatures on-chain using env::ed25519_verify.
              No oracle, no backend, no Vercel, no trust assumptions. Just NEAR and math.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HowDisputesWorkPage;
