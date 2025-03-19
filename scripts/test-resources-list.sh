#!/bin/bash
echo '{"method":"resources/list","params":{},"id":1,"jsonrpc":"2.0"}' | node build/main.js | jq '.result.resources'
