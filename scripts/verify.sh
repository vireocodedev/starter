#!/bin/sh

# The authoritative TypeScript merge gate for Starter. Keep orchestration here
# so local verification and CI execute the same checks in the same order.

set -u

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

SILENT=false

case "${1:-}" in
  '') ;;
  silent)
    SILENT=true
    shift
    ;;
  *)
    printf 'Usage: npm run verify -- [silent]\n' >&2
    exit 2
    ;;
esac

if [ "$#" -ne 0 ]; then
  printf 'Usage: npm run verify -- [silent]\n' >&2
  exit 2
fi

COMMAND_OUTPUT_FILE=$(mktemp "${TMPDIR:-/tmp}/starter-verify.XXXXXX") || exit 1
RESOURCE_OUTPUT_FILE=$(mktemp "${TMPDIR:-/tmp}/starter-verify-rss.XXXXXX") || exit 1

if [ ! -x /usr/bin/time ] || ! /usr/bin/time --version 2>&1 | grep -q 'GNU Time'; then
  printf 'GNU time is required to record comparable peak-RSS evidence.\n' >&2
  rm -f -- "$COMMAND_OUTPUT_FILE" "$RESOURCE_OUTPUT_FILE"
  exit 1
fi

cleanup() {
  rm -f -- "$COMMAND_OUTPUT_FILE" "$RESOURCE_OUTPUT_FILE"
}

trap cleanup 0
trap 'exit 130' INT
trap 'exit 143' TERM

cd "$REPOSITORY_ROOT" || exit 1

TOTAL_STEPS=13
CURRENT_STEP=0
SUITE_STARTED_AT=$(node -p 'Date.now()')
RESULTS=""
SLOWEST_LABEL=""
SLOWEST_MILLISECONDS=0
MAX_RSS_LABEL=""
MAX_RSS_KIB=0
METRIC_ARGUMENTS=""

format_duration() {
  duration_milliseconds=$1
  duration_minutes=$((duration_milliseconds / 60000))
  duration_seconds=$(((duration_milliseconds % 60000) / 1000))
  duration_remainder=$((duration_milliseconds % 1000))

  if [ "$duration_minutes" -gt 0 ]; then
    printf '%dm %02d.%03ds' "$duration_minutes" "$duration_seconds" "$duration_remainder"
  else
    printf '%d.%03ds' "$duration_seconds" "$duration_remainder"
  fi
}

record_result() {
  result_id=$1
  result_label=$2
  result_status=$3
  result_milliseconds=$4
  result_rss_kib=$5

  RESULTS="${RESULTS}
${result_label}|${result_status}|${result_milliseconds}|${result_rss_kib}"
  METRIC_ARGUMENTS="${METRIC_ARGUMENTS} duration.${result_id}=${result_milliseconds} rss.${result_id}=${result_rss_kib}"

  if [ "$result_milliseconds" -gt "$SLOWEST_MILLISECONDS" ]; then
    SLOWEST_LABEL=$result_label
    SLOWEST_MILLISECONDS=$result_milliseconds
  fi
  if [ "$result_rss_kib" -gt "$MAX_RSS_KIB" ]; then
    MAX_RSS_LABEL=$result_label
    MAX_RSS_KIB=$result_rss_kib
  fi
}

print_summary() {
  suite_status=$1
  suite_finished_at=$(node -p 'Date.now()')
  suite_milliseconds=$((suite_finished_at - SUITE_STARTED_AT))

  printf '\nVerification summary\n'
  printf '%-3s  %-34s  %-7s  %-12s  %s\n' '#' 'Verification' 'Result' 'Time' 'Peak RSS'
  printf '%-3s  %-34s  %-7s  %-12s  %s\n' '---' '----------------------------------' '-------' '------------' '--------'

  summary_index=0
  printf '%s\n' "$RESULTS" | while IFS='|' read -r summary_label summary_status summary_milliseconds summary_rss_kib; do
    [ -n "$summary_label" ] || continue
    summary_index=$((summary_index + 1))
    printf '%-3s  %-34s  %-7s  %-12s  %s MiB\n' \
      "$summary_index" \
      "$summary_label" \
      "$summary_status" \
      "$(format_duration "$summary_milliseconds")" \
      "$((summary_rss_kib / 1024))"
  done

  printf '\nStatus:       %s\n' "$suite_status"
  printf 'Completed:    %s/%s steps\n' "$CURRENT_STEP" "$TOTAL_STEPS"
  printf 'Total time:   %s\n' "$(format_duration "$suite_milliseconds")"

  if [ -n "$SLOWEST_LABEL" ]; then
    printf 'Slowest step: %s (%s)\n' "$SLOWEST_LABEL" "$(format_duration "$SLOWEST_MILLISECONDS")"
  fi
  if [ -n "$MAX_RSS_LABEL" ]; then
    printf 'Peak RSS:     %s (%s MiB)\n' "$MAX_RSS_LABEL" "$((MAX_RSS_KIB / 1024))"
  fi
}

