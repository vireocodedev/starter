#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

cd "$REPOSITORY_ROOT"

printf '[1/4] TypeScript libraries, packed consumers, and Storybook\n'
if [ "$#" -gt 0 ]; then
  corepack npm run verify -- "$1"
else
  corepack npm run verify
fi

printf '\n[2/4] JVM libraries and aggregate Javadoc\n'
./jvm/gradlew -p jvm build aggregateJavadoc

printf '\n[3/4] Versioned documentation portal and API references\n'
corepack npm run docs:portal
corepack npm run docs:check:artifact

printf '\n[4/4] JVM publication artifacts and external consumer\n'
./jvm/scripts/verify-publication-consumer.sh

printf '\nComplete Starter verification passed.\n'
