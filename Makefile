CURRENT_DATE := $(shell date +%Y-%m-%d)
NAME := $(shell jq -r .name package.json)
VERSION := $(shell jq -r .version package.json)

.PHONY: help all install build clean run dev test test-watch test-coverage lint lint-fix format format-check typecheck ci publish deploy initialize setup quickstart check-publish release-patch release-minor release-major

# Default target
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

all: build ## Build the project (alias for build)

install: ## Install dependencies
	@echo "Installing dependencies..."
	npm install

build: install ## Build the project
	@echo "Building project..."
	npm run build
	@echo "Making CLI executable..."
	chmod +x build/cli.js

clean: ## Clean build artifacts and node_modules
	@echo "Cleaning build artifacts..."
	rm -rf build
	@echo "Cleaning node_modules..."
	rm -rf node_modules

run: build ## Run the QR Code MCP server
	@echo "Running QR Code MCP server..."
	./scripts/run.sh

dev: ## Run in development mode with ts-node
	@echo "Running in development mode..."
	npx ts-node --esm src/cli.ts

test: ## Run tests
	@echo "Running tests..."
	npm test

test-watch: ## Run tests in watch mode
	@echo "Running tests in watch mode..."
	npm run test:watch

test-coverage: ## Run tests with coverage reporting
	@echo "Running tests with coverage..."
	npm run test:coverage

ci: ## Run all checks (lint, format, typecheck, test)
	@echo "Running all checks..."
	npm run ci

lint: ## Lint code with ESLint
	@echo "Linting code..."
	npm run lint

lint-fix: ## Lint code and fix issues automatically
	@echo "Linting code and fixing issues..."
	npm run lint:fix

format: ## Format code with Prettier
	@echo "Formatting code..."
	npm run format

format-check: ## Check code formatting with Prettier
	@echo "Checking code formatting..."
	npm run format:check

typecheck: ## Check TypeScript types
	@echo "Type checking..."
	npm run typecheck

initialize: ## Initialize project
	@echo "Initializing project..."
	./scripts/initialize.sh

setup: ## Setup environment
	@echo "Setting up environment..."
	./scripts/setup.sh

quickstart: ## Quick start the application
	@echo "Quick starting the application..."
	./scripts/quick-start.sh

# Distribution file targets
.PHONY: build/package.json

build/package.json: package.json | build
	./scripts/generate-package-json.sh $< > $@

README.md: README.org
	@pandoc -o $@ $<

build/cli.js: src/cli.ts
	$(MAKE) build

build/index.js: src/index.ts
	$(MAKE) build

build-files: README.md LICENSE build/package.json build/cli.js build/index.js ## Prepare all distribution files

publish: clean build check-publish build-files ## Clean, build, check publication, and prepare distribution
	@echo "Publishing package..."
	npm publish

check-publish: ## Check package publication
	@echo "Checking package publication..."
	npm view @jwalsh/mcp-server-qrcode

deploy: build dist ## Package for deployment
	@echo "Creating deployment package..."
	cd dist && npm install --production
	@echo "Package created in ./dist directory"

release-patch: ## Release a patch version
	@./scripts/release.sh patch

release-minor: ## Release a minor version
	@./scripts/release.sh minor

release-major: ## Release a major version
	@./scripts/release.sh major

release: release-patch ## Alias for patch release
