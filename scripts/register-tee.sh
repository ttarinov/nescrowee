#!/bin/bash
set -e

# Nescrowee - TEE Address Registration Script
# Usage: bun run contract:register-tee [testnet|mainnet] [model_id]

NETWORK="${1:-testnet}"
MODEL="${2:-Qwen/Qwen3-30B-A3B}"

echo "🔐 Registering TEE addresses for Nescrowee contract on $NETWORK..."
echo "📝 Model: $MODEL"

if [ -z "$NEAR_ACCOUNT" ]; then
  echo "❌ NEAR_ACCOUNT environment variable not set"
  echo "Please set it: export NEAR_ACCOUNT=yourname.testnet"
  exit 1
fi

if [ "$NETWORK" == "testnet" ]; then
  CONTRACT_ACCOUNT="nescrowee.$NEAR_ACCOUNT"
elif [ "$NETWORK" == "mainnet" ]; then
  CONTRACT_ACCOUNT="nescrowee.near"
else
  echo "❌ Invalid network: $NETWORK (use 'testnet' or 'mainnet')"
  exit 1
fi

echo ""
echo "📡 Fetching TEE attestation from NEAR AI Cloud..."
ATTESTATION=$(curl -s "https://cloud-api.near.ai/v1/attestation/report?model=$MODEL&signing_algo=ed25519")

PUBLIC_KEY=$(echo $ATTESTATION | grep -o '"public_key":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PUBLIC_KEY" ]; then
  echo "❌ Failed to get TEE public key from attestation endpoint"
  echo "Response: $ATTESTATION"
  exit 1
fi

echo "✅ TEE Public Key: $PUBLIC_KEY"
echo ""
echo "📝 Registering TEE address to contract: $CONTRACT_ACCOUNT"

near contract call-function as-transaction $CONTRACT_ACCOUNT add_tee_address json-args \
  "{\"tee_address\":\"$PUBLIC_KEY\"}" \
  prepaid-gas '30 Tgas' \
  attached-deposit '0 NEAR' \
  network-config $NETWORK \
  sign-as $NEAR_ACCOUNT \
  sign-with-keychain send

echo ""
echo "✅ TEE address registered successfully!"
echo ""
echo "Registered addresses for contract $CONTRACT_ACCOUNT:"
near contract call-function as-read-only $CONTRACT_ACCOUNT get_tee_addresses json-args '{}' \
  network-config $NETWORK

echo ""
echo "📝 All models to register:"
echo "  - Qwen/Qwen3-30B-A3B (Standard)"
echo "  - openai/gpt-oss-120b (Strong reasoning)"
echo "  - deepseek-ai/DeepSeek-V3.1 (Appeals)"
echo "  - THUDM/GLM-4.1V-9B-Thinking (Vision)"
echo ""
echo "To register another model:"
echo "  bun run contract:register-tee $NETWORK \"openai/gpt-oss-120b\""
echo ""
