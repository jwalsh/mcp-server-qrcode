#!/usr/bin/env node
/**
 * Main entry point for the MCP QR Code server.
 *
 * This file simply connects the MCP server to a stdio transport.
 */
import server from './index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

// Create a stdio transport
const transport = new StdioServerTransport()

// Connect the server to the transport
server.connect(transport).catch(error => {
  console.error('Failed to start server:', error instanceof Error ? error.message : String(error))
  process.exit(1)
})
