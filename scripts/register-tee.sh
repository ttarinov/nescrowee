#!/bin/bash
set -e

# Nescrowee - TEE Address Registration Script
# Usage: bun run contract:register-tee [testnet|mainnet] [model_id]

NETWORK="${1:-testnet}"
MODEL="${2:-deepseek-ai/DeepSeek-V3.1}"

echo "Registering TEE addresses for Nescrowee contract on $NETWORK..."
echo "Model: $MODEL"

if [ -z "$NEAR_ACCOUNT" ]; then
  echo "NEAR_ACCOUNT environment variable not set"
  echo "Please set it: export NEAR_ACCOUNT=yourname.testnet"
  exit 1
fi

if [ "$NETWORK" == "testnet" ]; then
  CONTRACT_ACCOUNT="nescrowee.$NEAR_ACCOUNT"
elif [ "$NETWORK" == "mainnet" ]; then
  CONTRACT_ACCOUNT="nescrowee.near"
else
  echo "Invalid network: $NETWORK (use 'testnet' or 'mainnet')"
  exit 1
fi

echo ""
echo "Fetching TEE attestation from NEAR AI Cloud..."
ATTESTATION=$(curl -s "https://cloud-api.near.ai/v1/attestation/report?model=$MODEL&signing_algo=ed25519")

SIGNING_ADDRESS=$(echo $ATTESTATION | python3 -c "import sys,json; print(json.load(sys.stdin)['gateway_attestation']['signing_address'])" 2>/dev/null)

if [ -z "$SIGNING_ADDRESS" ]; then
  echo "Failed to get TEE signing address from attestation endpoint"
  echo "Response: $ATTESTATION"
  exit 1
fi

echo "TEE Signing Address: $SIGNING_ADDRESS"

# Convert hex string to byte array JSON
BYTES=$(python3 -c "
addr = '$SIGNING_ADDRESS'
print('[' + ','.join(str(b) for b in bytes.fromhex(addr)) + ']')
")

echo "Byte array: $BYTES"
echo ""
echo "Registering TEE address to contract: $CONTRACT_ACCOUNT"

near contract call-function as-transaction $CONTRACT_ACCOUNT register_tee_address json-args \
  "{\"address\":$BYTES}" \
  prepaid-gas '30 Tgas' \
  attached-deposit '0 NEAR' \
  sign-as $NEAR_ACCOUNT \
  network-config $NETWORK \
  sign-with-keychain send

echo ""
echo "TEE address registered successfully!"
echo ""
echo "Available models (all share the same gateway signing key):"
echo "  - Qwen/Qwen3-30B-A3B-Instruct-2507 (Standard)"
echo "  - openai/gpt-oss-120b (Strong reasoning)"
echo "  - deepseek-ai/DeepSeek-V3.1 (Appeals)"
echo "  - zai-org/GLM-4.7 (Hybrid reasoning)"
echo ""
