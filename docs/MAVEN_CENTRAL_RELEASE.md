# Maven Central release

Vireo JVM releases use a two-step Central Portal deployment. The protected
workflow always uploads a `USER_MANAGED` candidate and validates it before any
publication. Staging is the default; an explicitly selected protected run may
promote that same validated deployment after it verifies its identity and exact
set of six artifacts represented by seven PURLs.

## One-time controls

- Keep the `com.vireocode` namespace verified through control of
  `vireocode.com`.
- Keep the public signing key available from a public keyserver and keep its
  private key plus recovery material outside the repository.
- Apply the checked-in [`maven-central` environment desired state](../.github/environments/maven-central.json): restrict it to `main`, add its documented reviewer, and disable administrator bypass. Capture an authenticated API export after applying it.
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

## Stage, validate, and optionally publish

From GitHub Actions, run **Stage Maven Central release** on `main` and enter the
exact version. Select **Publish the validated deployment** before dispatch when
the reviewed release is ready to promote as soon as Central validates it; leave
it unchecked to stage only. The protected job:

1. rejects a mismatched or already-public version;
2. repeats the JVM and isolated-consumer gates;
3. reads the signing key only from the protected environment and signs in memory;
4. verifies all POM metadata, JAR contents, sources, Javadoc, checksums, and
   detached signatures;
5. preserves the exact signed ZIP as 30-day workflow evidence;
6. uploads one atomic bundle with `publishingType=USER_MANAGED`; and
7. waits until Central reports `VALIDATED` or fails with Central's diagnostics.

The workflow deliberately has read-only GitHub permissions. Successful CI means
the deployment is valid and waiting; it does not mean it is public when
stage-only mode was selected.

To request publication through the stage workflow, select **Publish the
validated deployment** on its initial dispatch. After validation, it re-reads
Central status and requires:

- the requested and reported UUID to match;
- `VALIDATED` state;
- the requested non-SNAPSHOT version; and
- exactly seven expected `pkg:maven/com.vireocode/vireo-*` PURLs for the six
  artifacts at that version, with no extras. Central reports the BOM in both
  base `pkg:maven/com.vireocode/vireo-bom@<version>` and canonical
  `pkg:maven/com.vireocode/vireo-bom@<version>?type=pom` forms; the five
  libraries use bare default-JAR PURLs.

Only then does it send the authenticated Central `publish` request, accepts only
HTTP `204`, and waits until Central reports `PUBLISHED`. The upload remains
`USER_MANAGED`; the opt-in promotion is a separate, auditable protected action.

## Publish and prove consumption

1. An initial dispatch may opt into publication; it promotes only after Central
   validates the exact deployment checks above.
2. For a stage-only run, open [Central Portal deployments](https://central.sonatype.com/publishing/deployments),
   inspect the deployment ID, coordinates, validation result, and file set, then
   publish or drop it deliberately in the Portal.
3. If a stage-only run or an opt-in publication run fails after Central accepts
   the deployment, use the Portal or **Recover validated Maven Central
   deployment** with that existing ID. Never rerun staging for the same accepted
   deployment or version.
4. For an opt-in publication run, inspect the workflow summary and confirm
   Central reported `PUBLISHED` for the recorded deployment ID.
5. After Central reports `PUBLISHED`, run **Verify Maven Central release** with
   the same version. It waits for all six POMs, then resolves the BOM and every
   versionless module anonymously with a fresh Gradle home.
6. Create the signed or protected `jvm-v<version>` tag only after this public
   consumer proof succeeds.

## Recover an already-validated deployment

If a protected publication run stopped after Central accepted a valid
`USER_MANAGED` deployment, do not stage a second bundle. Run **Recover validated
Maven Central deployment** on `main` with the exact version, the deployment UUID
recorded by the original run, and the typed confirmation
`PUBLISH_VALIDATED_DEPLOYMENT`. The recovery job confirms the checked-in version
and that the BOM is still `404` on Central, then asks the existing strict
promotion helper to re-read that deployment's UUID, state, and exact seven-PURL
identity for six artifacts before its one publication request. It never builds or
uploads a new Central bundle, so the original validated candidate remains the
only deployment under review.

The template's ordinary Gradle build uses only `mavenCentral()` and must remain
credential-free. Its explicit `-PuseLocalStarter=true` mode is the only supported
way to substitute Maven Local during coordinated development.

## Failure and recovery

- A build failure before upload creates no Central deployment. Fix forward and
  rerun the same version only if it has never been uploaded or published.
- A `FAILED` or incorrect user-managed deployment should remain available while
  diagnosing it, then be dropped in Central Portal.
- A `VALIDATED` deployment is still reversible: drop it instead of publishing;
  do not rerun staging. Use the Portal or the existing-ID recovery workflow when
  it should be promoted.
- An opt-in publication run fails closed unless Central returns the exact UUID,
  versioned six-artifact, seven-exact-PURL set, and HTTP `204` promotion
  response. It never retries a rejected or ambiguous promotion request
  automatically.
- A `PUBLISHED` version cannot be replaced or deleted through the release flow.
  Correct it with a new version and document the superseded release.
- If a token or signing secret appears in logs or source, stop the release,
  revoke/rotate it, run the secret-response process, and build a fresh candidate.
