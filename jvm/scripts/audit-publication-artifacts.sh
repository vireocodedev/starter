#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
    echo "Usage: $0 <Maven repository directory> <version> [verification|central]" >&2
    exit 2
fi

repository="$1"
version="$2"
mode="${3:-verification}"
group_path="com/vireocode"
group_directory="$repository/$group_path"
modules=(
    vireo-auth
    vireo-bom
    vireo-core
    vireo-history
    vireo-offline
    vireo-query
)
library_modules=(
    vireo-auth
    vireo-core
    vireo-history
    vireo-offline
    vireo-query
)
checksum_extensions=(md5 sha1 sha256 sha512)

[[ "$mode" == "verification" || "$mode" == "central" ]] || {
    echo "Unknown audit mode: $mode" >&2
    exit 2
}

fail() {
    echo "FAILED: $*" >&2
    exit 1
}

require_file() {
    [[ -f "$1" ]] || fail "Missing published artifact ${1#"$repository/"}"
}

assert_contains() {
    local file="$1"
    local text="$2"
    grep -Fq -- "$text" "$file" || fail "${file#"$repository/"} is missing metadata: $text"
}

verify_checksum() {
    local artifact="$1"
    local extension="$2"
    local expected
    local actual

    expected="$(tr -d '[:space:]' < "$artifact.$extension")"
    case "$extension" in
        md5) actual="$(md5sum "$artifact" | awk '{print $1}')" ;;
        sha1) actual="$(sha1sum "$artifact" | awk '{print $1}')" ;;
        sha256) actual="$(sha256sum "$artifact" | awk '{print $1}')" ;;
        sha512) actual="$(sha512sum "$artifact" | awk '{print $1}')" ;;
        *) fail "Unsupported checksum extension $extension" ;;
    esac
    [[ "$actual" == "$expected" ]] || fail "Checksum mismatch for ${artifact#"$repository/"} ($extension)"
}

verify_primary_artifact() {
    local artifact="$1"
    local extension
    require_file "$artifact"
    for extension in "${checksum_extensions[@]}"; do
        require_file "$artifact.$extension"
        verify_checksum "$artifact" "$extension"
    done

    if [[ "$mode" == "central" ]]; then
        require_file "$artifact.asc"
        [[ -n "${VIREO_GNUPGHOME:-}" ]] || fail "VIREO_GNUPGHOME is required to verify Central signatures."
        gpg --homedir "$VIREO_GNUPGHOME" --batch --verify "$artifact.asc" "$artifact" >/dev/null 2>&1 || \
            fail "Invalid signature for ${artifact#"$repository/"}"
    fi
}

assert_central_version_contents() {
    local version_directory="$1"
    shift
    local primary_artifacts=("$@")
    local file
    local artifact
    local relative
    local allowed

    while IFS= read -r file; do
        allowed=false
        for artifact in "${primary_artifacts[@]}"; do
            if [[ "$file" == "$artifact" || "$file" == "$artifact.asc" ]]; then
                allowed=true
                break
            fi
            for extension in "${checksum_extensions[@]}"; do
                if [[ "$file" == "$artifact.$extension" || "$file" == "$artifact.asc.$extension" ]]; then
                    allowed=true
                    break 2
                fi
            done
        done
        if [[ "$allowed" != true ]]; then
            relative="${file#"$repository/"}"
            fail "Central bundle contains an unexpected file: $relative"
        fi
    done < <(find "$version_directory" -maxdepth 1 -type f -print)
}

[[ -d "$group_directory" ]] || fail "Published group directory is missing: $group_path"

actual_modules="$(find "$group_directory" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort)"
expected_modules="$(printf '%s\n' "${modules[@]}" | sort)"
[[ "$actual_modules" == "$expected_modules" ]] || fail "Published module set differs from the six-module contract."

