import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateQRCode } from './qrcode.js';

// Create an MCP server
const server = new McpServer({
  name: "QR Code Generator",
  version: "0.3.6"
});

// Register capabilities
server.server.registerCapabilities({
  resources: {
    root: "qrcode://",
    get: true,
    list: true
  },
  prompts: {
    list: true
  }
});

// Add the QR code generation tool
server.tool(
  "generate-qrcode",
  "Generate QR codes in various formats with customizable error correction levels and sizes",
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
  async (args, _extra) => {
    try {
      const { content, errorCorrectionLevel, size, format } = args;
      
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
            text: `QR code generated for: ${content}` 
          },{
            type: "text",
            text: result.data
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
              text: `QR code generated for: ${content}`
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
      },
      {
        uri: "qrcode://text?content=Hello%20World!&size=250&level=Q",
        name: "Text QR Code",
        description: "Generate a QR code containing plain text"
      },
      {
        uri: "qrcode://calendar?title=Team%20Meeting&start=2025-03-15T10:00:00&end=2025-03-15T11:00:00",
        name: "Calendar Event QR Code",
        description: "Generate a QR code for a calendar event"
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
      const organization = queryParams.get('organization') || '';
      const title = queryParams.get('title') || '';
      const url = queryParams.get('url') || '';
      const address = queryParams.get('address') || '';
      
      // Generate contact string in vCard format
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        phone ? `TEL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        organization ? `ORG:${organization}` : '',
        title ? `TITLE:${title}` : '',
        url ? `URL:${url}` : '',
        address ? `ADR:;;${address};;;` : '',
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
    } else if (uri.startsWith('qrcode://text?')) {
      // Text template
      const queryString = uri.split('?')[1] || '';
      const queryParams = new URLSearchParams(queryString);
      
      const content = queryParams.get('content');
      if (!content) {
        throw new Error('Content is required for text QR code');
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
        content: decodeURIComponent(content),
        size,
        errorCorrectionLevel,
        format: 'base64'
      });
      
      return {
        contents: [
          { 
            text: `Text QR Code: "${decodeURIComponent(content)}"`,
            uri: uri
          },
          {
            uri: uri,
            blob: result.data,
            mimeType: "image/png"
          }
        ]
      };
    } else if (uri.startsWith('qrcode://calendar?')) {
      // Calendar template
      const queryString = uri.split('?')[1] || '';
      const queryParams = new URLSearchParams(queryString);
      
      const title = queryParams.get('title');
      if (!title) {
        throw new Error('Title is required for calendar event QR code');
      }
      
      const start = queryParams.get('start');
      if (!start) {
        throw new Error('Start time is required for calendar event QR code');
      }
      
      const end = queryParams.get('end') || '';
      const location = queryParams.get('location') || '';
      const description = queryParams.get('description') || '';
      
      // Generate calendar string in iCalendar format
      const uid = `event-${Date.now()}@qrcode-generator`;
      const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
      
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MCP QR Code Generator//EN',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART:${start.replace(/[-:.]/g, '').slice(0, 15)}Z`,
        end ? `DTEND:${end.replace(/[-:.]/g, '').slice(0, 15)}Z` : '',
        `SUMMARY:${title}`,
        location ? `LOCATION:${location}` : '',
        description ? `DESCRIPTION:${description}` : '',
        'END:VEVENT',
        'END:VCALENDAR'
      ].filter(line => line).join('\r\n');
      
      // Parse size and error correction parameters
      if (queryParams.has('size')) {
        const sizeParam = parseInt(queryParams.get('size')!, 10);
        if (!isNaN(sizeParam)) {
          size = sizeParam;
        }
      }
      
      const levelParam = queryParams.get('level');
      if (levelParam && ['L', 'M', 'Q', 'H'].includes(levelParam)) {
        errorCorrectionLevel = levelParam as 'L' | 'M' | 'Q' | 'H';
      }
      
      const result = await generateQRCode({
        content: ical,
        size,
        errorCorrectionLevel,
        format: 'base64'
      });
      
      return {
        contents: [
          { 
            text: `Calendar Event QR Code: "${title}"`,
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

// Add resource templates list method
const resourcesTemplatesListRequestSchema = z.object({
  method: z.literal("resources/templates/list"),
  params: z.object({})
});

server.server.setRequestHandler(resourcesTemplatesListRequestSchema, async () => {
  // Return a list of available QR code resource templates
  return {
    resourceTemplates: [
      {
        name: "wifi-template",
        description: "Generate a QR code that connects devices to a WiFi network",
        example: "qrcode://wifi?ssid=MyWiFiNetwork&password=securepassword&encryption=WPA",
        inputSchema: {
          type: "object",
          properties: {
            ssid: {
              type: "string",
              description: "Network name"
            },
            encryption: {
              type: "string",
              enum: ["WPA", "WEP", "nopass"],
              description: "Encryption type"
            },
            password: {
              type: "string",
              description: "Network password"
            },
            hidden: {
              type: "boolean",
              description: "Whether the network is hidden",
              default: false
            }
          },
          required: ["ssid", "encryption"]
        }
      },
      {
        name: "contact-template",
        description: "Generate a QR code containing contact information in vCard format",
        example: "qrcode://contact?name=Jane%20Doe&phone=555-123-4567&email=jane@example.com",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Contact name"
            },
            phone: {
              type: "string",
              description: "Phone number"
            },
            email: {
              type: "string",
              description: "Email address"
            },
            organization: {
              type: "string",
              description: "Organization or company name"
            },
            title: {
              type: "string",
              description: "Job title or position"
            },
            url: {
              type: "string",
              description: "Website URL"
            },
            address: {
              type: "string",
              description: "Physical address"
            }
          },
          required: ["name"]
        }
      },
      {
        name: "url-template",
        description: "Generate a QR code that opens a website or web resource",
        example: "qrcode://url?url=https://example.com&size=300&level=H",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL to encode"
            },
            size: {
              type: "number",
              description: "Size of the QR code (100-1000 pixels)",
              default: 300
            },
            level: {
              type: "string",
              enum: ["L", "M", "Q", "H"],
              description: "Error correction level",
              default: "M"
            }
          },
          required: ["url"]
        }
      },
      {
        name: "text-template",
        description: "Generate a QR code containing plain text",
        example: "qrcode://text?content=This%20is%20a%20sample%20text%20message&size=250&level=Q", 
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "Text content to encode"
            },
            size: {
              type: "number",
              description: "Size of the QR code (100-1000 pixels)",
              default: 250
            },
            level: {
              type: "string",
              enum: ["L", "M", "Q", "H"],
              description: "Error correction level",
              default: "M"
            }
          },
          required: ["content"]
        }
      },
      {
        name: "calendar-template",
        description: "Generate a QR code for calendar events in iCalendar format",
        example: "qrcode://calendar?title=Team%20Meeting&start=2025-03-15T10:00:00&end=2025-03-15T11:00:00&location=Conference%20Room&description=Weekly%20team%20sync",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Event title"
            },
            start: {
              type: "string",
              description: "Start time in ISO format (YYYY-MM-DDTHH:MM:SS)"
            },
            end: {
              type: "string",
              description: "End time in ISO format (YYYY-MM-DDTHH:MM:SS)"
            },
            location: {
              type: "string",
              description: "Event location"
            },
            description: {
              type: "string",
              description: "Event description"
            }
          },
          required: ["title", "start"]
        }
      }
    ]
  };
});

