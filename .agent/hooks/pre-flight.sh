#!/bin/bash
# pre-flight.sh — Prerequisites check before any pipeline execution
# Usage: .agent/hooks/pre-flight.sh [skip_source_check]

set -euo pipefail

echo "=== Pre-flight Check ==="

# Source directory
SOURCE_DIR="${GROAPP_ACCESS_SOURCE_DIR:-$(jq -r '.sourceDir // ""' .agent/settings.json 2>/dev/null || true)}"
SOURCE_DIR="${SOURCE_DIR:-../groapp-access}"

if [ "${1:-}" != "skip_source_check" ] && [ ! -d "$SOURCE_DIR" ]; then
  echo "E003: source_dir_missing — $SOURCE_DIR not found"
  echo "  Set GROAPP_ACCESS_SOURCE_DIR env var or update .agent/settings.json"
  exit 1
fi
echo "OK  sourceDir=$SOURCE_DIR"

# Node
if ! command -v node &>/dev/null; then
  echo "E004: node_missing — Node.js not found in PATH"
  exit 1
fi
echo "OK  node $(node -v)"

# npm
if ! command -v npm &>/dev/null; then
  echo "E004: npm_missing — npm not found in PATH"
  exit 1
fi
echo "OK  npm $(npm -v)"

# Playwright
if ! npx playwright --version &>/dev/null; then
  echo "E004: playwright_missing — @playwright/test not installed"
  echo "  Run: npm install"
  exit 1
fi
echo "OK  playwright $(npx playwright --version 2>&1)"

# node_modules
if [ ! -d "node_modules" ]; then
  echo "E004: node_modules_missing — run npm install first"
  exit 1
fi
echo "OK  node_modules present"

# Config files
for f in ".agent/settings.json" ".agent/state.json" ".agent/mcp.json" "AGENTS.md"; do
  if [ ! -f "$f" ]; then
    echo "E001: config_missing — $f not found"
    exit 1
  fi
done
echo "OK  all config files present"

echo "=== Pre-flight Passed ==="
exit 0
