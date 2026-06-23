#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# check-pr-size.sh — Count lines changed vs target
# ──────────────────────────────────────────────
# Usage:
#   ./scripts/check-pr-size.sh
#   ./scripts/check-pr-size.sh --verbose
# ──────────────────────────────────────────────

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"

BRANCH=$(git branch --show-current)

# Determine what to diff against
if [ "$BRANCH" = "staging" ]; then
  BASE="origin/main"
elif [[ "$BRANCH" == feature/* ]]; then
  BASE="main"
else
  BASE="origin/main"
fi

# Get stats
ADD=$(git diff "$BASE" --numstat | awk '{a+=$1} END {print a}')
DEL=$(git diff "$BASE" --numstat | awk '{d+=$2} END {print d}')
ADD=${ADD:-0}
DEL=${DEL:-0}
TOTAL=$((ADD + DEL))
FILES=$(git diff "$BASE" --name-only | wc -l)

LIMIT=1000
PERCENT=$((TOTAL * 100 / LIMIT))

echo ""
echo "━━━ PR Size Check ━━━"
echo "  Branch: $BRANCH"
echo "  Diffing against: $BASE"
echo ""

echo -e "  Lines changed: ${CYAN}$TOTAL${NC} (+$ADD / -$DEL)"
echo -e "  Files touched:  ${CYAN}$FILES${NC}"
echo "  Limit:          $LIMIT"

echo ""
if [ "$TOTAL" -le "$LIMIT" ]; then
  echo -e "  ${GREEN}✅ Under limit by $((LIMIT - TOTAL)) lines${NC}"
else
  echo -e "  ${RED}❌ Over limit by $((TOTAL - LIMIT)) lines${NC}"
  echo ""
  echo "  Suggestions:"
  echo "    • Split into stacked features"
  echo "      (merge one PR, rebase next, repeat)"
  echo "    • Check if generated files are accidentally included"
  echo "    • Exclude non-essential changes for a later PR"
fi
echo ""

if [ "${1:-}" = "--verbose" ]; then
  echo "━━━ Files ━━━"
  git diff "$BASE" --stat
  echo ""
fi
