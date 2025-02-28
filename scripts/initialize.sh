#!/bin/bash
# Initialization script for QR Code MCP Server

echo "Initializing project..."

# Make sure npm is available
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Make sure qrencode is installed
if ! command -v qrencode &> /dev/null; then
    echo "qrencode is not installed. Please install it first."
    echo "On macOS: brew install qrencode"
    echo "On Ubuntu/Debian: sudo apt-get install qrencode"
    exit 1
fi

# Clean install dependencies
echo "Installing dependencies..."
rm -rf node_modules
npm install
npm install --save @modelcontextprotocol/sdk@0.7.0
npm install --save-dev @types/node ts-node typescript

echo "Creating build directory..."
mkdir -p build

echo "Done initializing project!"
echo "You can now run 'make build' to build the project."

