#!/usr/bin/env node
// Direct run script for QR Code MCP Server

// Import the SDK
const mcp = require('@modelcontextprotocol/sdk');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Create the server
const server = mcp.createServer({
  serverInfo: {
    name: "QR Code Generator",
    version: "0.1.0"
  },
  tools: [
    {
      name: "generate-qrcode",
      description: "Generate a QR code from text content",
      inputSchema: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The text content to encode in the QR code"
          },
          errorCorrectionLevel: {
            type: "string",
            enum: ["L", "M", "Q", "H"],
            description: "Error correction level (L: 7%, M: 15%, Q: 25%, H: 30%)"
          },
          size: {
            type: "number",
            description: "Size of the QR code (1-10)"
          }
        },
        required: ["content"]
      },
      handler: async (args) => {
        try {
          const { content, errorCorrectionLevel = 'M', size = 3 } = args;
          
          // Construct qrencode command with options
          const ecOption = errorCorrectionLevel ? `-l ${errorCorrectionLevel}` : '';
          const sizeOption = size ? `-s ${size}` : '';
          
          // Generate QR code in UTF8 format
          const { stdout, stderr } = await execAsync(
            `qrencode -o - -t UTF8 ${ecOption} ${sizeOption} '${content.replace(/'/g, "'\\''")}'`
          );
          
          if (stderr) {
            return {
              content: [
                {
                  type: "text",
                  text: `Error: ${stderr}`
                }
              ],
              isError: true
            };
          }
          
          return {
            content: [
              {
                type: "text",
                text: `QR Code for "${content}":\n\n${stdout}`
              }
            ]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text",
                text: `Failed to generate QR code: ${errorMessage}`
              }
            ],
            isError: true
          };
        }
      }
    }
  ]
});

// Start the server
console.log("Starting QR Code MCP Server...");
server.listen({
  logLevel: "info"
}).catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
