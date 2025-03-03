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
- **IMPORTANT**: Also use `--no-gpg-sign` with `npm version patch -m "chore: bump version to %s"` to prevent freezing

## Server Entry Points
- MCP Server: Use `build/main.js` as the main entry point for all MCP clients
- MCP Inspector: Use `make inspector-dev` to test with the inspector
- CLI usage: `node build/cli.js` for direct CLI features

## Release Process Sequence
1. Update version with `npm version patch -m "chore: bump version to %s"`  
2. Generate changelog with `npm run changelog`
3. Commit changelog with `git commit --no-gpg-sign -m "docs: update CHANGELOG.org [skip ci]"`
4. Push changes with `git push origin main && git push origin --tags`
5. Create draft release `gh release create v{VERSION} --draft`
6. Test with MCP Inspector `make inspector-dev`
7. Publish to npm `npm publish` (requires 2FA)
8. Verify package `npm view @jwalsh/mcp-server-qrcode version` 
9. Publish GitHub release `gh release edit v{VERSION} --draft=false`

## Pre-Release Verification
- Always test with MCP Inspector before release: `make inspector-dev`
- Verify functionality through both Inspector and Claude Desktop
- Confirm QR code generation works with various input types

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
- Server mode: Run `node build/main.js` to start MCP server
- Pipe input: `echo "content" | node build/cli.js` to generate QR code directly from stdin
- Direct CLI processing supports terminal-friendly output format
