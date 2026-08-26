#!/bin/sh
set -eu

toolchain_bin=$(mktemp -d "${TMPDIR:-/tmp}/starter-npm-bin.XXXXXX")

cleanup() {
  rm -rf -- "$toolchain_bin"
}

trap cleanup 0
trap 'exit 130' INT
trap 'exit 143' TERM

corepack enable --install-directory "$toolchain_bin" npm
PATH="$toolchain_bin:$PATH"
export PATH

"$@"
