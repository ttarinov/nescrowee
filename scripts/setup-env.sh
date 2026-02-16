#!/bin/bash

# Nescrowee - Environment Setup Helper
# This script helps you configure all required API keys and environment variables

echo "🚀 Nescrowee Environment Setup"
echo "================================"
echo ""

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
  echo "⚠️  .env file already exists"
  read -p "Do you want to overwrite it? (yes/no): " overwrite
  if [ "$overwrite" != "yes" ]; then
    echo "❌ Setup cancelled"
    exit 0
  fi
fi

cp .env.example $ENV_FILE
echo "✅ Created .env file from .env.example"
echo ""

echo "📝 Let's configure your environment variables..."
echo ""

echo "1️⃣  NEAR Network"
echo "   Choose: testnet (recommended for testing) or mainnet"
read -p "   Network (testnet/mainnet): " near_network
near_network=${near_network:-testnet}
sed -i '' "s/VITE_NEAR_NETWORK=.*/VITE_NEAR_NETWORK=$near_network/" $ENV_FILE
echo "   ✅ Set to: $near_network"
echo ""

echo "2️⃣  NEAR AI Cloud API Key"
echo "   🔗 Get it at: https://cloud.near.ai"
echo "   1. Sign up / Log in"
echo "   2. Go to API Keys section"
echo "   3. Create new key (starts with 'sk-...')"
read -p "   Enter your NEAR AI key (or press Enter to skip): " near_ai_key
if [ ! -z "$near_ai_key" ]; then
  sed -i '' "s|VITE_NEAR_AI_KEY=.*|VITE_NEAR_AI_KEY=$near_ai_key|" $ENV_FILE
  echo "   ✅ NEAR AI key configured"
else
  echo "   ⚠️  Skipped (you'll need this for AI dispute resolution)"
fi
echo ""

echo "3️⃣  NOVA API Key"
echo "   🔗 Get it at: https://discord.gg/nova"
echo "   1. Join NOVA Discord"
echo "   2. Request testnet API key in #support"
echo "   3. Docs: https://nova-25.gitbook.io/nova-docs"
read -p "   Enter your NOVA API key (or press Enter to skip): " nova_key
if [ ! -z "$nova_key" ]; then
  sed -i '' "s|VITE_NOVA_API_KEY=.*|VITE_NOVA_API_KEY=$nova_key|" $ENV_FILE
  echo "   ✅ NOVA key configured"
else
  echo "   ⚠️  Skipped (you'll need this for evidence encryption)"
fi
echo ""

echo "4️⃣  HOT Pay Item ID"
echo "   🔗 Get it at: https://pay.hot-labs.org"
echo "   1. Connect NEAR wallet"
echo "   2. Create new payment link"
echo "   3. Copy the item_id"
read -p "   Enter your HOT Pay item ID (or press Enter to skip): " hotpay_id
if [ ! -z "$hotpay_id" ]; then
  sed -i '' "s|VITE_HOT_PAY_ITEM_ID=.*|VITE_HOT_PAY_ITEM_ID=$hotpay_id|" $ENV_FILE
  echo "   ✅ HOT Pay item ID configured"
else
  echo "   ⚠️  Skipped (you'll need this for payments)"
fi
echo ""

echo "5️⃣  NEAR Account (for contract deployment)"
echo "   This is your NEAR account that will own the contract"
if [ -z "$NEAR_ACCOUNT" ]; then
  read -p "   Enter your NEAR account (e.g., yourname.testnet): " near_account
  if [ ! -z "$near_account" ]; then
    echo "export NEAR_ACCOUNT=$near_account" >> ~/.bashrc
    echo "export NEAR_ACCOUNT=$near_account" >> ~/.zshrc
    export NEAR_ACCOUNT=$near_account
    echo "   ✅ NEAR_ACCOUNT set to: $near_account"
    echo "   (Added to ~/.bashrc and ~/.zshrc)"
  fi
else
  echo "   ✅ Already set: $NEAR_ACCOUNT"
fi
echo ""

echo "================================"
echo "✅ Environment setup complete!"
echo ""
echo "📋 Summary:"
echo "   - Network: $near_network"
echo "   - Config file: $ENV_FILE"
if [ ! -z "$NEAR_ACCOUNT" ]; then
  echo "   - NEAR Account: $NEAR_ACCOUNT"
fi
echo ""
echo "📝 Next steps:"
echo ""
if [ -z "$near_ai_key" ]; then
  echo "   1. Get NEAR AI key: https://cloud.near.ai"
fi
if [ -z "$nova_key" ]; then
  echo "   2. Get NOVA key: https://discord.gg/nova"
fi
if [ -z "$hotpay_id" ]; then
  echo "   3. Get HOT Pay item ID: https://pay.hot-labs.org"
fi
echo ""
echo "   Then continue with:"
echo "   1. Build contract: bun run contract:build"
echo "   2. Deploy contract: bun run contract:deploy $near_network"
echo "   3. Initialize contract: bun run contract:init $near_network"
echo "   4. Register TEE: bun run contract:register-tee $near_network"
echo ""
echo "   Full guide: See TESTING.md"
echo ""
