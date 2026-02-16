#!/bin/bash
set -e

# Nescrowee - Contract Initialization Script
# Usage: bun run contract:init [testnet|mainnet]

NETWORK="${1:-testnet}"

echo "🔧 Initializing Nescrowee contract on $NETWORK..."

if [ -z "$NEAR_ACCOUNT" ]; then
  echo "❌ NEAR_ACCOUNT environment variable not set"
  echo "Please set it: export NEAR_ACCOUNT=yourname.testnet"
  exit 1
fi

if [ "$NETWORK" == "testnet" ]; then
  CONTRACT_ACCOUNT="nescrowee.$NEAR_ACCOUNT"
elif [ "$NETWORK" == "mainnet" ]; then
  CONTRACT_ACCOUNT="nescrowee.near"
  echo "⚠️  WARNING: Initializing MAINNET contract!"
  read -p "Are you sure? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "❌ Initialization cancelled"
    exit 1
  fi
else
  echo "❌ Invalid network: $NETWORK (use 'testnet' or 'mainnet')"
  exit 1
fi

echo "📝 Initializing contract: $CONTRACT_ACCOUNT"
echo "📝 Owner: $NEAR_ACCOUNT"

near contract call-function as-transaction $CONTRACT_ACCOUNT new json-args \
  "{\"owner\":\"$NEAR_ACCOUNT\"}" \
  prepaid-gas '100 Tgas' \
  attached-deposit '0 NEAR' \
  network-config $NETWORK \
  sign-as $NEAR_ACCOUNT \
  sign-with-keychain send

echo ""
echo "✅ Contract initialized successfully!"
echo ""
echo "Contract: $CONTRACT_ACCOUNT"
echo "Owner: $NEAR_ACCOUNT"
echo ""
echo "Next steps:"
echo "1. Register TEE addresses: bun run contract:register-tee $NETWORK"
echo ""
