#!/bin/bash
echo '{"method":"resources/templates/list","params":{},"id":3,"jsonrpc":"2.0"}' | node build/main.js | jq '.result.resourceTemplates'
