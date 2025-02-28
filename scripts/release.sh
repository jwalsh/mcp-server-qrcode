#!/bin/bash
set -e

# Ensure we're on the main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Error: You must be on the main branch to release"
    exit 1
fi

# Determine version bump type
BUMP_TYPE=${1:-patch}

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo "Invalid bump type. Use 'major', 'minor', or 'patch'"
    exit 1
fi

# Update version in package.json
npm version "$BUMP_TYPE" -m "Bump version to %s"

# Generate changelog
npx conventional-changelog -p angular -i CHANGELOG.org -s

# Stage changelog
git add CHANGELOG.org

# Commit changelog updates
git commit -m "Update CHANGELOG.org for new version"

# Push changes and tags
git push origin main
git push origin --tags

# Optional: Publish to npm
npm publish

echo "Release process completed successfully!"
