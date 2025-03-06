# Claude's Development Notes for MCP QR Code Server

## FreeBSD/BSD Compatibility
- **Make**: Use `gmake` on FreeBSD/BSD systems (required - BSD make is incompatible)
- **Grep Issue**: FreeBSD grep lacks some GNU features - may need to install GNU grep
- The Makefile help target fails on FreeBSD due to grep incompatibility
- If scripts fail, you may need to install GNU versions of utilities:
  - `pkg install gnugrep` for GNU grep (ggrep)
  - `pkg install coreutils` for GNU date (gdate) and other core utilities

## Development Commands
- Setup: `gmake initialize` then `gmake setup` (FreeBSD) or `make initialize` then `make setup` (Linux/macOS)
- Development: `gmake dev` (FreeBSD) or `make dev` (Linux/macOS)
- Run server: `node build/main.js` (works everywhere)
- Build: `npm run build` (works everywhere)
- Test all: `npm test` (works everywhere)
- Test single file: `node --experimental-vm-modules node_modules/jest/bin/jest.js src/__tests__/file.test.ts`
- Test single case: `node --experimental-vm-modules node_modules/jest/bin/jest.js -t "test description"`
- Lint: `npm run lint` (works everywhere)
- Type check: `npm run typecheck`
- Format: `npm run format`
- CI checks: `npm run ci` (prefer npm commands on FreeBSD)

## Code Style Guidelines
- **TypeScript**: Explicit return types required, minimize `any` usage
- **Formatting**: 2 spaces, single quotes, semicolons, 120 chars max line length
- **Naming**: camelCase for variables/functions, PascalCase for types/classes, UPPER_SNAKE_CASE for constants
- **Imports**: Group by external → MCP SDK → project → Node.js std lib
- **Error handling**: Use explicit error types and descriptive messages
- **Documentation**: JSDoc for public APIs, inline comments for complex logic
- **Git commits**: Use conventional commit format, ALWAYS add `--no-gpg-sign` flag

## Server Entry Points
- Production: `build/main.js` for MCP clients
- Inspector: `make inspector-dev`
- CLI: `node build/cli.js` for direct features

## Documentation Strategy
- Use org-mode ONLY (.org extension) for ALL documentation
- Keep README.org high-level, DEVELOPERS.org for setup details
- Use CONTRIBUTING.org for contribution guidelines

## Git Requirements
- **CRITICAL**: ALWAYS use `git commit --no-gpg-sign` - GPG signing breaks tooling
- **IMPORTANT**: Use `--no-gpg-sign` with all version commands