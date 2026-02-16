import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerTerminal01Icon } from "@hugeicons/core-free-icons";

const TEE_ATTESTATION_URL =
  "https://cloud-api.near.ai/v1/attestation/report?model=Qwen/Qwen3-30B-A3B&signing_algo=ed25519";

type PromptMetaItem = {
  key: string;
  title: string;
  content: string;
};

const VerifySection = ({
  promptMeta,
  hashes,
  onViewPrompt,
}: {
  promptMeta: PromptMetaItem[];
  hashes: Record<string, string>;
  onViewPrompt: (title: string, content: string) => void;
}) => (
  <div className="space-y-4">
    <div className="rounded-2xl border border-purple-500/10 bg-black/30 px-5 py-5">
      <h4 className="mb-3 text-sm font-semibold text-white">Prompt transparency</h4>
      <p className="mb-4 text-xs leading-relaxed text-gray-400">
        The AI prompts are open-source. When a contract is created, the SHA-256 hash of each prompt is stored on-chain. You can verify that the exact same prompt is used during dispute resolution.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {promptMeta.map((p) => (
          <div key={p.key} className="rounded-xl border border-purple-500/10 bg-purple-500/[0.02] px-3 py-2.5">
            <p className="text-[11px] font-medium text-white">{p.title}</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[10px] text-purple-300/80 break-all">
                SHA-256: {hashes[p.key] ? `${hashes[p.key].slice(0, 6)}...${hashes[p.key].slice(-6)}` : "…"}
              </p>
              <button
                type="button"
                className="text-[10px] text-purple-300 hover:text-white transition-colors shrink-0"
                onClick={() => onViewPrompt(p.title, p.content)}
              >
                View full prompt
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.04] to-violet-600/[0.02] px-5 py-5">
      <h4 className="mb-2 text-sm font-semibold text-white">TEE attestation</h4>
      <p className="mb-3 text-xs leading-relaxed text-gray-400">
        You can independently verify that the AI signing key belongs to genuine TEE hardware. No authentication needed — just call this endpoint:
      </p>
      <div className="rounded-xl border border-purple-500/10 bg-black/40 px-4 py-3">
        <code className="break-all font-mono text-[11px] text-purple-300">
          GET {TEE_ATTESTATION_URL}
        </code>
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-gray-400">
        The response contains the public key that signs AI responses. Match it against the <code className="font-mono text-purple-300/80">signing_address</code> stored on-chain in each dispute round.
      </p>
      <a
        href={TEE_ATTESTATION_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center text-purple-300 hover:text-white transition-colors text-xs"
      >
        <HugeiconsIcon icon={ComputerTerminal01Icon} size={16} className="mr-2 shrink-0" />
        Verify TEE Attestation Report
      </a>
    </div>
    <div className="rounded-2xl border border-purple-400/15 bg-gradient-to-br from-purple-500/[0.05] to-emerald-500/[0.02] px-5 py-5 text-center">
      <h4 className="mb-2 text-sm font-semibold text-purple-300">TEE-Secured, cryptographically verified</h4>
      <p className="mx-auto max-w-lg text-xs leading-relaxed text-gray-400">
        All AI inference runs inside a Trusted Execution Environment. Every response is signed with Ed25519 — the same signature scheme NEAR uses for transactions. The smart contract verifies these signatures on-chain. No oracle, no backend, no trust assumptions. Just NEAR and math.
      </p>
    </div>
  </div>
);

export default VerifySection;
