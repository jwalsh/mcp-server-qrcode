#!/bin/bash
echo '{"method":"prompts/get","params":{"name":"qrcode-formatter","arguments":{"type":"wifi","parameters":{"ssid":"GuestWiFi","password":"Welcome123","encryption":"WPA"}}},"id":2,"jsonrpc":"2.0"}' | node build/main.js | jq '.result.content'
