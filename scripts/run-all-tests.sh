#!/bin/bash
#!/bin/bash
# Run all MCP QR Code Server tests

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}MCP QR Code Server JSONRPC Test Suite${NC}"
echo -e "${BLUE}====================================${NC}\n"

# Make scripts executable
chmod +x scripts/*.sh

# Build first
scripts/build.sh

# Core Methods
echo -e "\n${BLUE}Testing Core Methods${NC}"
echo -e "${BLUE}-----------------${NC}"
echo -e "Initialize: "
scripts/test-initialize.sh | grep -q "result" && echo -e "${GREEN}✓ PASS${NC}" || echo -e "${RED}✗ FAIL${NC}"

echo -e "Ping: "
scripts/test-ping.sh | grep -q "pong" && echo -e "${GREEN}✓ PASS${NC}" || echo -e "${RED}✗ FAIL${NC}"

# Tools Interface
echo -e "\n${BLUE}Testing Tools Interface${NC}"
echo -e "${BLUE}----------------------${NC}"
echo -e "List Tools: "
scripts/test-tools-list.sh | grep -q "generate-qrcode" && echo -e "${GREEN}✓ PASS${NC}" || echo -e "${RED}✗ FAIL${NC}"

echo -e "Call Tool (Text): "
scripts/test-tools-call-text.sh | grep -q "QR code generated" && echo -e "${GREEN}✓ PASS${NC}" || echo -e "${RED}✗ FAIL${NC}"

echo -e "Call Tool (Image): "
scripts/test-tools-call-image.sh | grep -q "base64" && echo -e "${GREEN}✓ PASS${NC}" || echo -e "${RED}✗ FAIL${NC}"

# Prompts Interface
echo -e "\n${BLUE}Testing Prompts Interface${NC}"
echo -e "${BLUE}------------------------${NC}"
echo -e "List Prompts: "
scripts/test-prompts-list.sh | grep -q "qrcode-formatter" && echo -e "${GREEN}✓ PASS${NC}" || echo -e "${RED}✗ FAIL${NC}"

echo -e "Get Prompt (Wi-Fi): "
scripts/test-prompts-get-wifi.sh | grep -q "WIFI:" && echo -e "${GREEN}✓ PASS${NC}" || echo -e "${RED}✗ FAIL${NC}"

# Resources Interface
echo -e "\n${BLUE}Testing Resources Interface${NC}"
echo -e "${BLUE}--------------------------${NC}"
echo -e "List Resources: "
scripts/test-resources-list.sh | grep -q "qrcode-examples" && echo -e "${GREEN}✓ PASS${NC}" || echo -e "${RED}✗ FAIL${NC}"

echo -e "Read Resource: "
scripts/test-resources-read.sh | grep -q "QR Code Examples" && echo -e "${GREEN}✓ PASS${NC}" || echo -e "${RED}✗ FAIL${NC}"

echo -e "List Resource Templates: "
scripts/test-resources-templates-list.sh | grep -q "wifi-template" && echo -e "${GREEN}✓ PASS${NC}" || echo -e "${RED}✗ FAIL${NC}"

echo -e "\n${BLUE}====================================${NC}"
echo -e "${GREEN}All tests completed${NC}"
echo -e "${BLUE}====================================${NC}"
