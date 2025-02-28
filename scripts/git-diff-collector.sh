#!/bin/bash

# Function to collect commit hashes based on a search pattern (optional)
collect_commits() {
  local search_pattern="$1"
  local commit_hashes=()

  if [[ -n "$search_pattern" ]]; then
    # Collect commits matching the search pattern
    while IFS= read -r commit_hash; do
      commit_hashes+=("$commit_hash")
    done < <(git log --grep="$search_pattern" --format="%H")
  else
    # Collect all commits (if no search pattern)
    while IFS= read -r commit_hash; do
      commit_hashes+=("$commit_hash")
    done < <(git log --format="%H")
  fi

  # Output the commit hashes (one per line)
  printf "%s\n" "${commit_hashes[@]}"
}

# Function to display detailed commit information and diffs
show_commit_diffs() {
  local commit_hash="$1"

  if [[ -z "$commit_hash" ]]; then
    echo "Error: Commit hash not provided."
    return 1
  fi

  if ! git rev-parse --verify --quiet "$commit_hash"; then
    echo "Error: Commit '$commit_hash' not found."
    return 1
  fi

  echo "Commit: $commit_hash"
  git show --stat --pretty="format:Author: %an <%ae>%nDate: %ad%n%n%s" "$commit_hash"

  echo ""
  echo "Files changed:"
  git show --name-only "$commit_hash"

  echo ""
  echo "Diff:"
  git show "$commit_hash" 
}

# Main script logic
main() {
  local search_pattern="$1"
  local commit_hashes

  # Collect commit hashes
  commit_hashes=$(collect_commits "$search_pattern")

  # Process each commit hash and show diffs
  while IFS= read -r commit_hash; do
    show_commit_diffs "$commit_hash" | head -n 100 | tee generated/$commit_hash
    echo "----------------------------------------------------------------------"
  done <<< "$commit_hashes"
}

# Execute the main function with the search pattern (if provided)
main "$1"
