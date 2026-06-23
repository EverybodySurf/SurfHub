#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# vps-feed-scrape.sh — VPS browser feed scraper
# ──────────────────────────────────────────────
# Starts the browser, scrapes Instagram & X, saves data, kills browser.
# Runs every hour via VPS cron.
#
# Usage:
#   ./scripts/vps-feed-scrape.sh
#
# Cron: 0 * * * * /home/surfy/.openclaw/workspace/apps/surfhub/scripts/vps-feed-scrape.sh
# ──────────────────────────────────────────────

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$REPO_DIR/data/vps-scrape.log"

mkdir -p "$REPO_DIR/data"

echo "[$(date)] ⏰ VPS feed scrape starting..." >> "$LOG_FILE"

# Start the browser (Brave via Xvfb, or headless)
echo "  🚀 Starting browser..." >> "$LOG_FILE"
nohup /home/surfy/.openclaw/workspace/scripts/browsers-start.sh > /dev/null 2>&1 &
sleep 10  # Wait for browser to be fully ready

# Run the scraper
echo "  🔄 Running scraper..." >> "$LOG_FILE"
cd "$REPO_DIR"
npx tsx scripts/vps-feed-scrape.ts >> "$LOG_FILE" 2>&1

# Kill the browser
echo "  🛑 Stopping browser..." >> "$LOG_FILE"
/home/surfy/.openclaw/workspace/scripts/browsers-stop.sh >> "$LOG_FILE" 2>&1

echo "[$(date)] ✅ VPS feed scrape complete" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
