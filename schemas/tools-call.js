// tools/call request for QR code generation
{
  "method": "tools/call",
  "params": {
    "name": "generate-qrcode",
    "arguments": {
      "content": "https://example.com",
      "format": "image",
      "errorCorrectionLevel": "M",
      "size": 3
    }
  },
  "id": 2,
  "jsonrpc": "2.0"
}

// tools/call response
{
  "result": {
    "content": [
      {
        "type": "text",
        "text": "QR code generated for: https://example.com"
      },
      {
        "type": "image",
        "mimeType": "image/png",
        "data": "base64-encoded-image-data"
      }
    ]
  },
  "id": 2,
  "jsonrpc": "2.0"
}
