/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json'
      }
    ]
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**'
  ],
  coverageThreshold: {
    // The core QR generation logic is unit-tested and held to a high bar.
    // The MCP server (index.ts), CLI (cli.ts) and stdio entrypoint (main.ts) are
    // integration-level wiring; they are exercised by integration testing rather
    // than unit-coverage gates. Tighten these as unit tests are added.
    './src/qrcode.ts': {
      branches: 80,
      functions: 90,
      lines: 85,
      statements: 85
    }
  }
};
