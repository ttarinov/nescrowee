# Nescrowee

Decentralized freelance escrow on NEAR Protocol with TEE-verified AI dispute resolution. Zero backend. Zero oracle. Trust math, not servers.

## Deploy & Test

See **[DEPLOY.md](./DEPLOY.md)** for setup, deployment, and testing instructions.

## Architecture

```
Browser → NEAR AI Cloud (TEE) → Ed25519 signature → Smart Contract verifies on-chain
```

1. User's browser calls NEAR AI Cloud directly
2. AI runs inside TEE hardware, signs every response with Ed25519
3. Browser submits `{response + TEE signature}` to the smart contract
4. Contract calls `env::ed25519_verify` — cryptographic proof the AI produced this response
5. Resolution stored on-chain with full TEE proof for transparency

No Vercel. No serverless functions. No oracle accounts. No trust assumptions.

## Tech Stack

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Smart Contract**: NEAR Protocol (Rust, near-sdk)
- **AI**: NEAR AI Cloud (TEE-protected inference with Ed25519 signatures)
- **Wallet**: HOT Wallet (MPC wallet)
- **Architecture**: Fully decentralized — all logic on-chain or in-browser

## Setup

```sh
git clone <repo-url>
cd nescrowee
bun install
```

### Environment Variables

```sh
cp .env.example .env
```

Required:
- `VITE_NEAR_AI_KEY` — NEAR AI Cloud API key (get from cloud.near.ai)
- `VITE_NEAR_NETWORK` — `testnet` or `mainnet` (default: `testnet`)

### Development

```sh
bun run dev
```

### Smart Contract

```sh
cd contract
cargo build --target wasm32-unknown-unknown --release
```

Deploy and initialize:
```sh
near deploy nescrowee.testnet ./target/wasm32-unknown-unknown/release/nescrowee.wasm
near call nescrowee.testnet new '{"owner": "your-account.testnet"}' --accountId your-account.testnet
```

Register the TEE signing address (get from NEAR AI attestation endpoint):
```sh
near call nescrowee.testnet register_tee_address '{"address": [<bytes>]}' --accountId your-account.testnet
```

## AI Models (TEE-Protected)

| Model | Speed | Pricing (in/out per M tokens) | Use |
|-------|-------|-------------------------------|-----|
| Qwen3 30B | ~10s | $0.15 / $0.55 | Standard disputes (default) |
| GPT-OSS 120B | ~20s | $0.15 / $0.55 | Strong reasoning |
| DeepSeek V3.1 | ~45s | $1.05 / $3.10 | Appeals (always) |
| GLM-4.7 | ~25s | $0.85 / $3.30 | Hybrid reasoning |

Contract creators choose the standard dispute model. Appeals always use DeepSeek V3.1 for maximum thoroughness.

## TEE Verification

Anyone can independently verify the TEE attestation:

```sh
# No authentication needed
curl "https://cloud-api.near.ai/v1/attestation/report?model=deepseek-ai/DeepSeek-V3.1&signing_algo=ed25519"
```

The response contains the public key used to sign AI responses. Match it against the `tee_signing_address` stored on-chain in each dispute resolution.

## Dispute Flow

1. Party raises dispute on-chain
2. Browser anonymizes chat history (Party A / Party B), scrubs PII
3. Browser calls NEAR AI Cloud with open-source prompt
4. Gets Ed25519 TEE signature on response
5. Submits resolution + signature to smart contract
6. Contract verifies signature, stores resolution
7. Parties accept or appeal (appeal uses DeepSeek V3.1)
8. Auto-executes after 48 hours if not accepted sooner

## Prompt Transparency

AI prompts are open-source in `src/prompts/`. SHA-256 hashes are stored on-chain at contract creation. Anyone can verify the exact prompt used for any dispute.

## Project Structure

```
contract/           # NEAR smart contract (Rust)
  src/
    lib.rs          # Contract state, TEE address management
    dispute.rs      # Ed25519 verification, dispute lifecycle
    types.rs        # Data structures with TEE fields
    escrow.rs       # Funding, milestone management
    milestone.rs    # Milestone lifecycle
src/
  near/
    ai.ts           # Browser-direct NEAR AI Cloud client
    contract.ts     # Smart contract interaction
    wallet.ts       # HOT Wallet integration
    config.ts       # Network configuration
  utils/
    anonymize.ts    # Browser-side PII scrubbing
    promptHash.ts   # SHA-256 prompt hashing
  prompts/
    standard.md     # Standard dispute resolution prompt
    appeal.md       # Appeal resolution prompt
  pages/
    ContractDetail  # Chat + dispute UI with TEE flow
    CreateContract  # Contract creation with model picker
    HowDisputesWork # TEE verification explainer
  types/
    contract.ts     # TypeScript types + model definitions
```
