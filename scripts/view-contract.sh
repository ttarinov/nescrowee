#!/bin/bash

# Nescrowee - Contract State Viewer
# Usage: bash scripts/view-contract.sh [testnet|mainnet] [contract_id]

NETWORK="${1:-testnet}"
CONTRACT_ID="${2}"

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

echo "🔍 Viewing Nescrowee Contract State"
echo "===================================="
echo "Network: $NETWORK"
echo "Contract: $CONTRACT_ACCOUNT"
echo ""

if [ -z "$CONTRACT_ID" ]; then
  echo "📋 Listing all contracts for user: $NEAR_ACCOUNT"
  echo ""
  near contract call-function as-read-only $CONTRACT_ACCOUNT get_contracts_for_user \
    json-args "{\"account_id\":\"$NEAR_ACCOUNT\"}" \
    network-config $NETWORK
  echo ""
  echo "💡 To view specific contract: bash scripts/view-contract.sh $NETWORK <contract_id>"
  exit 0
fi

echo "📝 Contract ID: $CONTRACT_ID"
echo ""

echo "1️⃣  Contract Details"
echo "===================="
near contract call-function as-read-only $CONTRACT_ACCOUNT get_contract \
  json-args "{\"contract_id\":\"$CONTRACT_ID\"}" \
  network-config $NETWORK
echo ""

echo "2️⃣  Milestones"
echo "=============="
echo ""

MILESTONE_ID=0
while true; do
  echo "📌 Milestone $MILESTONE_ID:"
  RESULT=$(near contract call-function as-read-only $CONTRACT_ACCOUNT get_milestone \
    json-args "{\"contract_id\":\"$CONTRACT_ID\",\"milestone_id\":\"$MILESTONE_ID\"}" \
    network-config $NETWORK 2>&1)

  if echo "$RESULT" | grep -q "error\|Milestone not found"; then
    echo "   (No more milestones)"
    break
  fi

  echo "$RESULT"
  echo ""

  DISPUTE_RESULT=$(near contract call-function as-read-only $CONTRACT_ACCOUNT get_dispute \
    json-args "{\"contract_id\":\"$CONTRACT_ID\",\"milestone_id\":\"$MILESTONE_ID\"}" \
    network-config $NETWORK 2>&1)

  if ! echo "$DISPUTE_RESULT" | grep -q "error\|Dispute not found"; then
    echo "   ⚠️  Dispute Active:"
    echo "$DISPUTE_RESULT"
    echo ""
  fi

  MILESTONE_ID=$((MILESTONE_ID + 1))
done

echo ""
echo "3️⃣  Registered TEE Addresses"
echo "============================"
near contract call-function as-read-only $CONTRACT_ACCOUNT get_tee_addresses \
  json-args '{}' \
  network-config $NETWORK
echo ""

echo "===================================="
echo "✅ View complete!"
echo ""
echo "🔗 View on explorer:"
echo "   https://$NETWORK.nearblocks.io/address/$CONTRACT_ACCOUNT"
echo ""
