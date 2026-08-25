#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

cd "$REPOSITORY_ROOT"

printf '[1/2] TypeScript libraries and documentation\n'
if [ "$#" -gt 0 ]; then
  npm run verify -- "$1"
else
  npm run verify
fi

printf '\n[2/2] JVM libraries and aggregate Javadoc\n'
./jvm/gradlew -p jvm build aggregateJavadoc

printf '\nComplete Starter verification passed.\n'
