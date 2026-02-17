# Nescrowee

**Hackathon project · [NEAR Innovation Sandbox](https://near.org/sandbox) · Deadline: Feb 19, 2026**

**[Live Demo](https://nescrowee.vercel.app/)**

Trustless escrow platform for freelance contracts on NEAR blockchain with autonomous AI arbitration in Trusted Execution Environments (TEE). When disputes arise, an AI agent investigates evidence and chat history, produces a cryptographically signed resolution, and the smart contract verifies the TEE signature on-chain via Ed25519. No human mediators — 100% verifiable, tamper-proof dispute resolution.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser (Static on Vercel — zero backend)                         │
│                                                                     │
│  ┌──────────┐   ┌──────────────┐   ┌───────────┐   ┌───────────┐  │
│  │ HOT Kit  │   │ NEAR Social  │   │   NOVA    │   │ NEAR AI   │  │
│  │ Wallet   │   │   DB SDK     │   │   SDK     │   │ Cloud SDK │  │
│  └────┬─────┘   └──────┬───────┘   └─────┬─────┘   └─────┬─────┘  │
└───────┼────────────────┼────────────────┼───────────────┼──────────┘
        │                │                │               │
        ▼                ▼                ▼               ▼
  ┌──────────┐   ┌──────────────┐   ┌───────────┐   ┌──────────────┐
  │   NEAR   │   │  Social DB   │   │   NOVA    │   │ NEAR AI Cloud│
  │ Protocol │   │ (social.near)│   │ Encrypted │   │    (TEE)     │
  │          │   │              │   │  Storage  │   │              │
  │ Contract:│   │ • Chat msgs  │   │           │   │ • Private    │
  │ nescrowee│   │ • Evidence   │   │ • Per-     │   │   inference  │
  │ .near    │   │   metadata   │   │   contract│   │ • Ed25519    │
  │          │   │ • AI steps   │   │   encrypt │   │   signatures │
  │ • Escrow │   │ • Payment    │   │   groups  │   │ • Attestation│
  │ • Verify │   │   requests   │   │           │   │   reports    │
  │   Ed25519│   │              │   │ Contract: │   │              │
  │ • Release│   │              │   │ nova-sdk-6│   │ API:         │
  │   funds  │   │              │   │ .testnet  │   │ cloud-api    │
  └──────────┘   └──────────────┘   └───────────┘   │ .near.ai    │
                                                     └──────┬───────┘
                                                            │
                                    ┌───────────────────────┘
                                    ▼
                             ┌──────────────┐
                             │  Phala Cloud  │
                             │  (TEE Agent)  │
                             │              │
                             │ • Polls      │
                             │   disputes   │
                             │   every 15s  │
                             │ • Tool calls:│
                             │   read_chat  │
                             │   read_evid. │
                             │   get_mile.  │
                             │   list_evid. │
                             │ • Posts steps│
                             │   to Social  │
                             │   DB         │
                             │ • Submits    │
                             │   TEE-signed │
                             │   resolution │
                             └──────────────┘
```

### Dispute Resolution Flow

```
1. User raises dispute on-chain
2. Autonomous agent (Phala Cloud TEE) picks it up (15s polling)
3. Agent reads chat history + evidence from Social DB / NOVA
4. Browser anonymizes data (Party A/B, PII scrubbed) before sending to AI
5. NEAR AI Cloud (TEE) runs investigation with tool calling (up to 12 rounds)
6. Agent posts investigation steps to Social DB in real-time
7. AI produces resolution + Ed25519 signature
8. Agent submits signed resolution to smart contract
9. Contract verifies signature via env::ed25519_verify()
10. 48h acceptance window → finalize → release funds
```

### Payment Flow (HOT Pay)

```
Credit card → pay.hot-labs.org → USD→NEAR → relay account (nescrowee-relay.near)
    → Webhook (HMAC-SHA256 verified) → fund_contract() → milestone funded
```

**Zero Backend** — Browser calls NEAR AI Cloud directly, no server (only webhook for HOT Pay)
**Zero Oracle** — Ed25519 signatures replace oracle accounts (TEE signs, contract verifies)
**Zero Trust** — TEE attestation + on-chain verification = cryptographic proof. You only trust the NEAR blockchain and TEE hardware (Intel SGX, AMD SEV).

---

## Hackathon Tracks

### AI That Works For You — $3,500

**One bounded job end-to-end: dispute resolution.** User raises dispute → AI runs in TEE → resolution + Ed25519 signature → contract verifies → funds released.

- **Autonomous agent** deployed on Phala Cloud TEE with on-chain code hash verification. Keeps working after user closes the tab — polls `get_pending_disputes()` every 15 seconds
- **Native tool calling** (OpenAI-compatible API, not ReAct): `read_chat`, `read_evidence`, `get_milestone`, `list_evidence` — up to 12 tool calls per dispute
- **Posts investigation steps** to NEAR Social DB in real-time (message types: `ai_context`, `ai_step`, `ai_resolution`)
- **Clear boundaries:** agent can only propose a resolution for the disputed milestone; cannot spend funds without on-chain verification
- **Audit trail:** full on-chain record — dispute → resolution type → accept/finalize → release
- **User-owned data:** evidence in NOVA (user-controlled groups), chat in Social DB (inspectable, exportable)

### Private Web (NOVA) — $3,500

**Privacy is the default, not a mode.** Without TEE verification and encrypted evidence, the system wouldn't be safe for real money and sensitive project details.

- **Verified confidentiality:** AI dispute resolution runs in NEAR AI Cloud TEE — prompts, context, and outputs isolated inside the enclave. Ed25519 attestation proves resolution ran in genuine TEE
- **NOVA encrypted evidence:** per-contract encryption groups (`nescrowee-{contractId}`), client-side AES-256-GCM encryption, only dispute participants can decrypt. Contract: `nova-sdk-6.testnet`
- **Privacy-preserving anonymization:** client-side PII scrubbing before AI sees anything — accounts → "Party A / Party B", emails/phones/URLs/IPs/API keys all redacted. AI judges on facts, not identity
- **User-owned data:** inspect (Social DB, NOVA CIDs), export (retrieve from NOVA, read chat), delete (control what you post), revoke (group access)

### Open Society — $3,500

**Escrow as settlement infrastructure** with clear dispute handling and audit trail.

- **Settlement:** NEAR in escrow; custody in contract; dispute outcomes: Freelancer / Client / Split / ContinueWork
- **Reliability:** 48h payment-request timeout → auto-approve or dispute; 48h resolution acceptance → finalize; retries/timeouts in frontend and webhook
- **Auditability:** full on-chain trail — fund → milestones → payment requests → disputes → AI resolution → release. Chat/evidence metadata in Social DB
- **Open by default:** permissionless create/join/fund; composable contract (view methods, `fund_contract`)
- **Trustless arbitration:** no central authority, AI runs in TEE, open-source prompts with SHA-256 hashes on-chain, public attestation reports

### Only on NEAR (Bonus) — $4,500

**This couldn't exist on any other chain.** Deep integration across every NEAR-specific layer:

- **NEAR AI Cloud** — TEE-protected AI inference with Ed25519 signatures (no other L1 has native AI cloud)
- **NEAR Social DB** — Chat messages, evidence metadata, AI investigation steps, payment requests (`social.near`)
- **HOT Wallet SDK** — Web-based MPC wallet, no browser extension, WalletConnect, session persistence
- **Phala Cloud** — Autonomous Shade Agent deployment with verifiable code hash
- **Named accounts** — `alice.near` hires `bob.near`, human-readable everywhere
- **Sub-second finality + <$0.01 fees** — Makes micro-milestones viable

*Same flow on Ethereum: $50+ per tx, 12s blocks, no native AI cloud. On NEAR: one cent, one second.*

### HOT Pay — $3,000

**Core payment method, not a bolt-on.** Every milestone payment can go through HOT Pay.

- Fiat-to-NEAR gateway: credit card → NEAR tokens → escrow contract
- Relay account architecture: `nescrowee-relay.near` automates funding after HMAC-SHA256 + on-chain settlement verification
- Memo parsing: `mt-{contractId}-{milestoneId}` for automated routing
- *Will switch to HOT Pay direct contract calls (`authCall()`) once available — eliminates relay entirely*

---

## AI Models (TEE-Protected)

| Model | Speed | Pricing (in/out per M) | Use Case |
|-------|-------|------------------------|----------|
| **Qwen3 30B** | ~10s | $0.15 / $0.55 | Standard disputes (default) |
| **GPT-OSS 120B** | ~20s | $0.15 / $0.55 | Strong reasoning |
| **DeepSeek V3.1** | ~45s | $1.05 / $3.10 | Appeals (always) |
| **GLM-4.7** | ~25s | $0.85 / $3.30 | Hybrid reasoning |

Contract creators choose the standard dispute model. Appeals always use DeepSeek V3.1.

---

## Smart Contract

| | Address | Explorer |
|---|---------|---------|
| **Mainnet** | `nescrowee.near` | [nearblocks.io](https://nearblocks.io/address/nescrowee.near) |
| **Testnet** | `nescrowee.testnet` | [testnet.nearblocks.io](https://testnet.nearblocks.io/address/nescrowee.testnet) |

**View Methods:** `get_contract`, `get_contracts_by_account`, `get_contract_count`, `get_tee_addresses`, `get_pending_disputes`, `get_owner`

**Change Methods:** `create_contract`, `fund_contract`, `submit_milestone`, `raise_dispute`, `submit_ai_resolution`, `accept_resolution`, `appeal_resolution`

**Owner-only:** `register_tee_address`, `remove_tee_address`, `set_ai_processing_fee`

---

## Technologies

| Layer | Stack |
|-------|-------|
| **Blockchain** | NEAR Protocol, Rust + near-sdk 5.6.0, HOT Wallet SDK |
| **AI & Security** | NEAR AI Cloud (TEE), Phala Cloud (Shade Agent), Ed25519 signatures |
| **Data** | NEAR Social DB (chat/metadata), NOVA SDK (encrypted evidence) |
| **Payments** | HOT Pay (fiat on-ramp), HMAC-SHA256 webhook verification |
| **Frontend** | Vite, React 19, TypeScript, shadcn/ui, Tailwind CSS, Framer Motion, TanStack Query |
| **Deployment** | Vercel (frontend), Phala Cloud (agent), Bun (runtime) |

---

## Local Development

### Prerequisites
- [Bun](https://bun.sh) · [NEAR CLI](https://docs.near.org/tools/near-cli) · [Rust 1.86.0](https://rustup.rs)

### Setup
```bash
git clone https://github.com/ttarinov/milestone-trust.git
cd milestone-trust
bun install
cp .env.example .env
```

Required `.env` variables: `VITE_NEAR_NETWORK`, `VITE_NEAR_AI_KEY`, `VITE_NOVA_API_KEY`, `VITE_HOT_PAY_ITEM_ID`

### Run
```bash
bun run dev              # Frontend → http://localhost:5173
cd agent && bun run index.ts  # Autonomous agent
```

### Build & Deploy Contract
```bash
cd contract
rustup run 1.86.0 cargo build --target wasm32-unknown-unknown --release
near deploy nescrowee.testnet ./target/wasm32-unknown-unknown/release/nescrowee.wasm
near call nescrowee.testnet new '{"owner": "your-account.testnet"}' --accountId your-account.testnet
```

### Tests
```bash
bun test                          # All frontend tests
bun test src/test/parser.test.ts  # Parser tests
cd agent && bun run test.ts all   # Agent tests (4 scenarios)
```

---

## Key Files

| File | Purpose |
|------|---------|
| `contract/src/lib.rs` | Contract state, TEE address management |
| `contract/src/dispute.rs` | Ed25519 verification, dispute lifecycle |
| `src/near/wallet.ts` | HOT Wallet integration |
| `src/utils/anonymize.ts` | Data anonymization (PII scrubbing) |
| `src/agent/client.ts` | NEAR AI Cloud HTTP client (browser-side) |
| `api/hot-pay-webhook.ts` | HOT Pay webhook + relay account |

---

## Links

| | |
|---|---|
| **Live App** | https://nescrowee.vercel.app |
| **NEAR AI Cloud** | https://cloud.near.ai |
| **HOT Wallet** | https://hot-labs.org |
| **HOT Pay** | https://pay.hot-labs.org |
| **NOVA Docs** | https://nova-25.gitbook.io/nova-docs |
| **Phala Cloud** | https://cloud.phala.network |
| **NEAR SDK Docs** | https://docs.near.org/sdk/rust/introduction |

---

MIT License — See [LICENSE](./LICENSE)

Built for **NEAR Innovation Sandbox Hackathon**

**Trust math, not servers.**
