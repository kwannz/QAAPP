#!/bin/bash

# Deploy contracts to local Hardhat network

set -e

echo "🚀 Deploying contracts to local network..."

# Change to contracts directory
cd "$(dirname "$0")/../packages/contracts"

# Check if local network is running
if ! curl -s http://127.0.0.1:8545 > /dev/null; then
    echo "❌ Local Hardhat network is not running!"
    echo "💡 Start it with: npm run blockchain:start"
    exit 1
fi

# Deploy contracts
echo "📦 Compiling contracts..."
npx hardhat compile

echo "🚀 Deploying to localhost..."
npx hardhat deploy --network localhost

echo "✅ Deployment completed!"

# Save deployment info
echo "📋 Deployment addresses:"
cat deployments/localhost.json

echo ""
echo "🎉 Contracts deployed successfully to local network!"
echo "📍 Network: http://127.0.0.1:8545"
echo "🔧 You can now interact with the contracts through the API"