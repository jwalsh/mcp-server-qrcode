#!/bin/bash
# Comprehensive MCP Server Test Script
# Tests both local development and published implementations

set -e  # Exit on error

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Create temporary files for communication
create_temp_files() {
  INPUT_FILE=$(mktemp)
  OUTPUT_FILE=$(mktemp)
  log "Created temporary files for testing: $INPUT_FILE, $OUTPUT_FILE"
}

# Clean up temporary files
cleanup_temp_files() {
  rm -f "$INPUT_FILE" "$OUTPUT_FILE"
  log "Cleaned up temporary files"
}

# Function to run server with stdio transport
test_mcp_server() {
  local server_cmd="$1"
  local test_type="$2"
  local timeout_seconds="${3:-10}"
  
  log "=== Testing $test_type Server ==="
  
  create_temp_files
  
  # Initialize JSON-RPC message
  local INIT_PAYLOAD=$(cat <<EOF
{
  "jsonrpc":"2.0",
  "method":"initialize",
  "params":{
    "protocolVersion":"2024-11-05",
    "capabilities":{},
    "clientInfo":{
      "name":"mcp-tester",
      "version":"1.0.0"
    }
  },
  "id":0
}
EOF
)
  
  # Tools list request
  local TOOLS_LIST_PAYLOAD=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "params": {},
  "id": 1
}
EOF
)
  
  # QR code generation tool test
  local TOOL_TEST_PAYLOAD=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "generate-qrcode",
    "arguments": {
      "content": "MCP Tool Test: $(date)",
      "errorCorrectionLevel": "M",
      "size": 3,
      "format": "utf8"
    }
  },
  "id": 2
}
EOF
)
  
  # Initialized notification
  local INITIALIZED_NOTIFICATION=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "method": "initialized",
  "params": {}
}
EOF
)
  
  # Write all test messages to the input file
  echo "$INIT_PAYLOAD" > "$INPUT_FILE"
  echo "$INITIALIZED_NOTIFICATION" >> "$INPUT_FILE"
  echo "$TOOLS_LIST_PAYLOAD" >> "$INPUT_FILE"
  echo "$TOOL_TEST_PAYLOAD" >> "$INPUT_FILE"
  
  log "Starting server command: $server_cmd"
  
  # Start the server with redirected IO and timeout
  timeout "$timeout_seconds" bash -c "$server_cmd < $INPUT_FILE > $OUTPUT_FILE" || {
    local exit_code=$?
    if [ $exit_code -eq 124 ]; then
      log_error "Server test timed out after $timeout_seconds seconds"
    else
      log_error "Server exited with code $exit_code"
    fi
    cat "$OUTPUT_FILE"
    cleanup_temp_files
    return 1
  }
  
  log "Server execution completed, analyzing responses..."
  
  # Check for initialization response
  if grep -q '"method":"initialize"' "$OUTPUT_FILE"; then
    log_success "Server initialization response found"
  else
    log_error "Server initialization response not found"
    cat "$OUTPUT_FILE"
    cleanup_temp_files
    return 1
  fi
  
  # Check for tools/list response
  if grep -q '"method":"tools/list"' "$OUTPUT_FILE"; then
    log_success "Tools list response found"
  else
    log_error "Tools list response not found"
    cleanup_temp_files
    return 1
  fi
  
  # Check for generate-qrcode tool response
  if grep -q '"method":"tools/call"' "$OUTPUT_FILE" && grep -q "QR Code" "$OUTPUT_FILE"; then
    log_success "QR code generation response found"
  else
    log_error "QR code generation response not found or incomplete"
    cleanup_temp_files
    return 1
  fi
  
  log "Server response content:"
  cat "$OUTPUT_FILE" | jq '.' || cat "$OUTPUT_FILE"
  
  cleanup_temp_files
  return 0
}

# Execute tests

log "Beginning comprehensive MCP server tests..."

# Test development server (adjust path as needed)
DEV_SERVER_PATH="$HOME/projects/mcp-server-qrcode/build/main.js"
if [ -f "$DEV_SERVER_PATH" ]; then
  log "Testing local development server"
  test_mcp_server "node $DEV_SERVER_PATH" "Development" 15
else
  log_warning "Development server path not found: $DEV_SERVER_PATH"
fi

# Test installed npm package
if npm list -g | grep -q "@jwalsh/mcp-server-qrcode"; then
  log "Testing globally installed package"
  test_mcp_server "mcp-server-qrcode" "Installed" 15
else
  log_warning "Package not installed globally, testing with npx"
fi

# Test with npx
log "Testing published package via npx"
test_mcp_server "npx -y @jwalsh/mcp-server-qrcode" "NPX" 30

log "All tests completed"
