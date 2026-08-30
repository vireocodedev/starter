#!/bin/sh
set -eu

node --test \
  scripts/changeset-publish-adapter.test.mjs \
  scripts/documentation-ownership-policy.test.mjs \
  scripts/npm-registry-retry.test.mjs \
  scripts/local-vireo-candidate-fixture.test.mjs \
  scripts/local-vireo-maven-candidate-fixture.test.mjs \
  scripts/package-bin.test.mjs \
  scripts/publish-verified-npm-candidates.test.mjs \
  scripts/release-impact-policy.test.mjs \
  scripts/release-impact-version.test.mjs \
  scripts/release-lifecycle-policy.test.mjs \
  scripts/synchronize-documentation-release.test.mjs \
  scripts/third-party-license-policy.test.mjs \
  site/build.test.mjs
sh -n site/bootstrap-vps.sh
sh -n site/deploy-vps.sh
sh -n site/stage-vps-bootstrap.sh
corepack npm run security:workflow
corepack npm run test:architecture
turbo run test
corepack npm run surface
corepack npm run api:policy
