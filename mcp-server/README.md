# Nescrowee MCP Server

A real MCP (Model Context Protocol) server that wraps the Nescrowee NEAR smart contract. Lets AI agents (Claude Desktop, OpenClaw, rentahuman.ai, etc.) create and manage trustless escrow contracts on NEAR Protocol.

## Setup

```bash
git clone https://github.com/ttarinov/nescrowee
cd nescrowee/mcp-server
npm install
```

### Environment variables

```bash
NEAR_NETWORK=testnet              # testnet or mainnet (default: testnet)
NEAR_CONTRACT_ID=nescrowee.testnet  # contract address (default: nescrowee.testnet)
NEAR_ACCOUNT_ID=your-bot.testnet   # your NEAR account ID
NEAR_PRIVATE_KEY=ed25519:...       # your NEAR private key
```

View methods (get_contract, get_dispute, etc.) work without credentials. Change methods (create_contract, fund_contract, etc.) require `NEAR_ACCOUNT_ID` and `NEAR_PRIVATE_KEY`.

### Start the server

```bash
npm start
```

## Claude Desktop integration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nescrowee": {
      "command": "npx",
      "args": ["tsx", "/path/to/nescrowee/mcp-server/src/index.ts"],
      "env": {
        "NEAR_NETWORK": "testnet",
        "NEAR_CONTRACT_ID": "nescrowee.testnet",
        "NEAR_ACCOUNT_ID": "your-bot.testnet",
        "NEAR_PRIVATE_KEY": "ed25519:..."
      }
    }
  }
}
```

## OpenClaw / rentahuman.ai integration

```json
{
  "mcpServers": {
    "nescrowee": {
      "command": "node",
      "args": ["/path/to/nescrowee/mcp-server/dist/index.js"],
      "env": {
        "NEAR_NETWORK": "testnet",
        "NEAR_CONTRACT_ID": "nescrowee.testnet",
        "NEAR_ACCOUNT_ID": "your-agent.testnet",
        "NEAR_PRIVATE_KEY": "ed25519:..."
      }
    }
  }
}
```

## Available tools

### View (no credentials needed)

| Tool | Description |
|------|-------------|
| `get_contract` | Get full contract state (milestones, disputes, funding) |
| `get_contracts_by_account` | List all contracts for a NEAR account |
| `get_dispute` | Get dispute info for a milestone |
| `get_ai_processing_fee` | Get current AI dispute resolution fee |

### Change (requires credentials)

| Tool | Description |
|------|-------------|
| `create_contract` | Create a new escrow contract (amounts in NEAR, auto-converts) |
| `fund_contract` | Fund a contract with NEAR |
| `join_contract` | Join a draft contract as freelancer |
| `start_milestone` | Start working on a milestone |
| `request_payment` | Request payment after completing a milestone |
| `cancel_payment_request` | Cancel a payment request |
| `approve_milestone` | Approve milestone and release payment |
| `raise_dispute` | Raise a dispute (triggers AI arbitration) |

## Available resources

| URI | Description |
|-----|-------------|
| `nescrowee://contract/{id}` | Full contract state as JSON |
| `nescrowee://dispute/{contract_id}/{milestone_id}` | Dispute details and AI resolution |
| `nescrowee://contracts/{account_id}` | All contracts for an account |

## Example: AI agent hires a human

```typescript
// Agent creates escrow contract
const result = await mcp.callTool("create_contract", {
  title: "Take photos of restaurant",
  description: "Visit and photograph the menu items",
  milestones: [
    { title: "Photos", description: "10 high-quality food photos", amount: "2" }
  ],
  freelancer: "human.testnet",
  security_deposit_pct: 10
});

// Fund it (2 NEAR + 10% security = 2.2 NEAR)
await mcp.callTool("fund_contract", {
  contract_id: result.contract_id,
  amount: "2.2"
});

// Check status
const contract = await mcp.readResource("nescrowee://contract/" + result.contract_id);

// If work is done and looks good, approve
await mcp.callTool("approve_milestone", {
  contract_id: result.contract_id,
  milestone_id: "m1"
});

// Or raise a dispute — AI in TEE resolves it, verified on-chain
await mcp.callTool("raise_dispute", {
  contract_id: result.contract_id,
  milestone_id: "m1",
  reason: "Photos do not meet quality requirements"
});
```

## Security

- Funds are held in the NEAR smart contract, not by any intermediary
- Disputes are resolved by AI running in a Trusted Execution Environment (TEE)
- AI resolutions are signed with Ed25519 and verified on-chain — no one can tamper with the result
- Private keys never leave your machine; the MCP server signs transactions locally
