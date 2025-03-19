#!/bin/bash
echo '{"method":"tools/call","params":{"name":"generate-qrcode","arguments":{"content":"https://anthropic.com","format":"text"}},"id":2,"jsonrpc":"2.0"}' | node build/main.js | jq '.result.content[] | select(.type=="text") | .text'
