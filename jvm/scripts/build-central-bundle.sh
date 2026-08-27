#!/usr/bin/env bash
set -euo pipefail

if [[ $# -gt 1 ]]; then
    echo "Usage: $0 [output directory]" >&2
    exit 2
fi

: "${MAVEN_SIGNING_KEY:?MAVEN_SIGNING_KEY is required}"
: "${MAVEN_SIGNING_PASSWORD:?MAVEN_SIGNING_PASSWORD is required}"

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
jvm_directory="$(cd -- "$script_directory/.." && pwd)"
version="$(sed -n 's/^version=//p' "$jvm_directory/gradle.properties")"
output_directory="${1:-$jvm_directory/build/central}"

[[ -n "$version" ]] || {
    echo "Could not read the JVM version." >&2
    exit 1
}
[[ "$version" != *-SNAPSHOT ]] || {
    echo "Maven Central release bundles cannot use a SNAPSHOT version." >&2
    exit 1
}

mkdir -p -- "$output_directory"
output_directory="$(cd -- "$output_directory" && pwd)"
bundle_path="$output_directory/vireo-jvm-$version-central-bundle.zip"

working_directory="$(mktemp -d)"
trap 'rm -rf -- "$working_directory"' EXIT
publication_repository="$working_directory/repository"
bundle_root="$working_directory/bundle"
verification_gnupg_home="$working_directory/gnupg"

mkdir -p -- "$bundle_root" "$verification_gnupg_home"
chmod 700 "$verification_gnupg_home"

echo "Building signed JVM $version artifacts in an isolated Maven repository..."
"$jvm_directory/gradlew" \
    -p "$jvm_directory" \
    -PvireoCentralRepository="$publication_repository" \
    publishMavenPublicationToCentralBundleRepository \
    --no-build-cache

# Repository-level metadata describes a mutable repository and is not part of
# a versioned Central deployment. Copy only the namespace tree, then remove the
# metadata Gradle creates beside each artifact version.
cp -R -- "$publication_repository/com" "$bundle_root/"
find "$bundle_root" -type f -name 'maven-metadata.xml*' -delete

# The signing key remains confined to the temporary directory. Importing it
# here lets the audit cryptographically verify every detached signature rather
# than merely checking that .asc files exist.
printf '%s' "$MAVEN_SIGNING_KEY" | \
    gpg --homedir "$verification_gnupg_home" --batch --quiet --import

echo "Auditing Maven Central metadata, checksums, contents, and signatures..."
VIREO_GNUPGHOME="$verification_gnupg_home" \
    "$script_directory/audit-publication-artifacts.sh" "$bundle_root" "$version" central

rm -f -- "$bundle_path"
(
    cd -- "$bundle_root"
    zip -q -r "$bundle_path" com
)

if unzip -Z1 "$bundle_path" | grep -Ev '^com/' | grep -q .; then
    echo "The Central bundle contains files outside the com/ namespace tree." >&2
    exit 1
fi
if unzip -Z1 "$bundle_path" | grep -q 'maven-metadata.xml'; then
    echo "The Central bundle contains mutable repository metadata." >&2
    exit 1
fi

echo "Maven Central bundle ready: $bundle_path"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "bundle=$bundle_path" >> "$GITHUB_OUTPUT"
    echo "version=$version" >> "$GITHUB_OUTPUT"
fi