for module in "${modules[@]}"; do
    module_directory="$group_directory/$module"
    version_directory="$module_directory/$version"
    prefix="$version_directory/$module-$version"
    pom="$prefix.pom"
    metadata="$prefix.module"

    [[ -d "$version_directory" ]] || fail "Missing version directory for $module:$version"
    verify_primary_artifact "$pom"
    verify_primary_artifact "$metadata"
    if [[ "$mode" == "verification" ]]; then
        verify_primary_artifact "$module_directory/maven-metadata.xml"
    fi

    assert_contains "$pom" "<groupId>com.vireocode</groupId>"
    assert_contains "$pom" "<artifactId>$module</artifactId>"
    assert_contains "$pom" "<version>$version</version>"
    assert_contains "$pom" "<name>$module</name>"
    assert_contains "$pom" "<description>"
    assert_contains "$pom" "<url>https://github.com/vireocodedev/vireo</url>"
    assert_contains "$pom" "<name>MIT</name>"
    assert_contains "$pom" "<id>vireocodedev</id>"
    assert_contains "$pom" "<name>Vireo Code</name>"
    assert_contains "$pom" "<email>53398175+brunotot@users.noreply.github.com</email>"
    assert_contains "$pom" "<connection>scm:git:https://github.com/vireocodedev/vireo.git</connection>"

    if [[ "$module" == "vireo-bom" ]]; then
        if [[ "$mode" == "verification" ]]; then
            [[ "$(find "$version_directory" -maxdepth 1 -type f | wc -l)" -eq 10 ]] || \
                fail "$module publishes files outside its POM/module/checksum contract."
        else
            assert_central_version_contents "$version_directory" "$pom" "$metadata"
            [[ ! -e "$module_directory/maven-metadata.xml" ]] || \
                fail "$module Central bundle must not contain repository metadata."
        fi
        [[ -z "$(find "$version_directory" -maxdepth 1 -type f -name '*.jar' -print -quit)" ]] || \
            fail "$module must not publish a JAR."
        continue
    fi

    jar="$prefix.jar"
    sources="$prefix-sources.jar"
    javadoc="$prefix-javadoc.jar"
    verify_primary_artifact "$jar"
    verify_primary_artifact "$sources"
    verify_primary_artifact "$javadoc"
    if [[ "$mode" == "verification" ]]; then
        [[ "$(find "$version_directory" -maxdepth 1 -type f | wc -l)" -eq 25 ]] || \
            fail "$module publishes files outside its JAR/sources/Javadoc/POM/module/checksum contract."
    else
        assert_central_version_contents "$version_directory" "$pom" "$metadata" "$jar" "$sources" "$javadoc"
        [[ ! -e "$module_directory/maven-metadata.xml" ]] || \
            fail "$module Central bundle must not contain repository metadata."
    fi

    jar_listing="$(jar tf "$jar")"
    grep -Fxq 'META-INF/LICENSE' <<< "$jar_listing" || fail "$module binary JAR is missing META-INF/LICENSE."
    grep -Eq '\.class$' <<< "$jar_listing" || fail "$module binary JAR contains no compiled classes."
    if grep -Eq '(^|/)(BOOT-INF|src|test|tests|__tests__|\.env)(/|$)' <<< "$jar_listing"; then
        fail "$module binary JAR contains development or application-only paths."
    fi

    sources_listing="$(jar tf "$sources")"
    grep -Eq '\.java$' <<< "$sources_listing" || fail "$module sources JAR contains no Java sources."
    javadoc_listing="$(jar tf "$javadoc")"
    grep -Fxq 'index.html' <<< "$javadoc_listing" || fail "$module Javadoc JAR is missing index.html."
done

echo "Published Maven artifact audit passed ($mode mode)."
printf '%-31s %10s  %s\n' 'Artifact' 'Jar KiB' 'SHA-256 (first 16)'
printf '%-31s %10s  %s\n' '-------------------------------' '----------' '----------------'
for module in "${library_modules[@]}"; do
    jar="$group_directory/$module/$version/$module-$version.jar"
    size_kib="$((($(stat -c '%s' "$jar") + 1023) / 1024))"
    digest="$(sha256sum "$jar" | awk '{print substr($1, 1, 16)}')"
    printf '%-31s %10s  %s\n' "$module" "$size_kib" "$digest"
done
if [[ "$mode" == "central" ]]; then
    echo "Validated six POMs, five binary/source/Javadoc sets, Gradle metadata, checksums, and detached signatures."
else
    echo "Validated six POMs, five binary/source/Javadoc sets, Gradle metadata, and all generated checksums."
fi
