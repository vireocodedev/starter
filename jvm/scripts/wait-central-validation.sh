#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
    echo "Usage: $0 <deployment id>" >&2
    exit 2
fi

: "${MAVEN_CENTRAL_USERNAME:?MAVEN_CENTRAL_USERNAME is required}"
: "${MAVEN_CENTRAL_PASSWORD:?MAVEN_CENTRAL_PASSWORD is required}"

deployment_id="$1"
[[ "$deployment_id" =~ ^[0-9a-fA-F-]{36}$ ]] || {
    echo "Invalid Central deployment identifier." >&2
    exit 2
}

authorization="$(printf '%s:%s' "$MAVEN_CENTRAL_USERNAME" "$MAVEN_CENTRAL_PASSWORD" | base64 | tr -d '\n')"
endpoint="https://central.sonatype.com/api/v1/publisher/status?id=$deployment_id"

for attempt in {1..80}; do
    response="$(
        curl \
            --fail-with-body \
            --silent \
            --show-error \
            --request POST \
            --header "Authorization: Bearer $authorization" \
            "$endpoint"
    )"
    state="$(jq -r '.deploymentState // empty' <<< "$response")"

    case "$state" in
        VALIDATED)
            echo "Central validated deployment $deployment_id."
            echo "It is waiting for manual publication in the Portal."
            exit 0
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
            echo "Central deployment state: $state (attempt $attempt/80)"
            sleep 15
            ;;
        *)
            echo "Central returned an unexpected deployment state:" >&2
            jq . <<< "$response" >&2
            exit 1
            ;;
    esac
done

echo "Timed out waiting for Central to validate deployment $deployment_id." >&2
exit 1
