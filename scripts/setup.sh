#!/bin/bash
# Setup script for QR Code MCP Server

echo "Setting up QR Code MCP Server..."

# Check if qrencode is installed
if ! command -v qrencode &> /dev/null; then
    echo "Warning: qrencode is not installed."
    echo "On macOS: brew install qrencode"
    echo "On Ubuntu/Debian: sudo apt-get install qrencode"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Make files executable
chmod +x setup.sh

echo "Setup complete!"
echo "To build and run the server, use:"
echo "  npm run build"
echo "  npm start"
echo "Or with Make:"
echo "  make build"
echo "  make run"
