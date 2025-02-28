#!/bin/bash
set -e

echo "Quick starting the application..."

# Ensure dependencies are installed
npm install

# Build the project
npm run build

# Start the server
npm start
