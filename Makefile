.PHONY: help all install build clean run dev test test-watch test-coverage lint lint-fix format format-check typecheck ci publish deploy initialize setup quickstart check-publish release release-patch release-minor release-major

# Default target
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ... [Previous Makefile contents remain the same] ...

# Release management
release-patch: ## Release a patch version
	@./scripts/release.sh patch

release-minor: ## Release a minor version
	@./scripts/release.sh minor

release-major: ## Release a major version
	@./scripts/release.sh major

release: release-patch ## Alias for patch release
