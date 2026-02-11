# NEAR Integration Ideas — Milestone Trust (Escrow + Disputes)

Ideas for NEARCON Innovation Sandbox: escrow on NEAR, dispute resolution with AI + judges, HOT Wallet payments.

---

## 1. Smart contracts (NEAR)

**Escrow contract (core):**
- **Lock**: Client deposits `totalAmount` + `securityDeposit` (and optional platform fee) in NEAR when contract is accepted.
- **Milestones**: Each milestone has an amount; funds are "allocated" on-chain (e.g. in a `milestones` map).
- **Release**: For each milestone, either:
  - **Happy path**: Client calls `confirm_milestone(milestone_id)` → contract transfers that amount to freelancer.
  - **Dispute**: Someone calls `raise_dispute(milestone_id)` → contract status → disputed; funds stay locked until resolution.
- **Resolution**: Backend/oracle or multisig calls `resolve_dispute(milestone_id, resolution)` where `resolution` is e.g. `ReleaseToFreelancer` | `RefundToClient` | `Split(percent)`. Contract sends NEAR accordingly.
- **Security deposit**: Used to pay judges (optional) and/or cover partial refunds; remainder returned to client at the end.

**Optional: factory**
- One "factory" contract that deploys a new escrow contract per deal (client + freelancer + terms). Keeps each deal isolated.

**References:**
- [deprecated escrow-js](https://github.com/deprecated-near-examples/escrow-js) — flows: lock, approve, cancel, timelock.
- NEAR [lockup contract](https://github.com/near/core-contracts/blob/master/lockup/src/lib.rs) — lock/release patterns in Rust.
- Production: write escrow in **Rust** with `near-sdk`; frontend calls view/change methods via wallet.

---

## 2. Encryption & privacy (two parties + judges)

**Two-party (client ↔ freelancer):**
- **Option A (simplest):** Sensitive data (chat, files) stored off-chain (IPFS/your backend). On-chain only: contract id, milestone hashes, amounts, status. No PII on-chain.
- **Option B:** E2E encryption for chat: messages encrypted with a key derived from both parties (e.g. agreed key or DH). Only they decrypt; backend stores ciphertext. Judge never sees raw content.

**Judge / “collaborative” decryption:**
- **Current design (recommended):** No decryption for judges. AI agent (see below) fetches only what it needs, anonymizes and summarizes; judges see **only**:
  - AI summary (no names, no emails, no exact amounts if you redact),
  - structured resolution options (e.g. “Favor client / Favor freelancer / Split”),
  - optional “evidence type” tags (e.g. “Delivery claimed”, “Payment terms”).
- **Stronger “collaborative” option:** If you ever need judges to access original data in rare cases:
  - Encrypt dispute package with a key K; split K into N shares (e.g. Shamir). Each judge holds a share; only T-of-N judges can reconstruct K and decrypt. Implemented off-chain (e.g. threshold service or NEAR’s [threshold-signatures](https://github.com/near/threshold-signatures) ideas for key ceremony). For Sandbox, AI-only path is enough and simpler.

**Summary:**  
- Two-party: E2E for chat; on-chain only commitments/hashes.  
- Judges: AI summarizes and redacts; no need for judges to decrypt. Optional: threshold decryption for “break glass” access later.

---

## 3. AI agent (dispute summarization)

- **NEAR AI Cloud** is OpenAI-compatible: use it to build the “dispute agent” that:
  - Pulls dispute context (milestone description, messages, file names — not raw file content if privacy-critical),
  - Anonymizes (replace names, exact amounts with ranges, etc.),
  - Produces a short summary + suggested resolution options.
- Judges in Judge Portal then see only this summary and vote; your backend submits the winning resolution to the NEAR contract (`resolve_dispute`).
- Fits Sandbox “applied AI” and “intelligent agents” focus.

**Setup:** `base_url: https://cloud-api.near.ai/v1`, API key from [NEAR AI Cloud](https://cloud.near.ai/api-keys). Use from your backend or a serverless function so the API key stays server-side.

---

## 4. HOT Wallet (payments)

- **HOT Wallet** is a NEAR wallet; “HOT pay” here = users pay and receive NEAR via HOT.
- Use **@hot-labs/near-connect** in the frontend:
  - Connect wallet (HOT or other NEAR wallets via selector).
  - For “create contract” / “fund escrow”: user signs a transaction that sends NEAR to your escrow contract.
  - For “confirm milestone” / “resolve dispute”: user (or backend with key) calls contract methods; HOT Wallet signs txs.
- All “payments” are NEAR moving through your escrow contract; HOT is the UX layer for signing.

**References:**
- [HOT Wallet NEAR](https://hot-labs.org/chains/near)
- [NEAR Connect Tutorial](https://docs.near.org/web3-apps/tutorials/web-login/near-connector)
- [@hot-labs/near-connect](https://docs.near.org/web3-apps/tutorials/web-login/near-connector) — sandboxed wallet script, manifest-based, optional function-call keys for better UX (e.g. approve escrow contract once).

---

## 5. End-to-end flow (for Sandbox)

1. **Create contract** (frontend): Client sets title, description, milestones, amounts, security %. Optional: freelancer address or invite link.
2. **Accept** (frontend + NEAR): Freelancer accepts; client (or both) funds escrow via HOT Wallet → contract locks NEAR.
3. **Work**: Milestones updated off-chain or via contract; client confirms completion per milestone → contract releases that amount to freelancer.
4. **Dispute**: One party raises dispute → contract marks milestone as disputed. Backend triggers AI agent → summary + anonymization → Judge Portal.
5. **Judge**: Random judges (Uber-style) see only AI summary; they vote. Backend aggregates (e.g. majority) and calls `resolve_dispute` on the contract.
6. **Payout**: Contract sends NEAR (freelancer / client / split); security deposit can be used for judge rewards or returned.

**NEAR “meaningful integration”:** Escrow contract on NEAR (Rust), all payments in NEAR, wallet (HOT) for signing, optional NEAR AI for dispute agent. That satisfies “meaningfully leverage NEAR” and “production-ready on mainnet” for the Sandbox.

---

## 6. Quick checklist (Sandbox submission)

- [ ] Escrow smart contract (Rust) on NEAR: lock, release by milestone, dispute, resolve.
- [ ] Frontend: connect NEAR wallet (e.g. @hot-labs/near-connect), fund escrow, confirm milestones, show balances/status from contract.
- [ ] Dispute flow: raise dispute → AI (NEAR AI Cloud) summarizes & anonymizes → Judge Portal → backend calls `resolve_dispute`.
- [ ] HOT Wallet: document “pay with NEAR via HOT” (and other NEAR wallets) in README / demo.
- [ ] Deployed URL + repo + short demo video (≤3 min).

If you want, next step can be: (1) scaffold of the Rust escrow contract (methods and storage), or (2) a minimal `@hot-labs/near-connect` integration in the existing React app (connect, call a view method, then a pay-in method stub).
