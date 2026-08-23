#!/usr/bin/env bash
set -euo pipefail

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
jvm_directory="$(cd -- "$script_directory/.." && pwd)"
version="$(sed -n 's/^version=//p' "$jvm_directory/gradle.properties")"

verification_directory="$(mktemp -d)"
trap 'rm -rf -- "$verification_directory"' EXIT
publication_repository="$verification_directory/repository"

echo "Publishing JVM $version artifacts to an isolated local repository..."
"$jvm_directory/gradlew" \
    -p "$jvm_directory" \
    -PvireoTestRepository="$publication_repository" \
    publishMavenPublicationToVerificationRepository \
    --no-build-cache

echo "Compiling and testing a standalone versionless consumer..."
"$jvm_directory/gradlew" \
    -p "$jvm_directory/vireo-starter-publication-tests" \
    -PvireoRepository="$publication_repository" \
    -PvireoVersion="$version" \
    clean check \
    --no-build-cache

echo "Published JVM consumer verification passed for $version."
