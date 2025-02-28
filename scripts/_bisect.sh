#!/usr/bin/env bash
#
# Script to rewrite commit messages using filter-branch
# Usage:
#   ./scripts/_bisect.sh            # Dry run - shows what would change
#   ./scripts/_bisect.sh --force    # Apply changes and force push

# Define commit message mappings
# Define commit message mappings
MAPPINGS=(
    "990c9de20c185d1087b0452f7e59e1c23b5af914:chore: bump version to 0.2.2"
    "7c62a98ba51277ce5b290c6becf00f4b747239f7:chore: bump version to 0.2.1"
    "b4f6396cdb35ad8f534f5643f8e5ede689bd4c22:refactor: consolidate build and publish process, add QR code tests"
    "30acb91333708689d4df0a50afc30d218086ff37:feat: implement release management with changelog generation"
    "68f2a45bfaa8a798a90812ecef813d049c5916b9:chore: bump version to 0.2.0, add publish check"
    "53998b7cab8476abf8debacd1fae7b85379a5fb2:docs: update documentation, prepare for initial publication"
    "eab4b0c5f21c5c5634e8b4cec6f851e28ba0f9a9:chore: remove unused commit.sh script"
    "b244d35d74a61c119a1084b94901525d89eb3abe:feat: initial commit: QR Code MCP Server implementation"
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
