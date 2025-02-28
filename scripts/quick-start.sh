#!/bin/bash
# Quick start script for QR Code MCP Server - bypasses TypeScript compilation

echo "Installing dependencies..."
npm install @modelcontextprotocol/sdk commander

echo "Making scripts executable..."
chmod +x direct-run.js

echo "Starting QR Code MCP Server..."
node direct-run.js
