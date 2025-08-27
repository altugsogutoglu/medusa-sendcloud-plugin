#!/bin/bash

# Build script for SendCloud plugin

echo "Building SendCloud plugin..."

# Clean previous builds
rm -rf .medusa dist

# Build the plugin
yarn build

echo "Build complete!"
echo ""
echo "To use this plugin in your backend:"
echo "1. Add it to your medusa-config.ts plugins array"
echo "2. Use the path '../sendcloud-medusa' as the resolve value"
echo "3. Configure the required options (publicKey, secretKey, etc.)"
echo ""
echo "See README.md for detailed configuration instructions."