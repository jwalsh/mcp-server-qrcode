import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateQRCode } from './qrcode.js';

// Create an MCP server
const server = new McpServer({
  name: "QR Code Generator",
  version: "0.3.6"
});

// Add the QR code generation tool
server.tool(
  "generate-qrcode",
  {
    content: z.string().describe("The text content to encode in the QR code"),
    errorCorrectionLevel: z.enum(["L", "M", "Q", "H"])
      .describe("Error correction level (L: 7%, M: 15%, Q: 25%, H: 30%)")
      .optional()
      .default("M"),
    size: z.number()
      .min(1)
      .max(10)
      .describe("Size of the QR code (1-10)")
      .optional()
      .default(3),
    format: z.enum(["image", "text"])
      .describe("Output format: 'image' for PNG QR code, 'text' for terminal-friendly output")
      .optional()
      .default("image")
  },
  async ({ content, errorCorrectionLevel, size, format }) => {
    try {
      // Convert size from 1-10 scale to pixel size
      const pixelSize = size * 100;
      
      if (format === "text") {
        // Generate QR code in UTF8/terminal format
        const result = await generateQRCode({
          content,
          size: pixelSize,
          errorCorrectionLevel,
          format: 'terminal'
        });
        
        return {
          content: [{ 
            type: "text", 
            text: `QR Code for "${content}":\n\n${result.data}` 
          }]
        };
      } else {
        // Generate QR code as PNG and return as base64
        const result = await generateQRCode({
          content,
          size: pixelSize,
          errorCorrectionLevel,
          format: 'base64'
        });
        
        // Ensure we're sending clean base64 data
        // Remove any data URL prefixes if present
        const imageData = result.data.startsWith('data:') 
          ? result.data.split(',')[1] 
          : result.data;
        
        return {
          content: [
            { 
              type: "text", 
              text: `QR Code for "${content}":`
            },
            {
              type: "image",
              data: imageData,
              mimeType: "image/png"
            }
          ]
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Failed to generate QR code: ${errorMessage}` }],
        isError: true
      };
    }
  }
);

// Export the server instance to be used with a transport
export default server;