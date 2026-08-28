#!/bin/sh

set -eu

if [ "$(id -u)" -ne 0 ]; then
  printf 'Run this bootstrap as root (for example, with sudo).\n' >&2
  exit 1
fi

STAGING_ROOT=${1:-}
DEPLOY_USER=${2:-deploy}
SITE_ROOT=/srv/www/vireocode
CADDY_TARGET=/etc/caddy/sites/vireo-website.caddy

case "$STAGING_ROOT" in
  /tmp/vireo-website-bootstrap-*) ;;
  *)
    printf 'Expected a staged website directory under /tmp/vireo-website-bootstrap-*.\n' >&2
    exit 1
    ;;
esac

for required_file in \
  "$STAGING_ROOT/dist/index.html" \
  "$STAGING_ROOT/dist/site.json" \
  "$STAGING_ROOT/Caddyfile"; do
  if [ ! -f "$required_file" ]; then
    printf 'Missing staged file: %s\n' "$required_file" >&2
    exit 1
  fi
done

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  printf 'Deployment user does not exist: %s\n' "$DEPLOY_USER" >&2
  exit 1
fi

DEPLOY_GROUP=$(id -gn "$DEPLOY_USER")
DEPLOYMENT_ID=${STAGING_ROOT##*/}
DEPLOYMENT_ID=${DEPLOYMENT_ID#vireo-website-bootstrap-}
RELEASE_ROOT="$SITE_ROOT/releases"
RELEASE_TARGET="$RELEASE_ROOT/$DEPLOYMENT_ID"

if [ -e "$RELEASE_TARGET" ]; then
  printf 'Release target already exists: %s\n' "$RELEASE_TARGET" >&2
  exit 1
fi

install -d -m 0755 -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$SITE_ROOT"
install -d -m 0755 -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$RELEASE_ROOT"
install -d -m 0755 -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$RELEASE_TARGET"
cp -R "$STAGING_ROOT/dist/." "$RELEASE_TARGET/"
chown -R "$DEPLOY_USER:$DEPLOY_GROUP" "$RELEASE_TARGET"

ln -s "$RELEASE_TARGET" "$SITE_ROOT/current.next"
mv -Tf "$SITE_ROOT/current.next" "$SITE_ROOT/current"
chown -h "$DEPLOY_USER:$DEPLOY_GROUP" "$SITE_ROOT/current"

install -m 0644 "$STAGING_ROOT/Caddyfile" "$CADDY_TARGET"
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl reload caddy

printf 'Activated Vireo website release %s.\n' "$DEPLOYMENT_ID"
printf 'Future deployments can run as %s without sudo.\n' "$DEPLOY_USER"
