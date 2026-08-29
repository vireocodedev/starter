#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

cd "$REPOSITORY_ROOT"

printf '[1/5] TypeScript libraries, packed consumers, and Storybook\n'
if [ "$#" -gt 0 ]; then
  corepack npm run verify -- "$1"
else
  corepack npm run verify
fi

printf '\n[2/5] JVM libraries and aggregate Javadoc\n'
./jvm/gradlew -p jvm build aggregateJavadoc

printf '\n[3/5] JVM direct and transitive third-party licenses\n'
corepack npm run license:check:jvm

printf '\n[4/5] Versioned documentation portal and API references\n'
corepack npm run docs:portal
corepack npm run docs:check:artifact

printf '\n[5/5] JVM publication artifacts and external consumer\n'
./jvm/scripts/verify-publication-consumer.sh

printf '\nComplete Starter verification passed.\n'
