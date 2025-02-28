#!/usr/bin/env node
import server from './index.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { program } from 'commander';
import { generateQRCode } from './qrcode.js';

// Check if we have stdin data (piped input)
const hasStdin = !process.stdin.isTTY;

// Configure the CLI
program
  .name('mcp-server-qrcode')
  .description('MCP server for generating QR codes')
  .version('0.1.0')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-g, --generate <content>', 'Generate QR code from the provided content')
  .option('-s, --size <size>', 'Size of the QR code (100-1000 pixels)', '200')
  .option('-e, --error-correction <level>', 'Error correction level (L, M, Q, H)', 'M');

// Check for stdin piping first
if (hasStdin) {
  // Handle piped input
  let inputData = '';
  
  process.stdin.on('data', (chunk) => {
    inputData += chunk;
  });
  
  process.stdin.on('end', async () => {
    try {
      const content = inputData.trim();
      if (!content) {
        console.error('Error: No content provided for QR code generation');
        process.exit(1);
      }
      
      // Generate QR code in terminal-friendly format
      const result = await generateQRCode({
        content,
        size: 200,
        errorCorrectionLevel: 'M',
        format: 'terminal'
      });
      
      // Output the QR code to the terminal
      console.log(result.data);
    } catch (error) {
      console.error('Error generating QR code:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
} else {
  // Parse arguments for other modes
  program.action(async (options) => {
    try {
      // Check if we're in generate mode
      if (options.generate) {
        const result = await generateQRCode({
          content: options.generate,
          size: parseInt(options.size, 10),
          errorCorrectionLevel: options.errorCorrection as 'L' | 'M' | 'Q' | 'H',
          format: 'terminal'
        });
        console.log(result.data);
      } else {
        // Otherwise, start in server mode
        const verbose = options.verbose || false;
        console.log(`Starting QR Code MCP server with verbose: ${verbose}`);
        
        // Create a stdio transport for the server
        const transport = new StdioServerTransport();
        
        // Connect the server to the transport
        await server.connect(transport);
        
        console.log('QR Code MCP server is running');
      }
    } catch (error) {
      console.error('Failed to start server or generate QR code:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
  
  // Parse command line arguments
  program.parse();
}