#!/usr/bin/env bash
#
# Watch a PR for new comments and output them for analysis.
# Usage: ./cli/watch-pr-comments.sh <PR_NUMBER>
#
# Polls every 3 minutes. Exits when the PR is merged or closed.
# Tracks last-checked timestamp to only show new comments.

set -euo pipefail

REPO="valpay-co/valpay-recon"
POLL_INTERVAL=180  # 3 minutes

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <PR_NUMBER>"
  exit 1
fi

PR_NUMBER="$1"
TIMESTAMP_FILE="/tmp/.pr-watch-${PR_NUMBER}-last-check"

# Initialize last-check to now if no prior state
if [[ ! -f "$TIMESTAMP_FILE" ]]; then
  # Use 1 minute ago to catch very recent comments
  date -u -v-1M '+%Y-%m-%dT%H:%M:%SZ' > "$TIMESTAMP_FILE" 2>/dev/null \
    || date -u -d '1 minute ago' '+%Y-%m-%dT%H:%M:%SZ' > "$TIMESTAMP_FILE"
fi

echo "=== Watching PR #${PR_NUMBER} on ${REPO} ==="
echo "Polling every ${POLL_INTERVAL}s. Press Ctrl+C to stop."
echo ""

fetch_new_review_comments() {
  local since="$1"
  gh api "repos/${REPO}/pulls/${PR_NUMBER}/comments" \
    --paginate \
    --jq ".[] | select(.created_at > \"${since}\") | {
      type: \"review\",
      id: .id,
      author: .user.login,
      created_at: .created_at,
      path: .path,
      line: (.line // .original_line // \"N/A\"),
      body: .body
    }" 2>/dev/null || true
}

fetch_new_issue_comments() {
  local since="$1"
  gh api "repos/${REPO}/issues/${PR_NUMBER}/comments" \
    --paginate \
    --jq ".[] | select(.created_at > \"${since}\") | {
      type: \"general\",
      id: .id,
      author: .user.login,
      created_at: .created_at,
      body: .body
    }" 2>/dev/null || true
}

check_pr_status() {
  gh api "repos/${REPO}/pulls/${PR_NUMBER}" --jq '{state: .state, merged: .merged}' 2>/dev/null
}

format_comment() {
  local comment="$1"
  local type author created_at path line body

  type=$(echo "$comment" | jq -r '.type')
  author=$(echo "$comment" | jq -r '.author')
  created_at=$(echo "$comment" | jq -r '.created_at')
  body=$(echo "$comment" | jq -r '.body')

  echo "---"
  echo "NEW COMMENT (${type})"
  echo "Author: ${author}"
  echo "Time:   ${created_at}"

  if [[ "$type" == "review" ]]; then
    path=$(echo "$comment" | jq -r '.path')
    line=$(echo "$comment" | jq -r '.line')
    echo "File:   ${path}:${line}"
  fi

  echo ""
  echo "$body"
  echo "---"
  echo ""
}

while true; do
  LAST_CHECK=$(cat "$TIMESTAMP_FILE")
  NOW=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

  # Check PR status
  PR_STATUS=$(check_pr_status)
  PR_STATE=$(echo "$PR_STATUS" | jq -r '.state')
  PR_MERGED=$(echo "$PR_STATUS" | jq -r '.merged')

  if [[ "$PR_MERGED" == "true" ]]; then
    echo "[$(date '+%H:%M:%S')] PR #${PR_NUMBER} has been MERGED. Exiting."
    rm -f "$TIMESTAMP_FILE"
    exit 0
  fi

  if [[ "$PR_STATE" == "closed" ]]; then
    echo "[$(date '+%H:%M:%S')] PR #${PR_NUMBER} has been CLOSED. Exiting."
    rm -f "$TIMESTAMP_FILE"
    exit 0
  fi

  # Fetch new comments
  REVIEW_COMMENTS=$(fetch_new_review_comments "$LAST_CHECK")
  ISSUE_COMMENTS=$(fetch_new_issue_comments "$LAST_CHECK")

  COMMENT_COUNT=0

  if [[ -n "$REVIEW_COMMENTS" ]]; then
    while IFS= read -r comment; do
      format_comment "$comment"
      COMMENT_COUNT=$((COMMENT_COUNT + 1))
    done <<< "$REVIEW_COMMENTS"
  fi

  if [[ -n "$ISSUE_COMMENTS" ]]; then
    while IFS= read -r comment; do
      format_comment "$comment"
      COMMENT_COUNT=$((COMMENT_COUNT + 1))
    done <<< "$ISSUE_COMMENTS"
  fi

  if [[ $COMMENT_COUNT -gt 0 ]]; then
    echo "[$(date '+%H:%M:%S')] Found ${COMMENT_COUNT} new comment(s) on PR #${PR_NUMBER}"
    echo ""
    echo "=== ACTION REQUIRED: Review comments above and determine if code changes are needed ==="
    echo ""
  else
    echo "[$(date '+%H:%M:%S')] No new comments on PR #${PR_NUMBER}. Next check in ${POLL_INTERVAL}s..."
  fi

  # Update last-check timestamp
  echo "$NOW" > "$TIMESTAMP_FILE"

  sleep "$POLL_INTERVAL"
done
