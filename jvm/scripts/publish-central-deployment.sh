#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
    echo "Usage: $0 <deployment id> <release version>" >&2
    exit 2
fi

: "${MAVEN_CENTRAL_USERNAME:?MAVEN_CENTRAL_USERNAME is required}"
: "${MAVEN_CENTRAL_PASSWORD:?MAVEN_CENTRAL_PASSWORD is required}"

deployment_id="$1"
version="$2"
[[ "$deployment_id" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]] || {
    echo "Invalid Central deployment identifier." >&2
    exit 2
}
[[ "$version" =~ ^[0-9A-Za-z][0-9A-Za-z._+-]*$ && "$version" != *-SNAPSHOT ]] || {
    echo "Invalid non-SNAPSHOT Maven Central release version." >&2
    exit 2
}

authorization="$(printf '%s:%s' "$MAVEN_CENTRAL_USERNAME" "$MAVEN_CENTRAL_PASSWORD" | base64 | tr -d '\n')"
status_endpoint="https://central.sonatype.com/api/v1/publisher/status?id=$deployment_id"
publish_endpoint="https://central.sonatype.com/api/v1/publisher/deployment/$deployment_id"
status_read_attempts="${CENTRAL_STATUS_READ_ATTEMPTS:-3}"
status_read_interval_seconds="${CENTRAL_STATUS_READ_INTERVAL_SECONDS:-2}"
connect_timeout_seconds="${CENTRAL_CONNECT_TIMEOUT_SECONDS:-10}"
max_time_seconds="${CENTRAL_MAX_TIME_SECONDS:-30}"
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
expected_purls=(
    "pkg:maven/com.vireocode/vireo-auth@$version"
    "pkg:maven/com.vireocode/vireo-bom@$version?type=pom"
    "pkg:maven/com.vireocode/vireo-core@$version"
    "pkg:maven/com.vireocode/vireo-history@$version"
    "pkg:maven/com.vireocode/vireo-offline@$version"
    "pkg:maven/com.vireocode/vireo-query@$version"
)

read_central_status() {
    local attempt response
    for ((attempt = 1; attempt <= status_read_attempts; attempt += 1)); do
        if response="$(
            curl \
                --fail-with-body \
                --silent \
                --show-error \
                --connect-timeout "$connect_timeout_seconds" \
                --max-time "$max_time_seconds" \
                --request POST \
                --header "Authorization: Bearer $authorization" \
                "$status_endpoint"
        )"; then
            printf '%s' "$response"
            return 0
        fi
        if ((attempt < status_read_attempts)); then
            echo "Central status read failed (attempt $attempt/$status_read_attempts); retrying." >&2
            sleep "$status_read_interval_seconds"
        fi
    done
    echo "Could not read Central deployment status after $status_read_attempts attempt(s)." >&2
    return 1
}

response="$(read_central_status)"

reported_deployment_id="$(jq -er '.deploymentId | strings' <<< "$response")" || {
    echo "Central status response does not contain a deployment identifier." >&2
    exit 1
}
[[ "$reported_deployment_id" == "$deployment_id" ]] || {
    echo "Central status response deployment identifier does not match the requested deployment." >&2
    exit 1
}

deployment_state="$(jq -er '.deploymentState | strings' <<< "$response")" || {
    echo "Central status response does not contain a deployment state." >&2
    exit 1
}
[[ "$deployment_state" == "VALIDATED" ]] || {
    echo "Central deployment $deployment_id must be VALIDATED before publication; received $deployment_state." >&2
    exit 1
}

actual_purls="$(jq -cer '.purls | if type == "array" and all(.[]; type == "string") then sort else error("purls must be an array of strings") end' <<< "$response")" || {
    echo "Central status response does not contain valid package URLs." >&2
    exit 1
}
expected_purls_json="$(printf '%s\n' "${expected_purls[@]}" | jq -R . | jq -sc 'sort')"
[[ "$actual_purls" == "$expected_purls_json" ]] || {
    echo "Central deployment package URLs do not exactly match the six reviewed com.vireocode $version artifacts." >&2
    echo "Expected PURLs: $expected_purls_json" >&2
    echo "Actual PURLs: $actual_purls" >&2
    exit 1
}

response_file="$(mktemp)"
trap 'rm -f -- "$response_file"' EXIT
http_status="$(
    curl \
        --silent \
        --show-error \
        --connect-timeout "$connect_timeout_seconds" \
        --max-time "$max_time_seconds" \
        --request POST \
        --header "Authorization: Bearer $authorization" \
        --output "$response_file" \
        --write-out '%{http_code}' \
        "$publish_endpoint"
)"
[[ "$http_status" == "204" ]] || {
    echo "Central publication request for deployment $deployment_id returned HTTP $http_status; expected exactly 204." >&2
    if [[ -s "$response_file" ]]; then
        cat -- "$response_file" >&2
    fi
    exit 1
}

echo "Central accepted publication for the exact validated deployment $deployment_id."
script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
"$script_directory/wait-central-validation.sh" "$deployment_id" PUBLISHED
