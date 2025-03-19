#!/bin/bash
echo '{"method":"tools/list","params":{},"id":1,"jsonrpc":"2.0"}' | node build/main.js | jq '.result.tools[] | {name, description}'
