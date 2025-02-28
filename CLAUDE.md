# Claude's Development Notes for MCP QR Code Server

## Project Setup

### Key Development Requirements
- TypeScript
- ESLint v9 Flat Configuration
- Node.js 18.0.0+
- Org-mode Documentation

### Onboarding Workflow
1. Clone repository
2. Run `make initialize`
3. Run `make setup`
4. For development: `make dev`
5. To start application: `make quickstart`
6. Run tests: `make test`
7. Lint code: `make lint`
8. Fix linting issues: `make lint-fix`

## Git Commit Requirements
- **CRITICAL**: ALWAYS use `git commit --no-gpg-sign` when committing
- **NEVER** allow GPG signing of commits as it breaks the tooling
- This applies to all commits in this repository

## ESLint Migration Notes
- Migrated to flat configuration in `eslint.config.js`
- Added `@stylistic/eslint-plugin` for consistent formatting
- Removed legacy `.eslintrc.json`

## Continuous Integration
- Comprehensive checks via `make ci`
- Includes linting, formatting, type checking, and testing

## Scripting
- Added initialization scripts in `./scripts/`
- Supports environment setup and quick start

## Dependency Management
- Use npm for package management
- Strict Node.js version requirement (18.0.0+)

## Documentation Strategy
- IMPORTANT: Use org-mode ONLY for ALL documentation
- Do NOT update or use README.md - use README.org instead
- Keep README.org high-level and usage-focused
- Detailed setup in DEVELOPERS.org
- Use CONTRIBUTING.org for contribution guidelines
- All documentation uses .org extension (not .md)

## CLI Usage
- Server mode: Run `node build/cli.js` to start MCP server
- Pipe input: `echo "content" | node build/cli.js` to generate QR code directly from stdin
- Direct CLI processing supports terminal-friendly output format
