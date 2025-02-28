#!/bin/bash
# Simple build script for the QR Code MCP Server

echo "Installing dependencies..."
npm install --no-save @modelcontextprotocol/sdk@0.7.0

echo "Building TypeScript code..."
npx tsc

echo "Making CLI executable..."
chmod +x build/cli.js

echo "Build complete! You can now run the server with 'node build/cli.js'"
