#!/bin/bash
# Minimal MCP Protocol Test Suite for mcp-server-qrcode

echo "Testing MCP Server with minimal protocol calls..."

# Define server command - adjust as needed
SERVER_CMD="node build/main.js"

# 1. Initialize request
echo "# Testing initialize..."
echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}},"id":0}' | $SERVER_CMD | jq

# 2. Initialized notification (no response expected)
echo "# Sending initialized notification..."
echo '{"jsonrpc":"2.0","method":"initialized","params":{}}' | $SERVER_CMD

# 3. Tools list request
echo "# Testing tools/list..."
echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}' | $SERVER_CMD | jq

# 4. Tools call request - Fixed to use "text" instead of "utf8"
echo "# Testing tools/call for generate-qrcode..."
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"generate-qrcode","arguments":{"content":"test","errorCorrectionLevel":"M","size":3,"format":"text"}},"id":2}' | $SERVER_CMD | jq

# 5. Resources list request (may return empty if not implemented)
echo "# Testing resources/list..."
echo '{"jsonrpc":"2.0","method":"resources/list","params":{},"id":3}' | $SERVER_CMD | jq

# 6. Prompts list request (may return empty if not implemented)
echo "# Testing prompts/list..."
echo '{"jsonrpc":"2.0","method":"prompts/list","params":{},"id":4}' | $SERVER_CMD | jq

# 7. Ping request (optional extension)
echo "# Testing ping..."
echo '{"jsonrpc":"2.0","method":"ping","params":{"data":"test"},"id":5}' | $SERVER_CMD | jq

# 8. Shutdown request
echo "# Testing shutdown..."
echo '{"jsonrpc":"2.0","method":"shutdown","params":{},"id":6}' | $SERVER_CMD | jq

# 9. Exit notification (no response expected)
echo "# Sending exit notification..."
echo '{"jsonrpc":"2.0","method":"exit","params":{}}' | $SERVER_CMD

echo "MCP protocol test complete"
