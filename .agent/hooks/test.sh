#!/bin/bash
set -e

if [ -n "$DISTROBOX_ENTER_PATH" ]; then
  exec npx playwright "$@"
fi

exec distrobox enter playwright-box -- npx playwright "$@"
