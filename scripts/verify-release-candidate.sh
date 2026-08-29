#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

cd "$REPOSITORY_ROOT"

corepack npm run release:validate
corepack npm run verify -- silent
corepack npm run release:evidence
