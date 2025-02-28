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
- Use org-mode for all developer documentation
- Keep README.org high-level and usage-focused
- Detailed setup in DEVELOPERS.org
