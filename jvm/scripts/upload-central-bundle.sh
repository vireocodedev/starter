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

echo "Uploading $deployment_name for Maven Central validation (manual publication required)..."
deployment_id="$(
    curl \
        --fail-with-body \
        --silent \
        --show-error \
        --request POST \
        --header "Authorization: Bearer $authorization" \
        --form "bundle=@$bundle_path;type=application/octet-stream" \
        "$endpoint"
)"

[[ "$deployment_id" =~ ^[0-9a-fA-F-]{36}$ ]] || {
    echo "Central returned an unexpected deployment identifier." >&2
    exit 1
}

echo "Central accepted deployment $deployment_id."
echo "It will validate in the Portal and will not publish until you approve it there."
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "deployment-id=$deployment_id" >> "$GITHUB_OUTPUT"
fi
