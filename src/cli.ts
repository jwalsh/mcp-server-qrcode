#!/usr/bin/env node
import server from './index.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { program } from 'commander';

program
  .name('mcp-server-qrcode')
  .description('MCP server for generating QR codes')
  .version('0.1.0')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    try {
      const verbose = options.verbose || false;
      console.log(`Starting QR Code MCP server with verbose: ${verbose}`);
      
      // Create a stdio transport for the server
      const transport = new StdioServerTransport();
      
      // Connect the server to the transport
      await server.connect(transport);
      
      console.log('QR Code MCP server is running');
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  });

program.parse();