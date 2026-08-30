#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
    echo "Usage: $0 <deployment id> [VALIDATED|PUBLISHED]" >&2
    exit 2
fi

: "${MAVEN_CENTRAL_USERNAME:?MAVEN_CENTRAL_USERNAME is required}"
: "${MAVEN_CENTRAL_PASSWORD:?MAVEN_CENTRAL_PASSWORD is required}"

deployment_id="$1"
[[ "$deployment_id" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]] || {
    echo "Invalid Central deployment identifier." >&2
    exit 2
}
target_state="${2:-VALIDATED}"
[[ "$target_state" == "VALIDATED" || "$target_state" == "PUBLISHED" ]] || {
    echo "Target Central deployment state must be VALIDATED or PUBLISHED." >&2
    exit 2
}

max_attempts="${CENTRAL_DEPLOYMENT_MAX_ATTEMPTS:-80}"
poll_interval_seconds="${CENTRAL_DEPLOYMENT_POLL_INTERVAL_SECONDS:-15}"
status_read_attempts="${CENTRAL_STATUS_READ_ATTEMPTS:-3}"
status_read_interval_seconds="${CENTRAL_STATUS_READ_INTERVAL_SECONDS:-2}"
connect_timeout_seconds="${CENTRAL_CONNECT_TIMEOUT_SECONDS:-10}"
max_time_seconds="${CENTRAL_MAX_TIME_SECONDS:-30}"
[[ "$max_attempts" =~ ^[1-9][0-9]*$ ]] || {
    echo "CENTRAL_DEPLOYMENT_MAX_ATTEMPTS must be a positive integer." >&2
    exit 2
}
[[ "$poll_interval_seconds" =~ ^[0-9]+$ ]] || {
    echo "CENTRAL_DEPLOYMENT_POLL_INTERVAL_SECONDS must be a non-negative integer." >&2
    exit 2
}
[[ "$status_read_attempts" =~ ^[1-9][0-9]*$ ]] || {
    echo "CENTRAL_STATUS_READ_ATTEMPTS must be a positive integer." >&2
    exit 2
}
[[ "$status_read_interval_seconds" =~ ^[0-9]+$ ]] || {
    echo "CENTRAL_STATUS_READ_INTERVAL_SECONDS must be a non-negative integer." >&2
    exit 2
}
[[ "$connect_timeout_seconds" =~ ^[1-9][0-9]*$ ]] || {
    echo "CENTRAL_CONNECT_TIMEOUT_SECONDS must be a positive integer." >&2
    exit 2
}
[[ "$max_time_seconds" =~ ^[1-9][0-9]*$ ]] || {
    echo "CENTRAL_MAX_TIME_SECONDS must be a positive integer." >&2
    exit 2
}

authorization="$(printf '%s:%s' "$MAVEN_CENTRAL_USERNAME" "$MAVEN_CENTRAL_PASSWORD" | base64 | tr -d '\n')"
endpoint="https://central.sonatype.com/api/v1/publisher/status?id=$deployment_id"

read_central_status() {
    local read_attempt response
    for ((read_attempt = 1; read_attempt <= status_read_attempts; read_attempt += 1)); do
        if response="$(
            curl \
                --fail-with-body \
                --silent \
                --show-error \
                --connect-timeout "$connect_timeout_seconds" \
                --max-time "$max_time_seconds" \
                --request POST \
                --header "Authorization: Bearer $authorization" \
                "$endpoint"
        )"; then
            printf '%s' "$response"
            return 0
        fi
        if ((read_attempt < status_read_attempts)); then
            echo "Central status read failed (attempt $read_attempt/$status_read_attempts); retrying." >&2
            sleep "$status_read_interval_seconds"
        fi
    done
    echo "Could not read Central deployment status after $status_read_attempts attempt(s)." >&2
    return 1
}

for ((attempt = 1; attempt <= max_attempts; attempt += 1)); do
    response="$(read_central_status)"
    reported_deployment_id="$(jq -er '.deploymentId | strings' <<< "$response")" || {
        echo "Central status response does not contain a deployment identifier." >&2
        exit 1
    }
    [[ "$reported_deployment_id" == "$deployment_id" ]] || {
        echo "Central status response deployment identifier does not match the requested deployment." >&2
        exit 1
    }
    state="$(jq -r '.deploymentState // empty' <<< "$response")"

    case "$state" in
        VALIDATED)
            echo "Central validated deployment $deployment_id."
            if [[ "$target_state" == "VALIDATED" ]]; then
                echo "It is waiting for publication in the Portal."
                exit 0
            fi
            echo "Central deployment state: $state (attempt $attempt/$max_attempts)"
            sleep "$poll_interval_seconds"
            ;;
        PUBLISHED)
            echo "Central reports deployment $deployment_id as already published."
            exit 0
            ;;
        FAILED)
            echo "Central validation failed for deployment $deployment_id:" >&2
            jq . <<< "$response" >&2
            exit 1
            ;;
        PENDING | VALIDATING | PUBLISHING)
            echo "Central deployment state: $state (attempt $attempt/$max_attempts)"
            sleep "$poll_interval_seconds"
            ;;
        *)
            echo "Central returned an unexpected deployment state:" >&2
            jq . <<< "$response" >&2
            exit 1
            ;;
    esac
done

echo "Timed out waiting for Central deployment $deployment_id to reach $target_state." >&2
exit 1
