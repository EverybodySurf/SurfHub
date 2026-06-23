#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# finish-feature.sh — Commit, push, and open PR
# ──────────────────────────────────────────────
# Usage:
#   ./scripts/finish-feature.sh
#   ./scripts/finish-feature.sh "commit message here"
# ──────────────────────────────────────────────

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"

BRANCH=$(git branch --show-current)

# Validate we're on a feature branch
if [[ "$BRANCH" != feature/* ]]; then
  echo -e "${RED}Error: You're on '$BRANCH', not a feature branch.${NC}"
  echo "  Feature branches look like: feature/my-feature"
  echo "  Start one with: ./scripts/engineering-protocol"
  exit 1
fi

echo ""
echo "━━━ Finish Feature: $BRANCH ━━━"
echo ""

# Check PR size
echo "Checking PR size..."
"$SCRIPT_DIR/check-pr-size.sh" || true
echo ""

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  # Get commit message
  COMMIT_MSG="${1:-}"
  if [ -z "$COMMIT_MSG" ]; then
    echo "Commit message (describes what changed, not how):"
    read -r COMMIT_MSG
  fi

  git add -A
  git commit -m "$COMMIT_MSG"
  echo -e "${GREEN}✓ Committed${NC}"
fi

# Push
echo "Pushing branch..."
git push -u origin "$BRANCH"
echo -e "${GREEN}✓ Pushed${NC}"
echo ""

# Build PR description from branch name
DESCRIPTION=$(echo "$BRANCH" | sed 's/^feature\///' | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')

# Open PR into staging
echo "Opening PR → staging..."
gh pr create \
  --base staging \
  --head "$BRANCH" \
  --title "$DESCRIPTION" \
  --body "## What

$DESCRIPTION

## Checklist

- [ ] Under 1,000 lines changed
- [ ] Built and tested locally
- [ ] No new warnings or errors
- [ ] CodeRabbit review addressed
" 2>&1 | tee /tmp/pr-url.txt

PR_URL=$(cat /tmp/pr-url.txt | grep -o 'https://github.com/.*/pull/[0-9]*' | head -1)

echo ""
echo -e "${GREEN}━━━ Done! ━━━${NC}"
echo ""
echo -e "  PR: ${CYAN}$PR_URL${NC}"
echo "  Branch: $BRANCH"
echo ""
echo "  Next: wait for CodeRabbit review, push fixes to same branch."
echo ""
