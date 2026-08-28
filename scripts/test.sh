#!/bin/sh
set -eu

node --test \
  scripts/changeset-publish-adapter.test.mjs \
  scripts/npm-registry-retry.test.mjs \
  scripts/package-bin.test.mjs \
  scripts/synchronize-documentation-release.test.mjs \
  site/build.test.mjs
npm run security:workflow
npm run test:architecture
turbo run test
npm run surface
npm run api:policy
