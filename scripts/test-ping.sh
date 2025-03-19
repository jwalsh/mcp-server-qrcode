#!/bin/bash
echo '{"method":"ping","params":{},"id":1,"jsonrpc":"2.0"}' | node build/main.js | jq '.'