// Add prompts list method
const promptsListRequestSchema = z.object({
  method: z.literal("prompts/list"),
  params: z.object({})
});

server.server.setRequestHandler(promptsListRequestSchema, async () => {
  // Return a list of example prompts for QR code generation
  return {
    prompts: [
      {
        name: "create-wifi-qr",
        description: "Create a QR code for connecting to a WiFi network",
        prompt: "Generate a QR code that allows people to connect to my home WiFi network called 'MyHomeNetwork' with password 'secure123' using WPA encryption"
      },
      {
        name: "create-contact-qr",
        description: "Create a QR code with contact information",
        prompt: "Create a QR code with my contact information: name: Jane Smith, phone: 555-987-6543, email: jane@example.com, organization: ABC Corp, title: Senior Developer"
      },
      {
        name: "create-url-qr",
        description: "Create a QR code for a website URL",
        prompt: "Make a QR code for my website at https://example.com with high error correction"
      },
      {
        name: "create-text-qr",
        description: "Create a QR code with plain text",
        prompt: "Generate a QR code with this text message: 'Thank you for visiting our booth at the conference! Use discount code CONF2025 for 20% off your next purchase.'"
      },
      {
        name: "create-calendar-qr",
        description: "Create a QR code for a calendar event",
        prompt: "Create a QR code for our team meeting on March 15, 2025 from 10:00 AM to 11:30 AM in Conference Room A with the description 'Quarterly planning session'"
      },
      {
        name: "create-custom-sized-qr",
        description: "Create a QR code with custom size settings",
        prompt: "Generate a large QR code (size 8) for my business URL https://mybusiness.example.com"
      },
      {
        name: "qr-with-high-error-correction",
        description: "Create a QR code with high error correction level",
        prompt: "Create a QR code for https://example.org with the highest possible error correction level for maximum reliability"
      },
      {
        name: "text-output-qr",
        description: "Create a QR code with text output format",
        prompt: "Generate a QR code for 'Hello World' and display it as ASCII/text art that I can paste into a document"
      }
    ]
  };
});

// Export the server instance to be used with a transport
export default server;
