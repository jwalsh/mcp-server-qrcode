#!/bin/bash
echo '{"method":"prompts/list","params":{},"id":1,"jsonrpc":"2.0"}' | node build/main.js | jq '.result.prompts'
