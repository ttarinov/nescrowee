#!/bin/bash
set -e

# Nescrowee - Contract Deployment Script
# Usage: bun run contract:deploy [testnet|mainnet]

NETWORK="${1:-testnet}"
CONTRACT_DIR="contract"
WASM_FILE="$CONTRACT_DIR/target/wasm32-unknown-unknown/release/nescrowee.wasm"
RUST_VERSION="1.86.0"

echo "🚀 Deploying Nescrowee contract to $NETWORK..."

if [ ! -f "$WASM_FILE" ]; then
  echo "❌ WASM file not found. Building contract first..."
  cd $CONTRACT_DIR
  rustup run $RUST_VERSION cargo build --target wasm32-unknown-unknown --release
  cd ..
  echo "✅ Contract built"
fi

if [ -z "$NEAR_ACCOUNT" ]; then
  echo "❌ NEAR_ACCOUNT environment variable not set"
  echo "Please set it: export NEAR_ACCOUNT=yourname.testnet"
  exit 1
fi

if [ "$NETWORK" == "testnet" ]; then
  CONTRACT_ACCOUNT="nescrowee.$NEAR_ACCOUNT"
  echo "📝 Deploying to: $CONTRACT_ACCOUNT"

  near contract deploy $CONTRACT_ACCOUNT \
    use-file $WASM_FILE \
    without-init-call \
    network-config testnet \
    sign-with-keychain send

elif [ "$NETWORK" == "mainnet" ]; then
  CONTRACT_ACCOUNT="nescrowee.near"
  echo "📝 Deploying to: $CONTRACT_ACCOUNT"
  echo "⚠️  WARNING: Deploying to MAINNET!"
  read -p "Are you sure? (yes/no): " confirm

  if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
  fi

  near contract deploy $CONTRACT_ACCOUNT \
    use-file $WASM_FILE \
    without-init-call \
    network-config mainnet \
    sign-with-keychain send
else
  echo "❌ Invalid network: $NETWORK (use 'testnet' or 'mainnet')"
  exit 1
fi

echo ""
echo "✅ Contract deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Initialize contract: bun run contract:init $NETWORK"
echo "2. Register TEE addresses: bun run contract:register-tee $NETWORK"
echo "3. Update src/near/config.ts with contract address: $CONTRACT_ACCOUNT"
echo ""
