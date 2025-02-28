import { generateQRCode, validateQRCodeInput, QRCodeOptions } from '../qr-generator';

describe('QR Code Generator', () => {
  describe('generateQRCode', () => {
    it('should generate a QR code for a simple URL', async () => {
      const url = 'https://example.com';
      const qrCode = await generateQRCode(url);
      
      expect(qrCode).toBeTruthy();
      expect(qrCode.startsWith('data:image/png;base64,')).toBeTruthy();
    });

    it('should generate a QR code with custom size', async () => {
      const url = 'https://example.com';
      const options: QRCodeOptions = { size: 300 };
      const qrCode = await generateQRCode(url, options);
      
      expect(qrCode).toBeTruthy();
    });

    it('should generate a QR code with different error correction levels', async () => {
      const url = 'https://example.com';
      const levels: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H'];
      
      for (const level of levels) {
        const qrCode = await generateQRCode(url, { errorCorrectionLevel: level });
        expect(qrCode).toBeTruthy();
      }
    });

    it('should throw an error for empty content', async () => {
      await expect(generateQRCode('')).rejects.toThrow('Content is required');
    });

    it('should throw an error for invalid size', async () => {
      await expect(generateQRCode('https://example.com', { size: 50 }))
        .rejects.toThrow('QR code size must be between 100 and 1000 pixels');
      
      await expect(generateQRCode('https://example.com', { size: 2000 }))
        .rejects.toThrow('QR code size must be between 100 and 1000 pixels');
    });
  });

  describe('validateQRCodeInput', () => {
    it('should return true for non-empty string', () => {
      expect(validateQRCodeInput('https://example.com')).toBeTruthy();
      expect(validateQRCodeInput('Hello, World!')).toBeTruthy();
    });

    it('should return false for empty or whitespace-only strings', () => {
      expect(validateQRCodeInput('')).toBeFalsy();
      expect(validateQRCodeInput('   ')).toBeFalsy();
      expect(validateQRCodeInput('\t\n')).toBeFalsy();
    });
  });
});
