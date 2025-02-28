import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

// Create an MCP server
const server = new McpServer({
  name: "QR Code Generator",
  version: "0.1.0"
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
    format: z.enum(["png", "utf8"])
      .describe("Output format for the QR code")
      .optional()
      .default("png")
  },
  async ({ content, errorCorrectionLevel, size, format }) => {
    try {
      // Construct qrencode command with options
      const ecOption = `-l ${errorCorrectionLevel}`;
      const sizeOption = `-s ${size}`;
      
      if (format === "utf8") {
        // Generate QR code in UTF8 format directly to stdout
        const { stdout, stderr } = await execAsync(
          `qrencode -o - -t UTF8 ${ecOption} ${sizeOption} '${content.replace(/'/g, "'\\''")}'`
        );
        
        if (stderr) {
          return {
            content: [{ type: "text", text: `Error: ${stderr}` }],
            isError: true
          };
        }
        
        return {
          content: [{ type: "text", text: `QR Code for "${content}":\n\n${stdout}` }]
        };
      } else {
        // Generate QR code as PNG and return as base64
        const tempFilePath = join(tmpdir(), `qrcode-${randomUUID()}.png`);
        
        await execAsync(
          `qrencode -o "${tempFilePath}" ${ecOption} ${sizeOption} '${content.replace(/'/g, "'\\''")}'`
        );
        
        // Read the file as buffer and encode as base64
        const imageBuffer = await readFile(tempFilePath);
        const base64Image = imageBuffer.toString('base64');
        
        return {
          content: [
            { 
              type: "text", 
              text: `QR Code for "${content}":`
            },
            {
              type: "image",
              data: base64Image,
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