#!/bin/bash
set -e

echo "Setting up development environment..."

# Check Node.js version
required_node_version="18.0.0"
current_node_version=$(node -v | sed 's/v//')

if [ "$(printf '%s\n' "$required_node_version" "$current_node_version" | sort -V | head -n1)" != "$required_node_version" ]; then
    echo "Error: Node.js version $required_node_version or higher is required."
    exit 1
fi

# Install dependencies
npm install

# Run initial build
npm run build

# Verify setup
npm run typecheck
npm run lint

echo "Development environment setup complete!"
