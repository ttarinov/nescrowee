# Milestone Trust — Pitch & Strategy

## What Is Milestone Trust?

Trustless escrow + TEE-verified AI dispute resolution on NEAR. Zero backend. Zero oracle. Trust math, not servers.

Freelancers and clients create milestone-based contracts on-chain. Funds are locked in a smart contract and released automatically when milestones are approved. If a dispute arises, the user's browser calls NEAR AI Cloud directly — the AI runs inside TEE hardware that signs every response with Ed25519. The signature goes on-chain, where the smart contract verifies it cryptographically. Open-source prompts. User-chosen AI models. No servers, no trust assumptions.

## The Problem

Freelancers and clients have no trustworthy, affordable escrow:

| Platform | Fee | Speed | Limitations |
|----------|-----|-------|-------------|
| Escrow.com | 3.25% | 3-5 days | US-centric, requires KYC |
| PayPal | 2.9% + $0.30 | 21-day holds | Disputes take weeks, biased toward buyers |
| Banks/lawyers | $500+ setup | Days to weeks | Inaccessible globally |
| **Milestone Trust** | **<$0.01/tx** | **Sub-second** | **Global, no KYC, programmable** |

The $1.5T gig economy is growing 15% YoY. Cross-border freelancing is exploding. Existing tools are slow, expensive, and geographically limited.

## The Solution

1. **On-chain escrow** — Client funds locked in NEAR smart contract, released per milestone
2. **TEE-verified AI disputes** — Browser calls NEAR AI Cloud directly. AI runs in TEE hardware, signs response with Ed25519. Smart contract verifies cryptographically. No oracle, no backend
3. **User-chosen AI models** — Contract creators pick the AI model (Qwen3, GPT-OSS, DeepSeek, GLM-4.1V). Appeals always use DeepSeek V3.1 for thoroughness
4. **Open-source prompts** — SHA-256 hash stored on-chain at contract creation. Anyone can verify the exact prompt used
5. **Global & instant** — Anyone with a NEAR account can participate. Sub-second finality, <$0.01 fees

## Why NEAR?

- **Human-readable accounts** — `alice.near` instead of `0x7a3b...`
- **Sub-second finality** — Transactions confirm in <1 second
- **<$0.01 transaction fees** — Makes micro-milestones viable
- **NEAR AI Cloud + TEE** — AI inference inside Trusted Execution Environments with Ed25519 signatures
- **Native Ed25519 verify** — `env::ed25519_verify` in smart contracts — verifies TEE signatures on-chain
- **HOT Wallet** — Seamless payment signing for non-crypto users
- **Account model** — Named accounts, access keys, contract-level permissions

## Why Blockchain > Traditional?

The TEE-verified AI dispute flow is ONLY possible on-chain:

- **Ed25519 verification on-chain** — Smart contract cryptographically verifies AI responses came from TEE hardware
- **Trustless dispute resolution** — No oracle, no backend, no server to trust. Browser → NEAR AI → contract verifies signature
- **Automatic payout** — Contract executes payment based on AI resolution, no human intervention
- **Transparent audit trail** — Every action recorded immutably, TEE signatures stored on disputes
- **Composable** — Other dApps can integrate escrow as a building block

Traditional escrow requires trusting a company. We require trusting math.

## Architecture

```
BEFORE: User → Vercel oracle → NEAR AI → oracle submits on-chain (trust Vercel)
AFTER:  Browser → NEAR AI Cloud (TEE) → browser submits {response + Ed25519 signature} → contract verifies (trust math)
```

```
Frontend:  React + TypeScript + Vite + shadcn/ui + Tailwind
Contract:  Rust + near-sdk (escrow, Ed25519 TEE verification, milestone management)
AI:        NEAR AI Cloud (TEE-protected inference, Ed25519 signatures)
Payments:  HOT Wallet (signing NEAR transactions)
Storage:   On-chain (contract state, TEE proofs) + NEAR Social (chat)
```

### Key Technical Details

