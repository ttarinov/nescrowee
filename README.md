# Nescrowee

**🌐 [Live Demo](https://nescrowee.vercel.app/)**

**Trustless escrow platform for freelance contracts on NEAR blockchain with autonomous AI arbitration in Trusted Execution Environments (TEE).**

When disputes arise, an AI agent investigates evidence and chat history, produces a cryptographically signed resolution, and the smart contract verifies the TEE signature on-chain using Ed25519. No human mediators needed—100% verifiable, tamper-proof dispute resolution.

### 🚀 Key Technical Achievements

- **🔐 HOT Wallet (MPC Wallet)** — Web-based authentication without browser extensions. WalletConnect integration, session persistence, direct NEAR transaction signing.

- **💳 HOT Pay Relay Architecture** — Webhook verifies HMAC-SHA256 + on-chain settlement, then relay account funds the contract. Credit card → NEAR → escrow (trustless). *Will switch to HOT Pay's direct contract funding once available.*

- **🛡️ Privacy-Preserving AI** — Client-side data anonymization before sending to AI. Scrubs all PII (emails, phones, URLs, accounts). "Party A vs Party B" prevents bias. GDPR-compliant.

---

## 🏆 NEAR Innovation Sandbox Hackathon

**Submission for NEAR Innovation Sandbox (Deadline: Feb 19, 2026)**

### Tracks Targeted

✅ **AI That Works For You**
- Autonomous AI agent resolves disputes without human intervention
- Agent deployed on Phala Cloud TEE with on-chain code hash verification
- Native tool calling (OpenAI-compatible API) with 4 tools: `read_chat`, `read_evidence`, `get_milestone`, `list_evidence`
- Multi-round investigation with up to 12 tool calls per dispute
- Posts investigation steps to NEAR Social DB in real-time

✅ **Private Web (NOVA)**
- End-to-end encrypted evidence storage using NOVA SDK
- Per-contract encryption groups: `nescrowee-{contractId}`
- Sensitive documents (contracts, invoices, screenshots) encrypted client-side
- Only dispute participants can decrypt evidence
- NOVA testnet: `nova-sdk-6.testnet`

✅ **Open Society**
- Trustless arbitration—no central authority or human mediators
- AI runs in TEE (isolated secure environment), cryptographically verifiable
- Open-source prompts with SHA-256 hashes stored on-chain
- Public attestation reports prove TEE authenticity
- Anyone can verify Ed25519 signatures on-chain

✅ **Only on NEAR Bonus**
- **NEAR Social DB** — Chat messages, evidence metadata, AI investigation steps
- **HOT Wallet SDK** — Web-based MPC wallet (no browser extension)
- **NEAR AI Cloud** — TEE-protected AI inference gateway
- **Phala Cloud** — Autonomous Shade Agent deployment
- **Smart Contract** — Rust + near-sdk 5.6.0

✅ **HOT Pay Integration**
- Fiat-to-NEAR payment gateway for contract funding
- Credit card → NEAR tokens → escrow contract
- Webhook integration (HMAC-SHA256 verification)
- Relay account for automated funding (will switch to HOT Pay direct funding once available)
- Checkout flow: `pay.hot-labs.org/payment?item_id=...&amount=...&memo=mt-{contractId}-{milestoneId}`

---

## 🛠 Technologies Used

### Blockchain Layer
- **NEAR Protocol** — Layer-1 blockchain (PoS, sharding, human-readable accounts)
- **Smart Contract** — Rust + `near-sdk 5.6.0`
  - Mainnet: `nescrowee.near` ([Explorer](https://nearblocks.io/address/nescrowee.near))
  - Testnet: `nescrowee.testnet` ([Explorer](https://testnet.nearblocks.io/address/nescrowee.testnet))
- **HOT Wallet SDK** — Web wallet (MPC, no extension needed)

### AI & Security
- **NEAR AI Cloud** — TEE-protected AI inference
  - Models: DeepSeek V3.1, Qwen3 30B, GPT-OSS 120B, GLM-4.7
  - Ed25519 cryptographic signatures for every AI response
  - API: `https://cloud-api.near.ai/v1/chat/completions`
  - Attestation: `https://cloud-api.near.ai/v1/attestation/report`
- **Phala Cloud TEE** — Autonomous Shade Agent deployment
  - Hono web framework for HTTP endpoints
  - 15-second polling loop for pending disputes
  - Native OpenAI-compatible tool calling (not ReAct)
  - Verifiable code hash on-chain

### Data Storage
- **NEAR Social DB** — Decentralized social graph
  - Contract: `social.near` (mainnet), `v1.social08.testnet` (testnet)
  - Message types: `text`, `evidence`, `ai_resolution`, `ai_context`, `ai_step`, `payment_request`, `payment_approved`
- **NOVA (Private Web)** — Encrypted file storage
  - SDK: `nova-sdk-js` v1.0.3
  - Testnet contract: `nova-sdk-6.testnet`
  - Docs: https://nova-25.gitbook.io/nova-docs/nova-sdk-js

### Payments
- **HOT Pay** — Fiat-to-NEAR gateway
  - Webhook endpoint: `api/hot-pay-webhook.ts` (Vercel serverless)
  - HMAC-SHA256 signature verification
  - Dashboard: https://pay.hot-labs.org

### Frontend Stack
- **Vite** — Build tool
- **React 19** — UI framework
- **TypeScript** — Type safety
- **shadcn/ui** — Component library
- **Tailwind CSS** — Styling
- **Framer Motion** — Animations
- **React Router** — Client-side routing
- **TanStack Query** — Server state management
- **Bun** — Package manager & runtime

### Deployment
- **Vercel** — Static hosting (frontend only, no backend)
- **Phala Cloud** — Autonomous agent (Shade Agent)

---

## 🔐 Architecture

```
Browser (Static on Vercel)
    ↓
NEAR AI Cloud (TEE) → Ed25519 Signature
    ↓
Smart Contract (nescrowee.near) → env::ed25519_verify()
    ↓
Funds Released (Escrow → Winner)

Evidence: NOVA (encrypted) + Social DB (chat/metadata)
Payments: HOT Pay → Webhook → Relay Account → fund_contract()
Agent: Phala Cloud TEE (polls, investigates, submits resolution)
```

### Trustless = Cryptographically Verifiable

1. **TEE (Trusted Execution Environment)** — AI runs in isolated hardware, code can't be modified
2. **Ed25519 Signatures** — Every AI response is signed, verified on-chain
3. **Attestation Reports** — Prove the AI is running in genuine TEE hardware
4. **Smart Contract Verification** — `env::ed25519_verify()` checks signature before executing resolution

**No trust required in:**
- ❌ The AI provider (signature proves authenticity)
- ❌ The frontend host (Vercel just serves static files)
- ❌ The agent operator (TEE ensures code integrity)

**You only trust:**
- ✅ The NEAR blockchain (already decentralized)
- ✅ TEE hardware manufacturers (Intel SGX, AMD SEV — industry standard)

---

## 🔑 HOT Wallet Integration (Authentication)

We use **HOT Kit SDK** (`@hot-labs/kit`) for wallet authentication — a web-based MPC wallet that works without browser extensions.

### How Authentication Works

**1. Initialization**
```typescript
import { HotKit, WalletType } from "@hot-labs/kit";
import NearPlugin from "@hot-labs/kit/near";

const kit = new HotKit({
  apiKey: VITE_HOT_PAY_API_KEY,
  connectors: [NearPlugin()],
  walletConnect: {
    projectId: WALLETCONNECT_PROJECT_ID,
    metadata: {
      name: "Nescrowee",
      description: "Milestone escrow with AI dispute resolution",
      url: window.location.origin,
      icons: ["/favicon.ico"],
    },
  },
});
```

**2. Connect Wallet**
```typescript
const wallet = await kit.connect(WalletType.NEAR);
const accountId = kit.near.address; // e.g., "user.near"
```

**3. Sign Transactions**
```typescript
await kit.near.sendTransaction({
  receiverId: "nescrowee.near",
  actions: [{
    type: "FunctionCall",
    params: {
      methodName: "create_contract",
      args: { title: "...", milestones: [...] },
      gas: "300000000000000",
      deposit: "0",
    },
  }],
});
```

**4. Session Persistence**
- Account ID stored in `localStorage` under key `hot:near-account`
- Automatic reconnection on page reload
- Graceful error handling with retry logic

**Key Features:**
- ✅ **No browser extension** — Works in any browser
- ✅ **MPC wallet** — Multi-party computation for security
- ✅ **WalletConnect** — Standard protocol for wallet connections
- ✅ **Session management** — Persistent login across page reloads
- ✅ **Transaction signing** — Direct integration with NEAR smart contracts

**Implementation:** `src/near/wallet.ts:1-120`

---

## 💳 HOT Pay Integration (Fiat On-Ramp)

HOT Pay enables users to fund contracts with **credit cards** instead of buying NEAR tokens manually. We implemented a **relay account architecture** for automated payment processing.

### Architecture: Relay Account

**Current Implementation:**

1. **Relay Account:** `nescrowee-relay.near` (or `.testnet`)
2. **Access:** Currently uses full access key (secure because private key stored server-side only)
3. **Automated:** Receives HOT Pay settlement → calls `fund_contract()` automatically

**Security Measures:**
- ✅ Webhook verifies HMAC-SHA256 signature from HOT Pay
- ✅ Webhook verifies settlement transaction on-chain before relaying
- ✅ Only processes successful payments (`status: "SUCCESS"`)
- ✅ Private key stored securely in Vercel environment variables

**Future Improvement:**
- 🔄 Will switch to **HOT Pay direct contract calls** (`authCall()`) once available
- 🔄 This will eliminate the relay account entirely (HOT Pay calls contract directly)
- 🔄 Even more trustless (no intermediary account needed)

### Payment Flow

```
1. User clicks "Fund with HOT Pay"
   ↓
2. Redirected to pay.hot-labs.org/payment?item_id=...&amount=...&memo=mt-{contractId}-{milestoneId}
   ↓
3. User pays with credit card (Stripe)
   ↓
4. HOT Pay converts USD → NEAR tokens
   ↓
5. HOT Pay sends NEAR to relay account (nescrowee-relay.near)
   ↓
6. HOT Pay sends webhook to api/hot-pay-webhook.ts (Vercel)
   ↓
7. Webhook verifies:
   - HMAC-SHA256 signature (x-hot-pay-signature header)
   - Settlement transaction on-chain (fetch from NEAR RPC)
   - Amount matches webhook payload
   - Transaction succeeded
   ↓
8. Webhook calls relay account:
   near.account(relayAccountId).functionCall({
     contractId: "nescrowee.near",
     methodName: "fund_contract",
     args: { contract_id: contractId },
     attachedDeposit: event.amount,
   })
   ↓
9. Contract receives funds, updates milestone status to "Funded"
```

### Webhook Security (api/hot-pay-webhook.ts)

**1. HMAC-SHA256 Signature Verification**
```typescript
const signature = req.headers["x-hot-pay-signature"];
const expected = crypto.createHmac("sha256", HOT_PAY_WEBHOOK_SECRET)
  .update(rawBody)
  .digest("hex");

if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
  return res.status(401).json({ error: "Invalid signature" });
}
```

**2. On-Chain Settlement Verification**
```typescript
// Fetch transaction from NEAR RPC
const tx = await fetch(nodeUrl, {
  method: "POST",
  body: JSON.stringify({
    method: "tx",
    params: { tx_hash: event.near_trx, sender_account_id: relayAccountId },
  }),
});

// Verify:
// - Recipient is relay account
// - Amount matches webhook payload
// - Transaction succeeded (no Failure status)
```

**3. Memo Parsing**
```typescript
// Memo format: mt-{contractId}-{milestoneId}
// Example: mt-0-0
const match = memo.match(/^mt-([^-]+)-(.+)$/);
```

**Why This Matters:**
- ✅ **Trustless** — No human approval needed
- ✅ **Verifiable** — Every step verified on-chain (HMAC signature + settlement tx)
- ✅ **Automated** — Credit card payment → contract funded in minutes
- ✅ **Transparent** — All transactions visible on NEAR Explorer

**Implementation:** `api/hot-pay-webhook.ts:1-177`

---

## 🔒 Data Anonymization (Privacy-Preserving AI)

Before sending dispute context to NEAR AI Cloud, we **anonymize all personal information** in the browser. This protects user privacy while still allowing the AI to resolve disputes fairly.

### What Gets Anonymized

**1. Account IDs → Party A / Party B**
```
Before: "alice.near vs bob.near"
After:  "Party A (Client) vs Party B (Freelancer)"
```

**2. NEAR Accounts**
```
Before: "Send payment to charlie.near"
After:  "Send payment to [ACCOUNT]"
```

**3. Personal Identifiable Information (PII)**
- **Emails:** `user@example.com` → `[EMAIL]`
- **Phone Numbers:** `+1-555-1234` → `[PHONE]`
- **URLs:** `https://example.com/secret` → `[URL]`
- **IP Addresses:** `192.168.1.1` → `[IP]`
- **Hashes/Keys:** `0xabc123...` → `[HASH]`
- **API Keys:** `sk-abc123...` → `[API_KEY]`

**4. Chat History**
```
Before:
  [alice.near]: "I sent you the invoice at alice@gmail.com"
  [bob.near]: "I paid you at https://bank.com/transfer/xyz"

After:
  [Party A]: "I sent you the invoice at [EMAIL]"
  [Party B]: "I paid you at [URL]"
```

**5. Evidence Files**
- File names preserved (e.g., "invoice.pdf")
- File content scrubbed using same rules
- NOVA decryption happens in browser (never sent to AI unencrypted)

### Anonymization Algorithm

```typescript
function anonymizeDisputeContext(params) {
  const scrub = (text: string): string => {
    let cleaned = text;

    // Replace specific accounts first (most specific → least specific)
    cleaned = cleaned.replace(/client\.near/gi, "Party A");
    cleaned = cleaned.replace(/freelancer\.near/gi, "Party B");

    // Then scrub all remaining NEAR accounts
    cleaned = cleaned.replace(/\b[\w-]+\.near\b/gi, "[ACCOUNT]");

    // Remove PII
    cleaned = cleaned.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "[EMAIL]");
    cleaned = cleaned.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[PHONE]");
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "[URL]");
    cleaned = cleaned.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP]");
    cleaned = cleaned.replace(/\b[0-9a-f]{40,}\b/gi, "[HASH]");
    cleaned = cleaned.replace(/\b(sk|pk|api|key|secret|token)[-_][\w-]{20,}\b/gi, "[API_KEY]");

    return cleaned;
  };

  // Anonymize contract, milestone, dispute, chat, evidence
  return {
    contract: scrub(contract),
    milestone: scrub(milestone),
    dispute: scrub(dispute),
    chatHistory: chatHistory.map(msg => ({
      sender: msg.sender === client ? "Party A" : "Party B",
      content: scrub(msg.content),
    })),
    evidence: evidence.map(file => ({
      fileName: file.fileName,
      content: scrub(file.content),
    })),
  };
}
```

### Why This Matters

**1. Privacy-First Design**
- AI never sees real account IDs, emails, or phone numbers
- TEE signature proves AI didn't leak data (isolated environment)
- Anonymization happens in browser (never sent unencrypted)

**2. Fair Dispute Resolution**
- AI judges based on **facts and evidence**, not identity
- "Party A vs Party B" prevents bias based on reputation
- Contract terms and milestone descriptions remain intact

**3. GDPR Compliance**
- PII scrubbed before leaving the browser
- Evidence decrypted in browser, scrubbed, then sent to AI
- No personal data stored in AI logs

**4. Open-Source Transparency**
- Anonymization code is public (`src/utils/anonymize.ts`)
- Anyone can verify what gets scrubbed
- SHA-256 prompt hashes ensure AI prompts aren't tampered with

**Example Anonymized Output:**

```
Contract Title: Website Redesign Project
Contract Description: [Party A] needs a new website built by [Party B]

Disputed Milestone: Homepage Design
Milestone Description: Deliver 3 mockups for homepage layout
Milestone Amount: 5.0 NEAR

Dispute raised by: Party A (Client)
Reason: Freelancer delivered late and designs don't match requirements

--- Chat History (anonymized) ---
[Party A]: I sent the requirements doc at [EMAIL] on [DATE]
[Party B]: I delivered the mockups at [URL], check the folder
[Party A]: These don't match what we agreed on. See original contract.
[Party B]: I followed the specs exactly. This is unfair.

--- Evidence Files (encrypted via NOVA, decrypted for analysis) ---
[File: requirements.pdf]
(PDF content with URLs, emails, accounts all scrubbed)

[File: mockup-v1.png]
(Image analyzed by AI, but metadata scrubbed)
```

**Implementation:** `src/utils/anonymize.ts:1-75`

---

## 📝 Smart Contract Details

### Mainnet Deployment

**Contract:** `nescrowee.near`
**Owner:** `nescrowee.near`
**Explorer:** https://nearblocks.io/address/nescrowee.near

**Verify Contract:**
```bash
near view nescrowee.near get_owner
# Returns: "nescrowee.near"

near view nescrowee.near get_contract_count
# Returns total number of contracts created
```

### Testnet Deployment

**Contract:** `nescrowee.testnet`
**Explorer:** https://testnet.nearblocks.io/address/nescrowee.testnet

**Test it out:**
```bash
# View a contract
near view nescrowee.testnet get_contract '{"contract_id": "0"}'

# Check TEE addresses
near view nescrowee.testnet get_tee_addresses
```

### Contract Methods

**View Methods (Read-only, free):**
- `get_contract(contract_id: String)` — Get contract details
- `get_contracts_by_account(account_id: AccountId)` — User's contracts
- `get_contract_count()` — Total contracts created
- `get_tee_addresses()` — Registered TEE signing addresses
- `get_pending_disputes()` — Disputes awaiting AI investigation
- `get_owner()` — Contract owner

**Change Methods (Require transaction):**
- `create_contract(...)` — Create new escrow contract
- `fund_contract(contract_id, milestone_id)` — Fund a milestone
- `submit_milestone(contract_id, milestone_id)` — Mark milestone complete
- `raise_dispute(contract_id, milestone_id, reason)` — Raise a dispute
- `submit_ai_resolution(contract_id, ...)` — Submit TEE-signed resolution
- `accept_resolution(contract_id)` — Accept AI resolution
- `appeal_resolution(contract_id)` — Appeal to DeepSeek V3.1

**Owner-only Methods:**
- `register_tee_address(address: Vec<u8>)` — Register TEE public key
- `remove_tee_address(address: Vec<u8>)` — Remove TEE public key
- `set_ai_processing_fee(fee: U128)` — Set dispute resolution fee

---

## 🤖 AI Models (TEE-Protected)

All models run in Trusted Execution Environments with Ed25519 signatures.

| Model | ID | Speed | Pricing (in/out per M tokens) | Use Case |
|-------|------|-------|-------------------------------|----------|
| **Qwen3 30B** | `Qwen/Qwen3-30B-A3B-Instruct-2507` | ~10s | $0.15 / $0.55 | Standard disputes (default) |
| **GPT-OSS 120B** | `openai/gpt-oss-120b` | ~20s | $0.15 / $0.55 | Strong reasoning |
| **DeepSeek V3.1** | `deepseek-ai/DeepSeek-V3.1` | ~45s | $1.05 / $3.10 | Appeals (always) |
| **GLM-4.7** | `zai-org/GLM-4.7` | ~25s | $0.85 / $3.30 | Hybrid reasoning |

Contract creators choose the standard dispute model. **Appeals always use DeepSeek V3.1** for maximum thoroughness.

### Verify TEE Attestation

```bash
# Get attestation report (no auth required)
curl "https://cloud-api.near.ai/v1/attestation/report?model=deepseek-ai/DeepSeek-V3.1&signing_algo=ed25519"
```

Response contains the public key used to sign AI responses. Match it against the `tee_signing_address` stored on-chain.

---

## 🚀 How to Explore the Project

### Option 1: Live Demo (Mainnet)

1. **Visit:** https://nescrowee.vercel.app2. **Connect Wallet:** Click "Connect Wallet" (HOT Wallet)
3. **Create Contract:**
   - Go to "Create Contract"
   - Fill in title, description, milestones
   - Choose AI model (e.g., Qwen3 30B)
   - Set dispute fund percentage (10-30%)
   - Submit transaction
4. **Fund via HOT Pay:**
   - Click "Fund Milestone" → Choose HOT Pay
   - Pay with credit card (fiat → NEAR conversion)
5. **Test Dispute:**
   - Submit milestone
   - Raise dispute
   - Upload encrypted evidence (NOVA)
   - Chat with counterparty (Social DB)
   - Trigger AI investigation (autonomous agent)
   - Review TEE-signed resolution

### Option 2: Verify Smart Contract

**Check contract on NEAR Explorer:**
- Mainnet: https://nearblocks.io/address/nescrowee.near
- Testnet: https://testnet.nearblocks.io/address/nescrowee.testnet

**View contract state:**
```bash
# Mainnet
near view nescrowee.near get_contract_count

# Testnet
near view nescrowee.testnet get_contract '{"contract_id": "0"}'
```

### Option 3: Verify Autonomous Agent

**Agent is deployed on Phala Cloud TEE**
- Polls `get_pending_disputes()` every 15 seconds
- Investigates using tool calls (`read_chat`, `read_evidence`, `get_milestone`, `list_evidence`)
- Submits resolution with TEE signature
- Posts investigation steps to Social DB

**Check agent activity:**
```bash
# View pending disputes
near view nescrowee.testnet get_pending_disputes

# View Social DB messages (agent posts ai_context, ai_step, ai_resolution)
# See src/near/social.ts for message structure
```

### Option 4: Verify NOVA Encrypted Evidence

**NOVA Contract:** `nova-sdk-6.testnet`
**Encryption:** Client-side AES-256-GCM
**Groups:** `nescrowee-{contractId}` per contract

**Example:**
```typescript
import { NovaClient } from '@/nova/client';

const nova = new NovaClient();
await nova.joinGroup(`nescrowee-${contractId}`);
const files = await nova.listGroupFiles(`nescrowee-${contractId}`);
// Only dispute participants can decrypt
```

### Option 5: Verify HOT Pay Integration

**Dashboard:** https://pay.hot-labs.org
**Webhook:** `api/hot-pay-webhook.ts` (Vercel serverless)

**Payment flow:**
1. User clicks "Fund with HOT Pay"
2. Redirected to `pay.hot-labs.org/payment?item_id=...&amount=...&memo=mt-{contractId}-{milestoneId}`
3. Pays with credit card → NEAR tokens
4. HOT Pay sends webhook → Vercel function
5. Verifies HMAC-SHA256 signature
6. Relay account calls `fund_contract(contractId, milestoneId)`

**Verify webhook:**
```bash
# Check Vercel function logs
vercel logs api/hot-pay-webhook
```

---

## 🛠 Local Development

### Prerequisites
- **Bun** — https://bun.sh
- **NEAR CLI** — `npm install -g near-cli`
- **Rust 1.86.0** — `rustup install 1.86.0`

### Setup

```bash
# Clone repo
git clone https://github.com/ttarinov/milestone-trust.git
cd milestone-trust

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

Required in `.env`:
```bash
VITE_NEAR_NETWORK=testnet  # or mainnet
VITE_NEAR_AI_KEY=sk-...    # Get from cloud.near.ai
VITE_NOVA_API_KEY=...      # Get from nova-sdk
VITE_HOT_PAY_ITEM_ID=...   # Get from pay.hot-labs.org
```

### Run Frontend

```bash
bun run dev
# Open http://localhost:5173
```

### Build & Deploy Smart Contract

```bash
cd contract

# Build (requires Rust 1.86.0)
rustup run 1.86.0 cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
near deploy nescrowee.testnet ./target/wasm32-unknown-unknown/release/nescrowee.wasm

# Initialize contract
near call nescrowee.testnet new '{"owner": "your-account.testnet"}' --accountId your-account.testnet

# Register TEE address (get from attestation endpoint)
near call nescrowee.testnet register_tee_address '{"address": [1,2,3,...]}' --accountId your-account.testnet
```

### Run Autonomous Agent Locally

```bash
cd agent

# Set env var
export NEAR_AI_KEY=sk-...

# Run agent
bun run index.ts

# Test agent (4 scenarios)
bun run test.ts all
```

### Run Tests

```bash
# Frontend tests
bun test

# Parser tests
bun test src/test/parser.test.ts

# Agent tests
cd agent && bun run test.ts all
```

---

## 📁 Key Files

**Smart Contract (Rust):**
- `contract/src/lib.rs` — Contract state, TEE address management
- `contract/src/dispute.rs` — Ed25519 verification, dispute lifecycle

**Frontend (TypeScript + React):**
- `src/near/wallet.ts` — HOT Wallet integration (MPC wallet, transaction signing)
- `src/utils/anonymize.ts` — Data anonymization (Party A/B, PII scrubbing)
- `src/agent/client.ts` — NEAR AI Cloud HTTP client (browser-side)
- `api/hot-pay-webhook.ts` — HOT Pay webhook + relay account

---

## 🔗 Links & Resources

### Live Project
- **Frontend:** https://nescrowee.vercel.app- **Mainnet Contract:** https://nearblocks.io/address/nescrowee.near
- **Testnet Contract:** https://testnet.nearblocks.io/address/nescrowee.testnet

### NEAR Ecosystem
- **NEAR AI Cloud:** https://cloud.near.ai
- **NEAR Social DB:** https://social.near.org
- **HOT Wallet:** https://hot-labs.org
- **HOT Pay:** https://pay.hot-labs.org
- **NOVA Docs:** https://nova-25.gitbook.io/nova-docs
- **Phala Cloud:** https://cloud.phala.network

### Documentation
- **NEAR SDK:** https://docs.near.org/sdk/rust/introduction
- **Ed25519 Verification:** https://docs.near.org/sdk/rust/contract-interface/environment#ed25519-verification
- **NEAR Social DB:** https://docs.near.org/social/contract
- **HOT Wallet SDK:** https://docs.hot-labs.org

### Hackathon
- **NEAR Innovation Sandbox:** https://pages.near.org/hackathon
- **Deadline:** Feb 19, 2026
- **Tracks:** AI That Works For You, Private Web (NOVA), Open Society, Only on NEAR, HOT Pay

---

## 🧪 Testing the Project

### Test Contract Creation
1. Connect HOT Wallet
2. Create a contract with 2-3 milestones
3. Invite counterparty (optional)
4. Submit transaction
5. Verify on-chain: `near view nescrowee.testnet get_contract '{"contract_id": "YOUR_ID"}'`

### Test HOT Pay Funding
1. Create contract
2. Click "Fund Milestone" → "Pay with HOT Pay"
3. Complete credit card payment
4. Wait for webhook → relay → on-chain funding
5. Verify: `near view nescrowee.testnet get_contract '{"contract_id": "YOUR_ID"}'` (check `funded_amount`)

### Test NOVA Evidence Upload
1. Raise dispute
2. Click "Upload Evidence"
3. Select file (PDF, image, etc.)
4. Client-side encryption → upload to NOVA
5. Evidence metadata posted to Social DB
6. Only participants can decrypt

### Test Autonomous Agent Investigation
1. Raise dispute
2. Upload evidence + chat messages
3. Browser posts `ai_context` to Social DB
4. Wait for agent to pick it up (15s polling interval)
5. Agent investigates using tools
6. Agent posts `ai_step` messages to Social DB
7. Agent submits TEE-signed resolution on-chain
8. Browser polls for resolution

### Test Ed25519 Signature Verification
1. Get attestation report:
   ```bash
   curl "https://cloud-api.near.ai/v1/attestation/report?model=deepseek-ai/DeepSeek-V3.1&signing_algo=ed25519"
   ```
2. Extract public key from response
3. Verify matches `tee_signing_address` in contract dispute
4. Smart contract runs `env::ed25519_verify()` automatically

---

## 🎯 Key Innovations

### Technical Innovations

1. **Zero Backend** — Browser calls NEAR AI Cloud directly, no server needed (only webhook for HOT Pay)
2. **Zero Oracle** — Ed25519 signatures replace oracle accounts (TEE signs, contract verifies on-chain)
3. **Zero Trust** — TEE attestation + on-chain verification = cryptographic proof (no trust assumptions)
4. **Autonomous Agent** — Deployed on Phala Cloud TEE, polls disputes, investigates using tool calls, submits resolutions
5. **Encrypted Evidence** — NOVA end-to-end encryption for sensitive documents (per-contract groups)
6. **Open Prompts** — SHA-256 hashes on-chain, full transparency (anyone can verify AI prompts)

### Integration Innovations

7. **HOT Wallet Authentication (MPC Wallet)**
   - Web-based wallet, no browser extension needed
   - WalletConnect integration for standard protocol
   - Session persistence across page reloads
   - Direct transaction signing with NEAR smart contracts
   - Implementation: `@hot-labs/kit` + NEAR plugin

8. **HOT Pay Relay Architecture (Trustless Fiat On-Ramp)**
   - Relay account automates funding after payment verification
   - Webhook verifies HMAC-SHA256 signature + on-chain settlement tx before relaying
   - Credit card → NEAR tokens → escrow contract (fully automated)
   - Future: Will switch to HOT Pay direct contract calls (authCall) once available
   - Zero trust required in HOT Pay (all verifiable on-chain)

9. **Privacy-Preserving AI Arbitration (Data Anonymization)**
   - Client-side anonymization before sending to AI (Party A / Party B instead of real accounts)
   - Scrubs all PII: emails, phones, URLs, IPs, API keys, hashes
   - Chat history sender names anonymized
   - NOVA evidence decrypted → scrubbed → sent to AI (never sent unencrypted)
   - AI judges on facts, not identity (prevents bias)
   - GDPR-compliant (no PII in AI logs)

---

## 📄 License

MIT License — See [LICENSE](./LICENSE)

---

## 🙏 Acknowledgments

Built for **NEAR Innovation Sandbox Hackathon**

**Technologies:**
- NEAR Protocol
- NEAR AI Cloud (TEE)
- NEAR Social DB
- NOVA (Private Web)
- HOT Wallet SDK
- HOT Pay
- Phala Cloud

**Tracks:**
- AI That Works For You
- Private Web (NOVA)
- Open Society
- Only on NEAR Bonus
- HOT Pay

---

**Trust math, not servers. 🚀**
