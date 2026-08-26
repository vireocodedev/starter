#!/bin/sh
set -eu

npm run security:workflow
npm run test:architecture
turbo run test
npm run surface
npm run api:policy
