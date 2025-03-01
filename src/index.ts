import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateQRCode } from './qrcode.js';

// Create an MCP server
const server = new McpServer({
  name: "QR Code Generator",
  version: "0.3.6"
});

// Register resource capabilities
server.server.registerCapabilities({
  resources: {
    root: "qrcode://",
    get: true,
    list: true
  }
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

// Set up resource handlers manually to work with the MCP protocol
const resourcesListRequestSchema = z.object({
  method: z.literal("resources/list"),
  params: z.object({})
});

server.server.setRequestHandler(resourcesListRequestSchema, async () => {
  // Return a list of available QR code resources
  return {
    resources: [
      {
        uri: "qrcode://sample",
        name: "Sample QR Code",
        description: "A sample QR code that links to the project repository"
      },
      {
        uri: "qrcode://hello-world",
        name: "Hello World",
        description: "A simple Hello World QR code example"
      },
      {
        uri: "qrcode://wifi?ssid=MyNetwork&password=password123&encryption=WPA",
        name: "WiFi QR Code",
        description: "Generate a QR code to connect to WiFi"
      },
      {
        uri: "qrcode://contact?name=John%20Doe&phone=555-123-4567&email=john@example.com",
        name: "Contact QR Code",
        description: "Generate a QR code with contact information"
      },
      {
        uri: "qrcode://url?url=https://anthropic.com",
        name: "URL QR Code",
        description: "Generate a QR code for a URL"
      }
    ]
  };
});

// Add resource retrieval method
const resourcesGetRequestSchema = z.object({
  method: z.literal("resources/get"),
  params: z.object({
    uri: z.string().describe("The resource URI to retrieve")
  })
});

server.server.setRequestHandler(resourcesGetRequestSchema, async (request) => {
  const uri = request.params.uri;
  try {
    // Validate URI format
    if (!uri.startsWith('qrcode://')) {
      throw new Error('Resource URI must start with qrcode://');
    }

    // Determine resource type and parameters
    let content = '';
    let size = 300;
    let errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M';

    if (uri === 'qrcode://sample') {
      // Sample QR code
      const result = await generateQRCode({
        content: "https://github.com/jwalsh/mcp-server-qrcode",
        size,
        errorCorrectionLevel,
        format: 'base64'
      });
      
      return {
        contents: [
          { 
            text: "Sample QR Code for MCP QR Code Server",
            uri: "qrcode://sample"
          },
          {
            uri: "qrcode://sample",
            blob: result.data,
            mimeType: "image/png"
          }
        ]
      };
    } else if (uri === 'qrcode://hello-world') {
      // Hello World QR code
      const result = await generateQRCode({
        content: "Hello, World!",
        size,
        errorCorrectionLevel,
        format: 'base64'
      });
      
      return {
        contents: [
          { 
            text: "Hello World QR Code Example",
            uri: "qrcode://hello-world"
          },
          {
            uri: "qrcode://hello-world",
            blob: result.data,
            mimeType: "image/png"
          }
        ]
      };
    } else if (uri.startsWith('qrcode://wifi?')) {
      // WiFi template
      const queryString = uri.split('?')[1] || '';
      const queryParams = new URLSearchParams(queryString);
      
      const ssid = queryParams.get('ssid');
      if (!ssid) {
        throw new Error('SSID is required for WiFi QR code');
      }
      
      const password = queryParams.get('password') || '';
      const encryption = queryParams.get('encryption')?.toUpperCase() || 'WPA';
      
      // Generate WiFi connection string in standard format
      // Format: WIFI:T:<encryption>;S:<ssid>;P:<password>;;
      const wifiContent = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
      
      const result = await generateQRCode({
        content: wifiContent,
        size,
        errorCorrectionLevel,
        format: 'base64'
      });
      
      return {
        contents: [
          { 
            text: `WiFi QR Code for "${ssid}"`,
            uri: uri
          },
          {
            uri: uri,
            blob: result.data,
            mimeType: "image/png"
          }
        ]
      };
    } else if (uri.startsWith('qrcode://contact?')) {
      // Contact template
      const queryString = uri.split('?')[1] || '';
      const queryParams = new URLSearchParams(queryString);
      
      const name = queryParams.get('name');
      if (!name) {
        throw new Error('Name is required for contact QR code');
      }
      
      const phone = queryParams.get('phone') || '';
      const email = queryParams.get('email') || '';
      
      // Generate contact string in vCard format
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        phone ? `TEL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        'END:VCARD'
      ].filter(line => line).join('\n');
      
      const result = await generateQRCode({
        content: vcard,
        size,
        errorCorrectionLevel,
        format: 'base64'
      });
      
      return {
        contents: [
          { 
            text: `Contact QR Code for "${name}"`,
            uri: uri
          },
          {
            uri: uri,
            blob: result.data,
            mimeType: "image/png"
          }
        ]
      };
    } else if (uri.startsWith('qrcode://url?')) {
      // URL template
      const queryString = uri.split('?')[1] || '';
      const queryParams = new URLSearchParams(queryString);
      
      const url = queryParams.get('url');
      if (!url) {
        throw new Error('URL is required for URL QR code');
      }
      
      // Parse size parameter if present
      if (queryParams.has('size')) {
        const sizeParam = parseInt(queryParams.get('size')!, 10);
        if (!isNaN(sizeParam)) {
          size = sizeParam;
        }
      }
      
      // Parse error correction level if present
      const levelParam = queryParams.get('level');
      if (levelParam && ['L', 'M', 'Q', 'H'].includes(levelParam)) {
        errorCorrectionLevel = levelParam as 'L' | 'M' | 'Q' | 'H';
      }
      
      const result = await generateQRCode({
        content: url,
        size,
        errorCorrectionLevel,
        format: 'base64'
      });
      
      return {
        contents: [
          { 
            text: `URL QR Code for "${url}"`,
            uri: uri
          },
          {
            uri: uri,
            blob: result.data,
            mimeType: "image/png"
          }
        ]
      };
    } else {
      // Custom resource - Extract content and parameters from the URI
      const contentMatch = uri.match(/^qrcode:\/\/(.+?)(?:\?|$)/);
      content = contentMatch ? contentMatch[1] : '';
      
      if (!content) {
        throw new Error('Content parameter is required');
      }
      
      // Extract query parameters
      const queryString = uri.includes('?') ? uri.split('?')[1] : '';
      const queryParams = new URLSearchParams(queryString);
      
      // Parse size parameter if present
      if (queryParams.has('size')) {
        const sizeParam = parseInt(queryParams.get('size')!, 10);
        if (!isNaN(sizeParam)) {
          size = sizeParam;
        }
      }
      
      // Parse error correction level if present
      const levelParam = queryParams.get('level');
      if (levelParam && ['L', 'M', 'Q', 'H'].includes(levelParam)) {
        errorCorrectionLevel = levelParam as 'L' | 'M' | 'Q' | 'H';
      }
      
      // Generate QR code
      const result = await generateQRCode({
        content: decodeURIComponent(content),
        size,
        errorCorrectionLevel,
        format: 'base64'
      });
      
      return {
        contents: [
          { 
            text: `QR Code for "${decodeURIComponent(content)}"`,
            uri: uri
          },
          {
            uri: uri,
            blob: result.data,
            mimeType: "image/png"
          }
        ]
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      contents: [{ text: `Failed to retrieve resource: ${errorMessage}`, uri: uri }],
      isError: true
    };
  }
});

// Export the server instance to be used with a transport
export default server;