run_step() {
  step_id=$1
  step_label=$2
  shift 2
  CURRENT_STEP=$((CURRENT_STEP + 1))
  step_started_at=$(node -p 'Date.now()')

  printf '\n[%s/%s] %s\n' "$CURRENT_STEP" "$TOTAL_STEPS" "$step_label"
  printf 'Command: '
  printf '%s ' "$@"
  printf '\n'

  if [ "${GITHUB_ACTIONS:-false}" = 'true' ]; then
    printf '::group::%s\n' "$step_label"
  fi

  if [ "$SILENT" = 'true' ]; then
    : > "$COMMAND_OUTPUT_FILE"
    /usr/bin/time --quiet --format=%M --output="$RESOURCE_OUTPUT_FILE" "$@" > "$COMMAND_OUTPUT_FILE" 2>&1
    step_exit_code=$?
  else
    /usr/bin/time --quiet --format=%M --output="$RESOURCE_OUTPUT_FILE" "$@"
    step_exit_code=$?
  fi
  step_finished_at=$(node -p 'Date.now()')
  step_milliseconds=$((step_finished_at - step_started_at))
  step_rss_kib=$(tr -d '[:space:]' < "$RESOURCE_OUTPUT_FILE")
  case "$step_rss_kib" in
    ''|*[!0-9]*)
      printf 'Invalid peak RSS for %s: %s\n' "$step_label" "$step_rss_kib" >&2
      exit 1
      ;;
  esac

  if [ "${GITHUB_ACTIONS:-false}" = 'true' ]; then
    printf '::endgroup::\n'
  fi

  if [ "$step_exit_code" -eq 0 ]; then
    record_result "$step_id" "$step_label" 'PASS' "$step_milliseconds" "$step_rss_kib"
    printf 'Passed: %s (%s, %s MiB peak RSS)\n' \
      "$step_label" \
      "$(format_duration "$step_milliseconds")" \
      "$((step_rss_kib / 1024))"
    return 0
  fi

  record_result "$step_id" "$step_label" 'FAIL' "$step_milliseconds" "$step_rss_kib"
  remaining_steps=$((TOTAL_STEPS - CURRENT_STEP))

  if [ "$SILENT" = 'true' ]; then
    printf '\nOutput from failed verification:\n'
    cat "$COMMAND_OUTPUT_FILE"
    printf '\nEnd of failed verification output.\n\n'
  fi

  printf 'Failed: %s (%s, exit code %s)\n' \
    "$step_label" \
    "$(format_duration "$step_milliseconds")" \
    "$step_exit_code"
  printf 'Skipped: %s remaining step(s)\n' "$remaining_steps"
  print_summary 'FAILED'
  exit "$step_exit_code"
}

printf 'Starter authoritative verification\n'
printf 'Started:    %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
printf 'Repository: %s\n' "$REPOSITORY_ROOT"
printf 'Node:       %s\n' "$(node --version)"
printf 'npm:        %s\n' "$(corepack npm --version)"
printf 'Output:     %s\n' "$([ "$SILENT" = 'true' ] && printf 'failures only' || printf 'full')"
printf 'Steps:      %s\n' "$TOTAL_STEPS"

run_step 'toolchain' 'Toolchain policy' corepack npm run toolchain:check
run_step 'public-contract' 'Public contract policy' corepack npm run public:check
run_step 'npm-licenses' 'npm third-party license policy' corepack npm run license:check:npm
run_step 'lint' 'Lint' corepack npm run lint
run_step 'format' 'Formatting' corepack npm run format:check
run_step 'build' 'Package builds' corepack npm run build
run_step 'typecheck' 'Type checking' corepack npm run typecheck
run_step 'tests' 'Tests and contract checks' corepack npm run test
run_step 'strict-types' 'Strict consumer declarations' corepack npm run types:strict
run_step 'generator' 'Generator tests' corepack npm run generate:test
run_step 'release-smoke' 'Packed release artifacts' corepack npm run release:smoke
run_step 'storybook-contracts' 'Storybook interaction and accessibility contracts' corepack npm run test:storybook
run_step 'storybook' 'Vireo Starter Storybook build' corepack npm run build-storybook

VERIFY_FINISHED_AT=$(node -p 'Date.now()')
VERIFY_MILLISECONDS=$((VERIFY_FINISHED_AT - SUITE_STARTED_AT))
# Metric identifiers and values contain no whitespace by construction.
# shellcheck disable=SC2086
node scripts/verification-budget-policy.mjs $METRIC_ARGUMENTS "duration.total=${VERIFY_MILLISECONDS}"
print_summary 'PASSED'
