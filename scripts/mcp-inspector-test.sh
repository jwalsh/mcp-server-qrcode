#!/bin/bash
# mcp-inspector-test.sh - Test script for MCP Inspector
# Usage: ./mcp-inspector-test.sh [host] [port]

# Default settings
HOST=${1:-localhost}
PORT=${2:-3000}
SESSION_ID="test-session-$(date +%s)"
DELAY=${3:-0.5} # Delay between commands in seconds

# Enable debug output for troubleshooting
DEBUG=true

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

log_debug() {
  if [ "$DEBUG" = true ]; then
    echo -e "${YELLOW}[DEBUG]${NC} $1"
  fi
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if curl is installed
if ! command -v curl &> /dev/null; then
  log_error "curl is required but not installed. Please install curl and try again."
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  log_error "jq is required but not installed. Please install jq and try again."
  exit 1
fi

# Establish session
log "Initializing session with MCP Inspector at $HOST:$PORT..."

# Create a temporary file for the response
RESP_FILE=$(mktemp)

# Start a session
curl -s -X GET "http://$HOST:$PORT/sse?transportType=stdio&command=node&args=build/direct-server.js" > "$RESP_FILE" &
CURL_PID=$!

# Give it a moment to connect
sleep 2
log_success "Session initialized with ID: $SESSION_ID"

# Function to send a command to the MCP Inspector
send_command() {
  local cmd="$1"
  local id="cmd-$(date +%s%N | cut -b1-6)"
  
  log "Sending command: $cmd (ID: $id)"
  
  # Prepare payload
  local payload=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "id": "$id",
  "method": "execute",
  "params": {
    "command": "$cmd"
  }
}
EOF
)
  
  log_debug "Payload: $payload"
  
  # Send the command
  local response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "http://$HOST:$PORT/message?sessionId=$SESSION_ID")
  
  log_debug "Response: $response"
  
  # Check for errors
  if echo "$response" | grep -q "error"; then
    log_error "Command failed: $(echo "$response" | jq -r '.error.message // "Unknown error"')"
  else
    log_success "Command sent successfully"
  fi
  
  # Pause between commands
  sleep "$DELAY"
}

# Function to run a series of test commands
run_test_suite() {
  log "Running test suite..."
  
  # Basic commands
  send_command "tools/list"
  send_command "tools/call help"
  
  # Generate QR codes with various parameters
  send_command "tools/call generate-qrcode --content=\"https://example.com\""
  send_command "tools/call generate-qrcode --content=\"Hello World\" --size=10"
  send_command "tools/call generate-qrcode --content=\"Test QR Code\" --errorCorrectionLevel=H"
  
  # Test with different content types
  send_command "tools/call generate-qrcode --content=\"WIFI:S:MyNetwork;T:WPA;P:password123;;\""
  send_command "tools/call generate-qrcode --content=\"MATMSG:TO:example@example.com;SUB:Hello;BODY:This is a test email;;\""
  send_command "tools/call generate-qrcode --content=\"BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\nTEL:123456789\nEMAIL:john@example.com\nEND:VCARD\""
  
  # Test with special characters
  send_command "tools/call generate-qrcode --content=\"Special chars: !@#$%^&*()\""
  send_command "tools/call generate-qrcode --content=\"Unicode: こんにちは世界\""
  
  # Test with a long string
  send_command "tools/call generate-qrcode --content=\"$(cat <<EOF
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
EOF
)\""
  
  log_success "Test suite completed"
}

# Main execution
run_test_suite

# Cleanup
kill $CURL_PID 2>/dev/null
rm "$RESP_FILE"
log "Test completed. Session closed."
