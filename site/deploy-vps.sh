#!/bin/sh

set -eu

SCRIPT_DIRECTORY=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_ROOT=$(CDPATH= cd -- "$SCRIPT_DIRECTORY/.." && pwd)
ARTIFACT_ROOT="$SCRIPT_DIRECTORY/dist"
REMOTE_HOST="deploy@46.224.72.162"
REMOTE_ROOT="/srv/www/vireocode"

if [ ! -f "$ARTIFACT_ROOT/index.html" ] || [ ! -f "$ARTIFACT_ROOT/site.json" ]; then
  printf 'Website artifact is missing. Run corepack npm run site:build first.\n' >&2
  exit 1
fi

REVISION=$(git -C "$REPOSITORY_ROOT" rev-parse --verify HEAD)
TIMESTAMP=$(date -u '+%Y%m%dT%H%M%SZ')
DEPLOYMENT_ID=$(printf '%s-%s' "$(printf '%.12s' "$REVISION")" "$TIMESTAMP")
REMOTE_RELEASE="$REMOTE_ROOT/releases/$DEPLOYMENT_ID"

printf 'Deploying Vireo website %s to %s\n' "$DEPLOYMENT_ID" "$REMOTE_HOST"

ssh -o BatchMode=yes "$REMOTE_HOST" "mkdir -p '$REMOTE_RELEASE'"
tar -C "$ARTIFACT_ROOT" -czf - . | ssh -o BatchMode=yes "$REMOTE_HOST" "tar -xzf - -C '$REMOTE_RELEASE'"
ssh -o BatchMode=yes "$REMOTE_HOST" \
  "ln -s '$REMOTE_RELEASE' '$REMOTE_ROOT/current.next' && mv -Tf '$REMOTE_ROOT/current.next' '$REMOTE_ROOT/current'"

printf 'Deployed %s. Verify https://vireocode.com/ and https://vireocode.com/healthz\n' "$DEPLOYMENT_ID"
