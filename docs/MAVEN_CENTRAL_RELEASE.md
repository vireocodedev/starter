# Maven Central release

Vireo JVM releases use a two-step, user-managed Central Portal deployment. The
automation may upload and validate a release candidate, but only a human can
make the immutable publication decision.

## One-time controls

- Keep the `com.vireocode` namespace verified through control of
  `vireocode.com`.
- Keep the public signing key available from a public keyserver and keep its
  private key plus recovery material outside the repository.
- Protect the GitHub `maven-central` environment with the desired reviewers.
- Store only these environment secrets:
  `MAVEN_CENTRAL_USERNAME`, `MAVEN_CENTRAL_PASSWORD`, `MAVEN_SIGNING_KEY`, and
  `MAVEN_SIGNING_PASSWORD`.
- Rotate the Central token and signing key deliberately. Never put either in a
  Gradle properties file, repository secret, artifact, log, or pull request.

Central's current requirements and Publisher API are documented in its
[publication requirements](https://central.sonatype.org/publish/requirements/),
[bundle layout](https://central.sonatype.org/publish/publish-portal-upload/), and
[Publisher API](https://central.sonatype.org/publish/publish-portal-api/).

## Prepare the release

1. Bump `version` in `jvm/gradle.properties`. All six artifacts share it.
2. Update changed `api-surface.txt` snapshots with
   `./gradlew apiSurfaceUpdate` and review the public delta.
3. Run, from `jvm/`:

   ```bash
   ./gradlew clean check aggregateJavadoc --no-build-cache
   ./scripts/verify-publication-consumer.sh
   ```

4. Merge the reviewed version change to `main`. Maven Central releases are
   immutable; never reuse a version, even after a failed or incorrect release.

## Stage and validate

From GitHub Actions, run **Stage Maven Central release** on `main` and enter the
exact version. The protected job:

1. rejects a mismatched or already-public version;
2. repeats the JVM and isolated-consumer gates;
3. reads the signing key only from the protected environment and signs in memory;
4. verifies all POM metadata, JAR contents, sources, Javadoc, checksums, and
   detached signatures;
5. preserves the exact signed ZIP as 30-day workflow evidence;
6. uploads one atomic bundle with `publishingType=USER_MANAGED`; and
7. waits until Central reports `VALIDATED` or fails with Central's diagnostics.

The workflow deliberately has read-only GitHub permissions. Successful CI means
the deployment is valid and waiting; it does not mean it is public.

## Publish and prove consumption

1. Open [Central Portal deployments](https://central.sonatype.com/publishing/deployments).
2. Inspect the deployment ID recorded in the workflow summary, its coordinates,
   validation result, and file set.
3. Click **Publish** only when the candidate is correct. Drop it instead if there
   is any doubt.
4. After Central reports `PUBLISHED`, run **Verify Maven Central release** with
   the same version. It waits for all six POMs, then resolves the BOM and every
   versionless module anonymously with a fresh Gradle home.
5. Create the signed or protected `jvm-v<version>` tag only after this public
   consumer proof succeeds.

The template's ordinary Gradle build uses only `mavenCentral()` and must remain
credential-free. Its explicit `-PuseLocalStarter=true` mode is the only supported
way to substitute Maven Local during coordinated development.

## Failure and recovery

- A build failure before upload creates no Central deployment. Fix forward and
  rerun the same version only if it has never been uploaded or published.
- A `FAILED` or incorrect user-managed deployment should remain available while
  diagnosing it, then be dropped in Central Portal.
- A `VALIDATED` deployment is still reversible: drop it instead of publishing.
- A `PUBLISHED` version cannot be replaced or deleted through the release flow.
  Correct it with a new version and document the superseded release.
- If a token or signing secret appears in logs or source, stop the release,
  revoke/rotate it, run the secret-response process, and build a fresh candidate.
