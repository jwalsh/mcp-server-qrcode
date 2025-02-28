#!/usr/bin/env node

// Simple test script to manually verify the QR code server functionality
// Run with: node test-qrcode.js

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// Start the server process
const server = spawn('node', ['build/cli.js'], {
  stdio: ['pipe', 'pipe', process.stderr]
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Function to send a message to the server
async function sendMessage(message) {
  const msgStr = JSON.stringify(message);
  const lenStr = msgStr.length.toString();
  
  server.stdin.write(`Content-Length: ${lenStr}\r\n\r\n${msgStr}`);
}

// Function to read response from the server
async function readResponse() {
  return new Promise((resolve) => {
    let data = '';
    let contentLength = 0;
    let isReadingHeaders = true;
    
    server.stdout.on('data', (chunk) => {
      data += chunk.toString();
      
      if (isReadingHeaders && data.includes('\r\n\r\n')) {
        const headerEndIndex = data.indexOf('\r\n\r\n');
        const headers = data.substring(0, headerEndIndex);
        const contentLengthMatch = headers.match(/Content-Length: (\d+)/);
        
        if (contentLengthMatch) {
          contentLength = parseInt(contentLengthMatch[1], 10);
          isReadingHeaders = false;
          data = data.substring(headerEndIndex + 4); // Skip the \r\n\r\n
        }
      }
      
      if (!isReadingHeaders && data.length >= contentLength) {
        const responseData = data.substring(0, contentLength);
        resolve(JSON.parse(responseData));
        
        // Remove event listener to avoid reading more responses
        server.stdout.removeAllListeners('data');
      }
    });
  });
}

// Main function to test the server
async function main() {
  try {
    console.log('Sending initialization message...');
    
    // Send initialization message
    await sendMessage({
      type: 'initialize',
      version: '0.1.0',
      client: {
        name: 'test-client',
        version: '0.1.0'
      },
      capabilities: {
        tools: {}
      }
    });
    
    // Wait for the server to be ready
    await setTimeout(1000);
    
    // Call the QR code generation tool
    console.log('Generating QR code...');
    await sendMessage({
      type: 'tool-call',
      id: '1',
      params: {
        name: 'generate-qrcode',
        arguments: {
          content: 'https://modelcontextprotocol.io',
          errorCorrectionLevel: 'H',
          size: 3
        }
      }
    });
    
    // Read and display the response
    const response = await readResponse();
    console.log('Response received:');
    console.log(response);
    
    // Close the server
    server.stdin.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
