#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# start-feature.sh — Begin a new feature branch
# ──────────────────────────────────────────────
# Usage:
#   ./scripts/start-feature.sh "Add surf spot forecast widget"
#   ./scripts/start-feature.sh   (prompts for name)
# ──────────────────────────────────────────────

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get feature name
NAME="${1:-}"
if [ -z "$NAME" ]; then
  echo "Feature name (short, e.g. 'Add surf spot forecast'):"
  read -r NAME
fi

# Sanitize: lowercase, replace spaces with hyphens, strip special chars
BRANCH="feature/$(echo "$NAME" \
  | tr '[:upper:]' '[:lower:]' \
  | sed 's/[^a-z0-9 -]//g' \
  | sed 's/ /-/g' \
  | sed 's/--*/-/g' \
  | sed 's/^-//;s/-$//')"

echo ""
echo "━━━ Start Feature ━━━"
echo ""

# Make sure we're on main
git checkout main
git pull origin main

# Create branch
git checkout -b "$BRANCH"

echo ""
echo -e "${GREEN}✅ Branch created: ${CYAN}$BRANCH${NC}"
echo ""
echo "  Next:"
echo "   1. Build your feature in this branch"
echo "   2. Keep it under 1,000 lines (run ./scripts/check-pr-size.sh to check)"
echo "   3. When ready: ./scripts/finish-feature.sh"
echo ""
echo "  Current branch: $(git branch --show-current)"
echo ""