- Smart contract stores `trusted_tee_addresses: Vec<Vec<u8>>` — owner registers TEE public keys from attestation reports
- `submit_ai_resolution()` calls `env::ed25519_verify(&signature, tee_text.as_bytes(), &signing_address)` — native NEAR Ed25519 verification
- Anyone can call `submit_ai_resolution` (no oracle check) — the signature proof is what matters
- TEE signature text format: `SHA256(request_json):SHA256(response_body)` — signed by TEE private key
- Browser-side PII scrubbing (anonymizes accounts to Party A/B) before sending to AI
- API key bundled as `VITE_NEAR_AI_KEY` — same pattern as Infura/Alchemy keys in Ethereum dApps. TEE signature prevents tampering regardless of who calls the API

### AI Models (TEE-Protected)

| Model | Speed | Pricing (in/out per M tokens) | Use |
|-------|-------|-------------------------------|-----|
| Qwen3 30B | ~10s | $0.15 / $0.55 | Standard disputes (default) |
| GPT-OSS 120B | ~20s | $0.15 / $0.55 | Strong reasoning |
| DeepSeek V3.1 | ~45s | $1.05 / $3.10 | Appeals (always) |
| GLM-4.1V 9B | ~15s | $0.15 / $0.55 | Vision-capable |

## Judging Criteria (All Tracks)

### 1. Impact / Usefulness
> Does the project solve a real problem? Could it meaningfully improve lives or systems if deployed?

**Our angle:** Real problem (freelance trust), real market ($1.5T gig economy), solves it cheaper/faster/globally. Cross-border freelancing has no good escrow solution — we fill that gap. Fully decentralized — no backend to maintain, no oracle to trust.

### 2. Technical Execution
> The complexity, robustness, and quality of the code or architecture — does it work and was it hard to build?

**Our angle:** Rust smart contract with native `env::ed25519_verify` for TEE signature verification. Browser-direct NEAR AI Cloud integration. Ed25519 cryptographic proof chain from TEE hardware to on-chain storage. Open-source prompts with on-chain SHA-256 hashes. HOT Wallet integration. Zero backend architecture.

### 3. Completeness / Functionality
> Is the product finished and fully functional? Or is it just a prototype with broken elements?

**Our angle:** Full UI with model picker, dispute flow, TEE verification display. Working smart contract with Ed25519 verify. Complete browser-to-chain flow: anonymize → call AI → get TEE signature → submit on-chain → contract verifies → resolution stored.

### 4. User Experience (UX)
> Is the product intuitive, accessible, and visually polished? Would a user understand how to use it quickly?

**Our angle:** Polished UI with animations, clear contract creation flow with model selection, milestone tracking, real-time dispute status showing TEE verification. "How Disputes Work" page with verification instructions. Non-crypto users can understand the flow.

## Submission Requirements (All Tracks)

- **Summary** — Project description
- **GitHub** — Public repo link
- **Demo** — Deployed URL or video walkthrough

## Hackathon Pitch

"Zero backend. Zero oracle. The user's browser calls NEAR AI Cloud directly — the AI runs inside TEE hardware that signs every response with Ed25519. The signature goes on-chain, where the smart contract verifies it cryptographically. Open-source prompts. User-chosen AI models. No Vercel, no servers, no trust assumptions. Just NEAR and math."

## Hackathon Track Strategy

**Primary targets (submit to all):**
- The Private Web ($3,500) — Privacy-first disputes (TEE hardware, anonymized evidence, Ed25519 proofs)
- AI That Works For You ($3,500) — TEE-verified AI dispute resolution, user-chosen models, open-source prompts
- Open Society ($3,500) — Open financial infrastructure, fully decentralized, zero backend
- BONUS: Only on NEAR ($4,500) — Uses NEAR-native `env::ed25519_verify`, NEAR AI Cloud TEE, HOT Wallet

**Ecosystem tracks:**
- HOT Pay ($3,000) — Core payment integration via HOT Wallet
- NOVA ($3,000) — Maybe, for encrypted evidence storage
- PingPay ($1,500) — Maybe, as alternative payment

**Realistic target: $7,000–$11,000** (2-3 main tracks + bonus + HOT Pay)

**Maximum theoretical: $22,500** (all tracks)

## AI Track Continuation

> This NEAR bounty continues through PL_Genesis: Frontiers of Collaboration, where teams can keep building beyond the NEAR Innovation Sandbox hackathon. Eligible projects can win a $500 Best New or Continued Project prize, awarded for clear technical progress and improvement. Teams also gain exposure to a $100k+ total prize pool and a potential pathway into the Founders Forge early-stage startup accelerator.
