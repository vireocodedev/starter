#!/bin/sh
set -eu

node --test \
  scripts/changeset-publish-adapter.test.mjs \
  scripts/documentation-ownership-policy.test.mjs \
  scripts/npm-registry-retry.test.mjs \
  scripts/package-bin.test.mjs \
  scripts/publish-verified-npm-candidates.test.mjs \
  scripts/release-impact-policy.test.mjs \
  scripts/release-impact-version.test.mjs \
  scripts/release-lifecycle-policy.test.mjs \
  scripts/synchronize-documentation-release.test.mjs \
  site/build.test.mjs
sh -n site/bootstrap-vps.sh
sh -n site/deploy-vps.sh
sh -n site/stage-vps-bootstrap.sh
npm run security:workflow
npm run test:architecture
turbo run test
npm run surface
npm run api:policy
