import * as qrcode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export async function generateQRCode(
  content: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 200,
    errorCorrectionLevel = 'M'
  } = options;

  if (!content) {
    throw new Error('Content is required for QR code generation');
  }

  if (size < 100 || size > 1000) {
    throw new Error('QR code size must be between 100 and 1000 pixels');
  }

  try {
    const qrCodeDataUrl = await qrcode.toDataURL(content, {
      width: size,
      errorCorrectionLevel
    });

    return qrCodeDataUrl;
  } catch (error) {
    throw new Error(`QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateQRCodeInput(content: string): boolean {
  // Additional input validation if needed
  return content.trim().length > 0;
}
