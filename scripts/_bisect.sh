#!/usr/bin/env bash
#
# Script to rewrite commit messages for a private repo
# Usage:
#   ./scripts/_bisect.sh            # Dry run - shows what would change
#   ./scripts/_bisect.sh --force    # Apply changes

# Define commit message mappings - full history with conventional commits
declare -A MAPPINGS=(
    ["d30d24c"]="feat: add QR code generation via stdin and MCP server"
    ["49ac61d"]="docs: add debugging section and inspector targets"
    ["27d1e5b"]="chore: bump version to 0.2.4"
    ["c12c004"]="chore: bump version to 0.2.3"
    ["d7ad89a"]="chore: mark all scripts as executable"
    ["3d2bae0"]="feat: add script to rewrite commit messages"
    ["016f89b"]="feat: enhance build process and update documentation"
    ["d2fdb33"]="chore: bump version to 0.2.2"
    ["24e06a4"]="chore: bump version to 0.2.1"
    ["8c34892"]="refactor: consolidate build and publish process"
    ["289fb82"]="feat: implement release management with changelog generation"
    ["c41b29c"]="chore: bump version to 0.2.0 and add publish check"
    ["84b8c9d"]="docs: update documentation, prepare for initial publication"
    ["eab4b0c"]="chore: remove unused commit.sh script"
    ["b244d35"]="feat: initial QR Code MCP Server implementation"
    ["ab00ef4"]="feat: add context target for LLM operations"
    ["c312fd2"]="docs: add critical note about no GPG signing for commits"
    ["b3da5f0"]="chore: update commit message mapping for entire history"
    ["5598070"]="feat: prepare for package publishing"
    ["66d261f"]="fix: improve commit history rewriting script"
)

# Claude footer to add to all commits
CLAUDE_FOOTER="🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>"

# Default to dry run
amend=false

# Check for --amend or --force flag
while [[ $# -gt 0 ]]; do
    case "$1" in
    --amend | --force)
        amend=true
        shift
        ;;
    *)
        echo "Unknown argument: $1"
        exit 1
        ;;
    esac
done

# For dry run mode, show what would be changed
if [ "$amend" = false ]; then
    for sha in "${!MAPPINGS[@]}"; do
        message="${MAPPINGS[$sha]}"
        
        echo "Commit $sha:"
        echo "Original message:"
        git log --format=%B -n 1 "$sha" 2>/dev/null || echo "Cannot find commit $sha"
        echo "New message:"
        echo "$message"
        echo ""
        echo "$CLAUDE_FOOTER"
        echo "------------------------"
    done
    echo "Dry run complete. Use --amend or --force flag to actually rewrite commits."
else
    # For each commit in the mapping
    for sha in "${!MAPPINGS[@]}"; do
        message="${MAPPINGS[$sha]}"
        
        # Get original commit message body if any (excluding Claude footer if it exists)
        body=$(git log -n 1 --format=%b "$sha" | grep -v "Generated with \[Claude Code\]" | grep -v "Co-Authored-By: Claude")
        
        # Prepare new message with Claude footer
        if [ -n "$body" ]; then
            new_message="$message

$body

$CLAUDE_FOOTER"
        else
            new_message="$message

$CLAUDE_FOOTER"
        fi
        
        # Create a temporary script for filter-branch operation
        TEMP_SCRIPT=$(mktemp)
        
        # Build the message filter script
        cat > "$TEMP_SCRIPT" <<EOF
#!/bin/bash
if [ "\$(git rev-parse --short HEAD)" = "$sha" ]; then
    echo "$new_message"
else
    cat
fi
EOF
        
        # Make the script executable
        chmod +x "$TEMP_SCRIPT"
        
        # Run filter-branch on just this commit
        git filter-branch --force --env-filter 'GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"' --msg-filter "$TEMP_SCRIPT" "$sha"^.."$sha"
        
        # Clean up
        rm "$TEMP_SCRIPT"
    done
    
    echo "Commit messages have been amended. You may now need to force push with:"
    echo "git push --force"
fi
