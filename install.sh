#!/usr/bin/env bash
set -euo pipefail

SKILL_NAME="still-reading"
SKILL_DIR="$HOME/.claude/skills/$SKILL_NAME"
REPO_RAW="https://raw.githubusercontent.com/megabyte0x/stillReading/main"

echo "Installing $SKILL_NAME skill..."

mkdir -p "$SKILL_DIR"
curl -fsSL "$REPO_RAW/SKILL.md" -o "$SKILL_DIR/SKILL.md"

echo "Installed $SKILL_NAME to $SKILL_DIR"
