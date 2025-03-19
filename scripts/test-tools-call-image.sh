#!/bin/bash
# This will generate a base64-encoded image - show just the first part
echo '{"method":"tools/call","params":{"name":"generate-qrcode","arguments":{"content":"https://anthropic.com","format":"image"}},"id":2,"jsonrpc":"2.0"}' | node build/main.js | jq -r '.result.content[] | select(.type=="image") | .data' | head -c 50
echo "... [base64 data truncated]"
