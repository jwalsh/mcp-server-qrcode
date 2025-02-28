#!/bin/bash
# Script to run the QR Code MCP Server

echo "Installing runtime dependencies..."
npm install @modelcontextprotocol/sdk commander

echo "Making CLI executable..."
chmod +x build/cli.js

echo "Running QR Code MCP Server..."
node build/cli.js
