#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
    echo "Usage: $0 <Central bundle zip> [deployment name]" >&2
    exit 2
fi

: "${MAVEN_CENTRAL_USERNAME:?MAVEN_CENTRAL_USERNAME is required}"
: "${MAVEN_CENTRAL_PASSWORD:?MAVEN_CENTRAL_PASSWORD is required}"

bundle_path="$1"
deployment_name="${2:-$(basename -- "$bundle_path" .zip)}"

[[ -f "$bundle_path" ]] || {
    echo "Central bundle not found: $bundle_path" >&2
    exit 1
}
[[ "$deployment_name" =~ ^[A-Za-z0-9._-]+$ ]] || {
    echo "Deployment name may contain only letters, numbers, dots, underscores, and hyphens." >&2
    exit 1
}

authorization="$(printf '%s:%s' "$MAVEN_CENTRAL_USERNAME" "$MAVEN_CENTRAL_PASSWORD" | base64 | tr -d '\n')"
endpoint="https://central.sonatype.com/api/v1/publisher/upload?name=$deployment_name&publishingType=USER_MANAGED"

echo "Uploading $deployment_name for Maven Central validation..."
response_file="$(mktemp)"
trap 'rm -f -- "$response_file"' EXIT
http_status="$(
    curl \
        --silent \
        --show-error \
        --connect-timeout "${CENTRAL_CONNECT_TIMEOUT_SECONDS:-10}" \
        --max-time "${CENTRAL_MAX_TIME_SECONDS:-30}" \
        --request POST \
        --header "Authorization: Bearer $authorization" \
        --form "bundle=@$bundle_path;type=application/octet-stream" \
        --output "$response_file" \
        --write-out '%{http_code}' \
        "$endpoint"
)"
[[ "$http_status" == "201" ]] || {
    echo "Central upload returned HTTP $http_status; expected exactly 201." >&2
    [[ -s "$response_file" ]] && cat -- "$response_file" >&2
    exit 1
}
deployment_id="$(tr -d '\r\n' < "$response_file")"

[[ "$deployment_id" =~ ^[0-9a-fA-F-]{36}$ ]] || {
    echo "Central returned an unexpected deployment identifier." >&2
    exit 1
}

echo "Central accepted deployment $deployment_id."
echo "It will validate before the protected release workflow requests publication."
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "deployment-id=$deployment_id" >> "$GITHUB_OUTPUT"
fi
