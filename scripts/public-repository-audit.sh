#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
AUDIT_TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/vireo-public-audit.XXXXXX")

cleanup() {
  rm -rf -- "$AUDIT_TMP_DIR"
}

trap cleanup 0
trap 'exit 130' INT
trap 'exit 143' TERM

cd "$REPOSITORY_ROOT"

HIGH_CONFIDENCE_SECRET_PATTERN='-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|npm_[A-Za-z0-9]{20,}|sk_(live|test)_[A-Za-z0-9]{20,}'
ABSOLUTE_WORKSTATION_PATTERN='/Users/[A-Za-z0-9._-]+/|/home/[A-Za-z0-9._-]+/|[A-Za-z]:\\Users\\[A-Za-z0-9._-]+\\'
SENSITIVE_FILENAME_PATTERN='(^|/)\.env($|\.)|\.(pem|key|p12|pfx|jks|keystore|mobileprovision)$'

TRACKED_PATHS="$AUDIT_TMP_DIR/tracked-paths.txt"
CURRENT_SECRET_PATHS="$AUDIT_TMP_DIR/current-secret-paths.txt"
HISTORICAL_SECRET_PATHS="$AUDIT_TMP_DIR/historical-secret-paths.txt"
SENSITIVE_TRACKED_PATHS="$AUDIT_TMP_DIR/sensitive-tracked-paths.txt"
HISTORICAL_SENSITIVE_PATHS="$AUDIT_TMP_DIR/historical-sensitive-paths.txt"
CURRENT_ABSOLUTE_PATHS="$AUDIT_TMP_DIR/current-absolute-paths.txt"
AUTHOR_DOMAINS="$AUDIT_TMP_DIR/author-domains.txt"

git ls-files > "$TRACKED_PATHS"

git grep -I -l -E -e "$HIGH_CONFIDENCE_SECRET_PATTERN" -- . \
  ':(exclude)scripts/public-repository-audit.sh' \
  > "$CURRENT_SECRET_PATHS" || true

git log --all --name-only --format= -G "$HIGH_CONFIDENCE_SECRET_PATTERN" -- . \
  ':(exclude)scripts/public-repository-audit.sh' \
  | sed '/^$/d' \
  | sort -u \
  > "$HISTORICAL_SECRET_PATHS"

grep -Ei "$SENSITIVE_FILENAME_PATTERN" "$TRACKED_PATHS" \
  | grep -Evi '\.(example|sample|template)$' \
  > "$SENSITIVE_TRACKED_PATHS" || true

git log --all --name-only --format= \
  | sed '/^$/d' \
  | grep -Ei "$SENSITIVE_FILENAME_PATTERN" \
  | grep -Evi '\.(example|sample|template)$' \
  | sort -u \
  > "$HISTORICAL_SENSITIVE_PATHS" || true

git grep -I -l -E "$ABSOLUTE_WORKSTATION_PATTERN" -- . \
  ':(exclude)scripts/public-repository-audit.sh' \
  > "$CURRENT_ABSOLUTE_PATHS" || true

git log --all --format='%ae' \
  | awk -F@ '
      NF == 2 { count[$2]++ }
      NF != 2 { count["invalid-address"]++ }
      END { for (domain in count) print domain ": " count[domain] }
    ' \
  | sort \
  > "$AUTHOR_DOMAINS"

print_paths() {
  report_file=$1
  if [ -s "$report_file" ]; then
    sed 's/^/  /' "$report_file"
  else
    printf '  none\n'
  fi
}

printf 'Vireo public-repository audit\n'
printf 'Tracked files: %s\n' "$(wc -l < "$TRACKED_PATHS" | tr -d ' ')"

printf '\nHigh-confidence secret patterns in the current tree:\n'
print_paths "$CURRENT_SECRET_PATHS"

printf '\nPaths touched by high-confidence secret patterns in Git history:\n'
print_paths "$HISTORICAL_SECRET_PATHS"

printf '\nSensitive tracked filenames:\n'
print_paths "$SENSITIVE_TRACKED_PATHS"

printf '\nSensitive filenames present in Git history:\n'
print_paths "$HISTORICAL_SENSITIVE_PATHS"

printf '\nTracked files containing absolute workstation paths:\n'
print_paths "$CURRENT_ABSOLUTE_PATHS"

printf '\nCommit author email domains (addresses intentionally suppressed):\n'
print_paths "$AUTHOR_DOMAINS"

if [ -s "$CURRENT_SECRET_PATHS" ] \
  || [ -s "$HISTORICAL_SECRET_PATHS" ] \
  || [ -s "$SENSITIVE_TRACKED_PATHS" ] \
  || [ -s "$HISTORICAL_SENSITIVE_PATHS" ] \
  || [ -s "$CURRENT_ABSOLUTE_PATHS" ]; then
  printf '\nFAILED: inspect every reported path before changing repository visibility.\n' >&2
  exit 1
fi

printf '\nPASSED: no high-confidence repository-content finding was detected.\n'
printf '%s\n' 'Manual review of author identities, licenses, assets, workflows, and provider settings is still required.'
