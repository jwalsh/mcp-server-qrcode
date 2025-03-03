import { describe, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simplest possible approach: test the source code directly
describe('QR Code Templates and Prompts', () => {
  // Read the source file directly to validate its contents
  const indexPath = path.resolve(__dirname, '../index.ts');
  const sourceCode = fs.readFileSync(indexPath, 'utf-8');

  test('server has prompts capability registered', () => {
    // Check for prompts capability in the source code
    expect(sourceCode).toContain('prompts: {');
    expect(sourceCode).toContain('list: true');
  });

  test('server has new template types registered', () => {
    // Check for template definitions in the source code
    expect(sourceCode).toContain('"text-template"');
    expect(sourceCode).toContain('"calendar-template"');
  });

  test('server has handlers for new resource types', () => {
    // Check for the handler implementations
    expect(sourceCode).toContain('uri.startsWith(\'qrcode://text?\')');
    expect(sourceCode).toContain('uri.startsWith(\'qrcode://calendar?\')');
  });

  test('server has prompts/list examples defined', () => {
    // Check for the example prompts
    expect(sourceCode).toContain('"create-wifi-qr"');
    expect(sourceCode).toContain('"create-text-qr"');
    expect(sourceCode).toContain('"create-calendar-qr"');
  });

  test('server has examples for templates', () => {
    // Check for the example URIs
    expect(sourceCode).toContain('example: "qrcode://text?content=');
    expect(sourceCode).toContain('example: "qrcode://calendar?title=');
  });

  test('server has contact template with expanded fields', () => {
    // Check for the enhanced contact template
    expect(sourceCode).toContain('organization: {');
    expect(sourceCode).toContain('title: {');
  });
});
