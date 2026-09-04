# Maven Central release

Vireo publishes the BOM and five JVM modules as one immutable Maven Central
release. Routine publication is fully automated by the protected **Release ·
Publish npm and Maven** workflow; there is no normal staging or Portal approval step.

## Routine release

1. Add a valid `.release-impact` record for each affected JVM module. Do not run
   `version:jvm-impact` by hand for a normal release.
2. Merge the feature PR. If there are JVM records but no npm Changeset, the
   maintained release-PR workflow creates a narrowly scoped ephemeral trigger
   so Changesets opens the ordinary generated ecosystem release PR without a
   synthetic npm bump.
3. Review and merge the exact generated **Release · Prepare version PR**. Its
   merge is the only routine publication authorization.
4. The coordinator proves all six Central POMs are either absent or public. A
   mixed or otherwise indeterminate state fails closed.
5. When absent, the protected `maven-central` job builds and audits the JVM
   release, signs the exact bundle, records upload intent, uploads one
   `USER_MANAGED` Central deployment, waits for `VALIDATED`, verifies all seven
   expected PURLs, requests publication, and waits for `PUBLISHED`.
6. The credentials-bearing job has `contents: read` only. A separate
   `contents: write` finalizer, with no Maven credentials, anonymously resolves
   the public BOM and modules from a fresh Gradle home. Only after that proof it
   creates or verifies the annotated `jvm-vX` tag and immutable GitHub Release.
7. In a mixed release, only then does the coordinator verify and publish the
   planned TypeScript libraries. Template and `create-vireo` adoption remain a
   later independent flow.

The bundle is never rebuilt after Central accepts it. A job retry first looks for
one exact prior receipt and its matching retained signed bundle from the same
workflow run. It resumes that deployment only when the version, release SHA,
run identity, PURLs, UUID, and bundle SHA-256 all match. While the public version
is absent, an upload intent without an accepted receipt is ambiguous and fails
closed. Once all six artifacts are public, the coordinator does not upload again:
it requires exact immutable finalization evidence (or the separate, strongly
bound exceptional recovery path) before continuing.

The routine coordinator and exceptional recovery use a source-commit-qualified
concurrency group. This serializes duplicate work for one transaction without
letting a later unrelated `main` push replace a pending release run; GitHub keeps
only one pending run per concurrency group even when cancellation is disabled.

## Public-state recovery

If all six POMs are already public, the coordinator performs no new Central
upload. An otherwise unbound public version still requires anonymous consumption
plus an existing exact annotated `jvm-vX` tag at the authorized release SHA and
an immutable GitHub Release with the exact changelog body. The one exception is
an exact same-run upload receipt: it binds the release SHA, version, signed bundle
digest, deployment UUID, and PURLs, allowing the coordinator to idempotently
resume `PUBLISHED` verification and create the missing finalization metadata.

## Exceptional recovery

The only manual Maven mutation/recovery workflow is **Recovery · Maven Central
deployment**. **Recovery · Verify Maven publication** remains a manual read-only
verification tool, not a publication path.
Use it only after an exceptional, documented interruption where the exact Central
deployment UUID is known and its original release evidence is available. It
requires the typed `PUBLISH_VALIDATED_DEPLOYMENT` confirmation, the exact
authorized generated-release merge SHA, and the exact interrupted **Release ·
Publish npm and Maven** run ID. It proves the run is for `release-npm.yml`, a `main`
push at that SHA, is completed `failure`, `cancelled`, or `timed_out`, and retains
exactly one signed upload-intent artifact. That artifact must contain one bundle
and one intent record whose SHA-256, version, SHA, run ID/attempt, and seven PURLs
all match. If a source run has one accepted Central receipt, exceptional recovery
downloads and validates it and requires its deployment UUID to equal the typed
deployment ID; multiple or conflicting receipts fail closed. With no receipt, the
typed UUID remains the human association assertion. It then proves that SHA is an ancestor of `main`, re-runs the
exact ecosystem release planner against it, requires the requested JVM version,
classifies all six Central POMs, rechecks the exact seven-PURL deployment identity,
and sends at most one promotion request. A rerun
may observe the version as already public only to finish anonymous verification
and immutable tag/Release finalization for that same bound deployment. The
no-secret finalizer then requests one full rerun of that exact original release
run (or recognizes it already active/successful), so any planned mixed npm
release resumes from its retained evidence. It never builds or uploads a second
bundle.

Immediately after Central reports `VALIDATED`, the coordinator retains immutable
promotion-attempt evidence before sending the irreversible promotion POST. A retry
with that evidence waits for the exact deployment to become `PUBLISHED`; a still
`VALIDATED` deployment fails closed into this typed recovery path instead of the
automatic coordinator issuing a second promotion request. The typed recovery
confirmation is the explicit human authorization to send that one exact retry
when its all-artifact and source-run proofs hold.

Do not use the Central Portal to create a routine release, re-upload an accepted
version, move or replace a JVM tag, or bypass a failed identity/visibility check.
Maven Central versions, the tag, and the GitHub Release are immutable release
evidence.

## Credentials and provider controls

`MAVEN_CENTRAL_USERNAME`, `MAVEN_CENTRAL_PASSWORD`, `MAVEN_SIGNING_KEY`, and
`MAVEN_SIGNING_PASSWORD` remain protected `maven-central` environment secrets.
The environment is restricted to `main`, has no recurring reviewer, and does not
allow administrator bypass. GitHub branch protection and the exact generated
release-PR proof are the routine authorization boundary.
