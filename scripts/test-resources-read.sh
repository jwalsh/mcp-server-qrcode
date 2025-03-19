#!/bin/bash
echo '{"method":"resources/read","params":{"uri":"qrcode-examples"},"id":2,"jsonrpc":"2.0"}' | node build/main.js | jq '.result.content'
