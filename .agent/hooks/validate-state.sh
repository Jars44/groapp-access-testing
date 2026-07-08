#!/bin/bash
# validate-state.sh — Pre-handoff state validation hook
# Run before any agent handoff to ensure state.json is consistent.
# Usage: .agent/hooks/validate-state.sh [phase_name]

set -euo pipefail

STATE_FILE=".agent/state.json"
PHASE="${1:-}"

if [ ! -f "$STATE_FILE" ]; then
  echo "E001: state_unreadable — $STATE_FILE missing"
  exit 1
fi

if ! jq empty "$STATE_FILE" 2>/dev/null; then
  echo "E001: state_unreadable — $STATE_FILE is invalid JSON"
  exit 1
fi

check_required_field() {
  local query="$1"
  local label="$2"
  if ! jq -e "$query" "$STATE_FILE" >/dev/null 2>&1; then
    echo "E002: handoff_invalid — missing required field: $label"
    return 1
  fi
}

# Always-required fields
check_required_field '.version' "version" || exit 1
check_required_field '.pipeline' "pipeline"
check_required_field '.pipeline.phase' "pipeline.phase"
check_required_field '.pipeline.status' "pipeline.status"

# Phase-specific validation
case "$PHASE" in
  discovery)
    check_required_field '.artifacts.test_plan' "artifacts.test_plan"
    ;;
  exploration)
    check_required_field '.pipeline.phase' "phase must be 'discovery' for handoff" 
    jq -e '.pipeline.phase == "discovery"' "$STATE_FILE" >/dev/null 2>&1 || { echo "E002: handoff_invalid — expected phase=discovery, got $(jq -r '.pipeline.phase' "$STATE_FILE")"; exit 1; }
    ;;
  implementation)
    check_required_field '.artifacts.research_findings' "artifacts.research_findings"
    jq -e '.pipeline.phase == "exploration"' "$STATE_FILE" >/dev/null 2>&1 || { echo "E002: handoff_invalid — expected phase=exploration"; exit 1; }
    ;;
  verification)
    check_required_field '.artifacts.pom_files' "artifacts.pom_files"
    check_required_field '.artifacts.spec_files' "artifacts.spec_files"
    jq -e '.pipeline.phase == "implementation"' "$STATE_FILE" >/dev/null 2>&1 || { echo "E002: handoff_invalid — expected phase=implementation"; exit 1; }
    ;;
  teardown)
    check_required_field '.artifacts.reports' "artifacts.reports"
    jq -e '.pipeline.phase == "verification"' "$STATE_FILE" >/dev/null 2>&1 || { echo "E002: handoff_invalid — expected phase=verification"; exit 1; }
    ;;
  *)
    echo "Info: no phase-specific validation for '$PHASE'"
    ;;
esac

echo "state.json validation passed for phase=$PHASE"
exit 0
