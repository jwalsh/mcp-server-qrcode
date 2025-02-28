#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateQRCode(content) {
  try {
    const { stdout } = await execAsync(`qrencode -o - -t UTF8 "${content}"`);
    console.log(`QR Code for "${content}":\n\n${stdout}`);
  } catch (error) {
    console.error('Error generating QR code:', error.message);
  }
}

// Generate QR code for the provided text
generateQRCode('mcp-server-qrcode');
