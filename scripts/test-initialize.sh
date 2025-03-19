#!/bin/bash
echo '{"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"roots":{"listChanged":true}},"clientInfo":{"name":"test-client","version":"0.1.0"}},"id":1,"jsonrpc":"2.0"}' | node build/main.js | jq '.'
