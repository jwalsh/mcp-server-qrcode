# Using the QR Code MCP Server with Claude

This document explains how to use the QR Code MCP Server with Claude or other AI assistants that support MCP.

## Prerequisites

Ensure you have:
- The QR Code MCP Server installed and built
- An AI assistant that supports MCP (like Claude)

## Connecting Claude to the MCP Server

When chatting with Claude, you can connect Claude to the MCP server by letting it know the server is available.

Example prompt:

```
I'm using the QR Code MCP Server to generate QR codes. Can you help me create a QR code for my website URL?
```

## Example Interactions

Here are some examples of how to generate QR codes using Claude with the MCP server:

### Basic QR Code (PNG format - default)

```
Please generate a QR code for "https://example.com"
```

### QR Code in UTF8 Format (ASCII Art)

```
Generate a QR code for "Hello World!" in UTF8 format
```

### QR Code with Custom Error Correction

```
Generate a QR code for my phone number "+1 (555) 123-4567" with high error correction (level H)
```

### QR Code with Custom Size

```
Create a small QR code (size 2) for the text "Hello World!"
```

### QR Code with All Options

```
Generate a QR code for "https://github.com/modelcontextprotocol" with error correction level Q, size 5, and PNG format
```

## Troubleshooting

If you encounter any issues:

1. Make sure the QR code server is running properly
2. Check that `qrencode` is installed on your system
3. Verify that the content you're trying to encode isn't too large for a QR code

## Advanced Usage

### Using with vCard Data

You can create contact information QR codes by formatting the content as a vCard:

```
Please create a QR code with this vCard data:
BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:+1-555-555-5555
EMAIL:john.doe@example.com
END:VCARD
```

### Using with Wi-Fi Configuration

You can create Wi-Fi configuration QR codes:

```
Generate a QR code for connecting to Wi-Fi with these parameters:
WIFI:S:MyNetworkName;T:WPA;P:MyPassword;;
```
