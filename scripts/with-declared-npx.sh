#!/bin/sh
set -eu

exec corepack npm exec -- "$@"
