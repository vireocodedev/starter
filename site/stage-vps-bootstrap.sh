#!/bin/sh

set -eu

SCRIPT_DIRECTORY=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_ROOT=$(CDPATH= cd -- "$SCRIPT_DIRECTORY/.." && pwd)
ARTIFACT_ROOT="$SCRIPT_DIRECTORY/dist"
REMOTE_HOST=deploy@46.224.72.162

if [ ! -f "$ARTIFACT_ROOT/index.html" ] || [ ! -f "$ARTIFACT_ROOT/site.json" ]; then
  printf 'Website artifact is missing. Run corepack npm run site:build first.\n' >&2
  exit 1
fi

REVISION=$(git -C "$REPOSITORY_ROOT" rev-parse --verify HEAD)
TIMESTAMP=$(date -u '+%Y%m%dT%H%M%SZ')
DEPLOYMENT_ID=$(printf '%s-%s' "$(printf '%.12s' "$REVISION")" "$TIMESTAMP")
STAGING_ROOT="/tmp/vireo-website-bootstrap-$DEPLOYMENT_ID"

printf 'Staging Vireo website bootstrap at %s:%s\n' "$REMOTE_HOST" "$STAGING_ROOT"
ssh -o BatchMode=yes "$REMOTE_HOST" "mkdir -m 0700 '$STAGING_ROOT'"
tar -C "$SCRIPT_DIRECTORY" -czf - dist Caddyfile bootstrap-vps.sh | \
  ssh -o BatchMode=yes "$REMOTE_HOST" "tar -xzf - -C '$STAGING_ROOT'"

printf 'Staged successfully. On the VPS, run:\n'
printf '  sudo sh %s/bootstrap-vps.sh %s\n' "$STAGING_ROOT" "$STAGING_ROOT"
