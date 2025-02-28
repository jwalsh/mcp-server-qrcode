#!/usr/bin/env bash
#
# Script to rewrite commit messages using filter-branch
# Usage:
#   ./scripts/_bisect.sh            # Dry run - shows what would change
#   ./scripts/_bisect.sh --force    # Apply changes and force push

# Define commit message mappings - full history with conventional commits
MAPPINGS=(
    # All commits with conventional format
    "d30d24c:feat: add QR code generation via stdin and MCP server"
    "49ac61d:docs: add debugging section and inspector targets"
    "27d1e5b:chore: bump version to 0.2.4"
    "c12c004:chore: bump version to 0.2.3"
    "d7ad89a:chore: mark all scripts as executable"
    "3d2bae0:feat: add script to rewrite commit messages"
    "016f89b:feat: enhance build process and update documentation"
    "d2fdb33:chore: bump version to 0.2.2"
    "24e06a4:chore: bump version to 0.2.1"
    "8c34892:refactor: consolidate build and publish process"
    "289fb82:feat: implement release management with changelog generation"
    "c41b29c:chore: bump version to 0.2.0 and add publish check"
    "84b8c9d:docs: update documentation, prepare for initial publication"
    "eab4b0c:chore: remove unused commit.sh script"
    "b244d35:feat: initial QR Code MCP Server implementation"
)

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
	for mapping in "${MAPPINGS[@]}"; do
		sha="${mapping%%:*}"
		new_header="${mapping#*:}"

		echo "Commit $sha:"
		echo "Original message:"
		git log --format=%B -n 1 "$sha" 2>/dev/null || echo "Cannot find commit $sha"
		echo "New message:"
		echo "$new_header"
		echo "------------------------"
	done
	echo "Dry run complete. Use --amend or --force flag to actually rewrite commits."
else
	# Create a temporary script for the filter-branch operation
	TEMP_SCRIPT=$(mktemp)

	# Build the script for message filtering
	cat >"$TEMP_SCRIPT" <<'EOF'
#!/usr/bin/env bash
# Get the current commit SHA
sha=$(git rev-parse --short HEAD)
# Get the current commit message
message=$(cat)
# Extract the body (everything after the first line)
body=$(echo "$message" | sed "1d" | sed '/^$/d')

# Construct the new message based on SHA
case "$sha" in
EOF

	# Add each SHA case to the script
	for mapping in "${MAPPINGS[@]}"; do
		sha="${mapping%%:*}"
		new_header="${mapping#*:}"
		cat >>"$TEMP_SCRIPT" <<EOF
  $sha)
    new_header="$new_header"
    ;;
EOF
	done

	# Add the default case and message construction logic
	cat >>"$TEMP_SCRIPT" <<'EOF'
  *)
    # Not in our map, leave unchanged
    echo "$message"
    exit 0
    ;;
esac

# Construct the new message
if [ -n "$body" ]; then
  echo "$new_header"
  echo ""
  echo "$body"
else
  echo "$new_header"
fi
EOF

	# Make the script executable
	chmod +x "$TEMP_SCRIPT"

	# Run filter-branch to rewrite all commits - the -- is required!
	git filter-branch --force --msg-filter "$TEMP_SCRIPT" -- --all

	# Clean up the temporary script
	rm "$TEMP_SCRIPT"

	echo "Commit messages have been amended. You may now need to force push with:"
	echo "git push --force"
fi
