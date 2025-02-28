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
npm version "$BUMP_TYPE" --no-gpg-sign -m "chore: bump version to %s"

# Generate changelog
npx conventional-changelog -p angular -i CHANGELOG.org -s

# Stage changelog
git add CHANGELOG.org

# Commit changelog updates with no GPG signing and [skip ci]
git commit --no-gpg-sign -m "docs: update CHANGELOG.org for new version [skip ci]"

# Push changes and tags
git push origin main
git push origin --tags

# Generate package tarball
npm pack

# Create GitHub draft release
VERSION=$(jq -r .version package.json)
gh release create "v$VERSION" *.tgz --title "v$VERSION" --notes "See CHANGELOG.org for details" --draft

# Prompt to manually publish to npm due to 2FA requirement
echo "Package is ready for npm publishing."
echo "Due to 2FA requirements, run: npm publish"

# Prompt for verification and finalization
echo "After npm publish, verify:"
echo "1. Run: npm view @jwalsh/mcp-server-qrcode version"
echo "2. Test with MCP Inspector: make inspector-dev"
echo "3. Publish GitHub release: gh release edit v$VERSION --draft=false"

echo "Release process completed successfully!"
