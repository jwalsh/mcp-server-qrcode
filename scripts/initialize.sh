#!/bin/bash
set -e

echo "Initializing project..."

# Install nvm if not installed
if ! command -v nvm &> /dev/null; then
    echo "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Use the correct Node.js version
nvm install 18
nvm use 18

# Install global dependencies
npm install -g typescript eslint prettier

# Initialize the project
npm install
npm run build

echo "Project initialization complete!"
