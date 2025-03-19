// prompts/get request for Wi-Fi
{
  "method": "prompts/get",
  "params": {
    "name": "qrcode-formatter",
    "arguments": {
      "type": "wifi",
      "parameters": {
        "ssid": "MyWiFi",
        "password": "MyPassword",
        "encryption": "WPA"
      }
    }
  },
  "id": 2,
  "jsonrpc": "2.0"
}

// prompts/get response
{
  "result": {
    "content": "WIFI:S:MyWiFi;T:WPA;P:MyPassword;;"
  },
  "id": 2,
  "jsonrpc": "2.0"
}
