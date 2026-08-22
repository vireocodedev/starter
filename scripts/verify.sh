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

cleanup() {
  rm -f -- "$COMMAND_OUTPUT_FILE"
}

trap cleanup 0
trap 'exit 130' INT
trap 'exit 143' TERM

cd "$REPOSITORY_ROOT" || exit 1

TOTAL_STEPS=8
CURRENT_STEP=0
SUITE_STARTED_AT=$(node -p 'Date.now()')
RESULTS=""
SLOWEST_LABEL=""
SLOWEST_MILLISECONDS=0

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
  result_label=$1
  result_status=$2
  result_milliseconds=$3

  RESULTS="${RESULTS}
${result_label}|${result_status}|${result_milliseconds}"

  if [ "$result_milliseconds" -gt "$SLOWEST_MILLISECONDS" ]; then
    SLOWEST_LABEL=$result_label
    SLOWEST_MILLISECONDS=$result_milliseconds
  fi
}

print_summary() {
  suite_status=$1
  suite_finished_at=$(node -p 'Date.now()')
  suite_milliseconds=$((suite_finished_at - SUITE_STARTED_AT))

  printf '\nVerification summary\n'
  printf '%-3s  %-34s  %-7s  %s\n' '#' 'Verification' 'Result' 'Time'
  printf '%-3s  %-34s  %-7s  %s\n' '---' '----------------------------------' '-------' '--------'

  summary_index=0
  printf '%s\n' "$RESULTS" | while IFS='|' read -r summary_label summary_status summary_milliseconds; do
    [ -n "$summary_label" ] || continue
    summary_index=$((summary_index + 1))
    printf '%-3s  %-34s  %-7s  %s\n' \
      "$summary_index" \
      "$summary_label" \
      "$summary_status" \
      "$(format_duration "$summary_milliseconds")"
  done

  printf '\nStatus:       %s\n' "$suite_status"
  printf 'Completed:    %s/%s steps\n' "$CURRENT_STEP" "$TOTAL_STEPS"
  printf 'Total time:   %s\n' "$(format_duration "$suite_milliseconds")"

  if [ -n "$SLOWEST_LABEL" ]; then
    printf 'Slowest step: %s (%s)\n' "$SLOWEST_LABEL" "$(format_duration "$SLOWEST_MILLISECONDS")"
  fi
}

run_step() {
  step_label=$1
  shift
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
    "$@" > "$COMMAND_OUTPUT_FILE" 2>&1
    step_exit_code=$?
  else
    "$@"
    step_exit_code=$?
  fi
  step_finished_at=$(node -p 'Date.now()')
  step_milliseconds=$((step_finished_at - step_started_at))

  if [ "${GITHUB_ACTIONS:-false}" = 'true' ]; then
    printf '::endgroup::\n'
  fi

  if [ "$step_exit_code" -eq 0 ]; then
    record_result "$step_label" 'PASS' "$step_milliseconds"
    printf 'Passed: %s (%s)\n' "$step_label" "$(format_duration "$step_milliseconds")"
    return 0
  fi

  record_result "$step_label" 'FAIL' "$step_milliseconds"
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
printf 'npm:        %s\n' "$(npm --version)"
printf 'Output:     %s\n' "$([ "$SILENT" = 'true' ] && printf 'failures only' || printf 'full')"
printf 'Steps:      %s\n' "$TOTAL_STEPS"

run_step 'Lint' npm run lint
run_step 'Formatting' npm run format:check
run_step 'Package builds' npm run build
run_step 'Type checking' npm run typecheck
run_step 'Tests and contract checks' npm run test
run_step 'Strict consumer declarations' npm run types:strict
run_step 'Generator tests' npm run generate:test
run_step 'Vireo Starter Storybook build' npm run build-storybook

print_summary 'PASSED'
