#!/usr/bin/env bash
set -euo pipefail

if [[ $# -gt 1 ]]; then
    echo "Usage: $0 [version]" >&2
    exit 2
fi

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
jvm_directory="$(cd -- "$script_directory/.." && pwd)"
version="${1:-$(sed -n 's/^version=//p' "$jvm_directory/gradle.properties")}"
repository="https://repo.maven.apache.org/maven2"
modules=(vireo-auth vireo-bom vireo-core vireo-history vireo-offline vireo-query)

[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][A-Za-z0-9.-]+)?$ ]] || {
    echo "Invalid JVM version: $version" >&2
    exit 2
}

echo "Waiting for all Vireo JVM $version POMs to become public on Maven Central..."
for module in "${modules[@]}"; do
    artifact_url="$repository/com/vireocode/$module/$version/$module-$version.pom"
    curl \
        --fail \
        --silent \
        --show-error \
        --retry 20 \
        --retry-all-errors \
        --retry-delay 15 \
        --output /dev/null \
        "$artifact_url"
done

cold_gradle_home="$(mktemp -d)"
trap 'rm -rf -- "$cold_gradle_home"' EXIT

echo "Resolving the public BOM and all versionless modules with a cold Gradle cache..."
GRADLE_USER_HOME="$cold_gradle_home" "$jvm_directory/gradlew" \
    -p "$jvm_directory/vireo-starter-publication-tests" \
    -PvireoRepository="$repository" \
    -PvireoVersion="$version" \
    clean check \
    --no-daemon \
    --no-build-cache \
    --refresh-dependencies

echo "Public Maven Central consumer verification passed for $version."
