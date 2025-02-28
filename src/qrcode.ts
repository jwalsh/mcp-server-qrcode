/**
 * QR Code Generator Core Functionality
 * 
 * This module provides QR code generation capabilities that can be used
 * by both the CLI interface and MCP server implementation.
 */
import * as qrcode from 'qrcode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

export interface QRCodeOptions {
  content: string;
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  format?: 'dataURL' | 'utf8' | 'terminal' | 'png' | 'base64';
}

export interface QRCodeResult {
  content: string;
  format: 'dataURL' | 'utf8' | 'terminal' | 'png' | 'base64';
  data: string;
  mimeType?: string;
}

/**
 * Generate a QR code with various output formats
 */
export async function generateQRCode(options: QRCodeOptions): Promise<QRCodeResult> {
  const {
    content,
    size = 200, 
    errorCorrectionLevel = 'M',
    format = 'dataURL'
  } = options;

  if (!content) {
    throw new Error('Content is required for QR code generation');
  }

  if (size < 100 || size > 1000) {
    throw new Error('QR code size must be between 100 and 1000 pixels');
  }

  try {
    // Different output formats
    if (format === 'dataURL') {
      // Generate QR code as data URL (base64 image)
      const dataUrl = await qrcode.toDataURL(content, {
        width: size,
        errorCorrectionLevel
      });
      
      return {
        content,
        format: 'dataURL',
        data: dataUrl,
        mimeType: 'image/png'
      };
    } else if (format === 'utf8' || format === 'terminal') {
      // Generate QR code as UTF8 text
      try {
        // Try to use system qrencode for best terminal output
        const sizeOption = Math.max(1, Math.floor(size / 100)); // Convert pixel size to qrencode size (1-10)
        const { stdout } = await execAsync(
          `qrencode -o - -t UTF8 -l ${errorCorrectionLevel} -s ${sizeOption} '${content.replace(/'/g, "'\\''")}'`
        );
        
        return {
          content,
          format: 'terminal',
          data: stdout
        };
      } catch (err) {
        // Fallback to qrcode library if qrencode not available
        const qrCodeText = await qrcode.toString(content, {
          type: format === 'terminal' ? 'terminal' : 'utf8',
          errorCorrectionLevel
        });
        
        return {
          content,
          format: format as 'utf8' | 'terminal',
          data: qrCodeText
        };
      }
    } else if (format === 'png' || format === 'base64') {
      // For MCP server - generate QR code as PNG and return as base64
      const tempFilePath = join(tmpdir(), `qrcode-${randomUUID()}.png`);
      
      try {
        // Try using qrencode first (better quality)
        const sizeOption = Math.max(1, Math.floor(size / 100));
        await execAsync(
          `qrencode -o "${tempFilePath}" -l ${errorCorrectionLevel} -s ${sizeOption} '${content.replace(/'/g, "'\\''")}'`
        );
      } catch (err) {
        // Fallback to qrcode library
        await qrcode.toFile(tempFilePath, content, {
          width: size,
          errorCorrectionLevel
        });
      }
      
      // Read the file as buffer and encode as base64
      const imageBuffer = await readFile(tempFilePath);
      const base64Image = imageBuffer.toString('base64');
      
      return {
        content,
        format: 'base64',
        data: base64Image,
        mimeType: 'image/png'
      };
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    throw new Error(`QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate QR code input content
 */
export function validateQRCodeInput(content: string): boolean {
  return content.trim().length > 0;
}