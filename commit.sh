#!/bin/bash

# Add all files to the git staging area
git add .

# Commit with the initial message (no signing)
git -c commit.gpgsign=false commit -m "Initial commit: QR Code MCP Server implementation"

# Add the remote origin
git remote add origin git@github.com:aygp-dr/mcp-server-qrcode.git

# Push to the main branch
git push -u origin main

echo "Git repository set up and initial commit pushed to GitHub!"
