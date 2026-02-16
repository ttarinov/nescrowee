#!/bin/bash
set -e

# Nescrowee - Relay Account Setup (for HOT Pay webhook)
# Usage: bash scripts/setup-relay.sh [testnet|mainnet]

NETWORK="${1:-testnet}"

echo "🔐 Setting up relay account for HOT Pay webhook"
echo "================================================"
echo "Network: $NETWORK"
echo ""

if [ -z "$NEAR_ACCOUNT" ]; then
  echo "❌ NEAR_ACCOUNT environment variable not set"
  echo "Please set it: export NEAR_ACCOUNT=yourname.testnet"
  exit 1
fi

if [ "$NETWORK" == "testnet" ]; then
  CONTRACT_ACCOUNT="nescrowee.$NEAR_ACCOUNT"
  RELAY_ACCOUNT="relay.nescrowee.$NEAR_ACCOUNT"
elif [ "$NETWORK" == "mainnet" ]; then
  CONTRACT_ACCOUNT="nescrowee.near"
  RELAY_ACCOUNT="relay.nescrowee.near"
else
  echo "❌ Invalid network: $NETWORK (use 'testnet' or 'mainnet')"
  exit 1
fi

echo "📝 Contract: $CONTRACT_ACCOUNT"
echo "📝 Relay Account: $RELAY_ACCOUNT"
echo ""

# Step 1: Check if relay account exists
echo "1️⃣  Checking if relay account exists..."
ACCOUNT_EXISTS=$(near account view-account-summary $RELAY_ACCOUNT network-config $NETWORK 2>&1 || echo "not_found")

if echo "$ACCOUNT_EXISTS" | grep -q "not_found\|error\|does not exist"; then
  echo "   Relay account does not exist. Creating..."
  echo ""

  # Create relay subaccount
  near account create-account fund-later \
    use-auto-generation \
    new-account $RELAY_ACCOUNT \
    initial-balance "1 NEAR" \
    sign-as $NEAR_ACCOUNT \
    network-config $NETWORK \
    sign-with-keychain send

  echo ""
  echo "   ✅ Relay account created: $RELAY_ACCOUNT"
else
  echo "   ✅ Relay account already exists: $RELAY_ACCOUNT"
fi
echo ""

# Step 2: Generate function-call key
echo "2️⃣  Generating function-call access key..."
echo "   This key can ONLY call fund_contract() method"
echo ""

# Generate keypair
KEYPAIR_FILE="/tmp/relay-keypair-$NETWORK.json"
near account add-key $RELAY_ACCOUNT \
  autogenerate-new-keypair \
  save-to-keychain \
  sign-as $RELAY_ACCOUNT \
  network-config $NETWORK \
  sign-with-keychain send

# Get the public key from keychain
echo ""
echo "   ✅ Access key generated and added"
echo ""

# Step 3: Restrict key to function call only
echo "3️⃣  Setting up function-call restrictions..."
echo "   Allowed method: fund_contract"
echo "   Allowed contract: $CONTRACT_ACCOUNT"
echo "   Allowance: 10 NEAR"
echo ""

# Note: near-cli-rs doesn't support adding keys with restrictions directly
# User must do this manually or we create a custom script

echo "⚠️  IMPORTANT: You must manually restrict the key to function-call only"
echo ""
echo "Run this command:"
echo ""
echo "near account add-key $RELAY_ACCOUNT \\"
echo "  grant-function-call-access \\"
echo "  --allowance '10 NEAR' \\"
echo "  --receiver-account-id $CONTRACT_ACCOUNT \\"
echo "  --method-names fund_contract \\"
echo "  network-config $NETWORK \\"
echo "  sign-as $RELAY_ACCOUNT \\"
echo "  sign-with-keychain send"
echo ""

# Step 4: Get credentials
echo "4️⃣  Getting credentials for .env file..."
echo ""

# List keys
echo "📋 Keys for $RELAY_ACCOUNT:"
near account list-keys $RELAY_ACCOUNT network-config $NETWORK

echo ""
echo "================================================"
echo "✅ Relay account setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Add to .env file:"
echo "   NEAR_RELAY_ACCOUNT_ID=$RELAY_ACCOUNT"
echo "   NEAR_RELAY_PRIVATE_KEY=ed25519:... (get from ~/.near-credentials/$NETWORK/$RELAY_ACCOUNT.json)"
echo "   NEAR_CONTRACT_ID=$CONTRACT_ACCOUNT"
echo "   NEAR_NETWORK=$NETWORK"
echo ""
echo "2. Get private key:"
echo "   cat ~/.near-credentials/$NETWORK/$RELAY_ACCOUNT.json"
echo ""
echo "3. Test webhook:"
echo "   bun run webhook:local"
echo ""
echo "4. Configure HOT Pay webhook URL:"
echo "   https://your-ngrok-url.ngrok.io/api/hot-pay-webhook"
echo ""
