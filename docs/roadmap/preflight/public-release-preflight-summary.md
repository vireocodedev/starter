# Public release preflight summary

Assessment date: 2026-08-26

Status: **private release candidate verified; public release blocked**

This is the consolidated disposition for the work that could proceed before final
public coordinates, registry accounts, or other developers were available. It
combines:

- [repository visibility safety](public-repository-safety.md);
- [npm and Maven artifact inspection](package-artifact-audit.md);
- [isolated consumer rehearsals](clean-consumer-rehearsal.md); and
- [public API classification](public-api-classification.md).

No package was published, no repository visibility or provider setting changed,
no coordinate was reserved, and no Git history was rewritten.

## What is green

| Gate                             | Result | Enforced evidence                                                                                                                                |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Narrow repository content audit  | Pass   | Current/history high-confidence secret paths, sensitive filenames, workstation paths, author-domain inventory                                    |
| npm artifact boundary            | Pass   | Seven licensed tarballs, allowlisted contents, metadata, integrity, no lifecycle hooks, no detected sensitive packed content                     |
| npm installed consumer           | Pass   | Fresh project/cache, strict peer tree, no workspace links, 22 strict declaration entry points, nine native imports, 13 browser bundles           |
| npm public-surface policy        | Pass   | Seven packages and 22 classified explicit entry points; no wildcard exports; symbol/dependency snapshots; worker claims verified                 |
| Maven artifact boundary          | Pass   | Exactly six modules; five binary/source/Javadoc sets; BOM shape; POM metadata; complete matching checksum sidecars; embedded binary-JAR licenses |
| Maven installed consumer         | Pass   | Independent Gradle build, versionless BOM consumption, five modules resolved from expected versioned JARs                                        |
| JVM public-surface policy        | Pass   | Six classified modules and five publishing-blocking Java API snapshots                                                                           |
| Complete repository verification | Pass   | TypeScript nine-step gate, Storybook production build, JVM build/aggregate Javadoc, Maven repository audit, and external JVM consumer            |
| Release workflow security        | Pass   | Immutable action/image pins, deny-by-default permissions, isolated write jobs, credential-free checkouts, and executable workflow policy         |
| Full-history secret scan         | Pass   | Digest-pinned Gitleaks v8.30.1 scanned 518 commits/about 11 MB clean; PR/main/weekly tokenless CI gate                                           |

The complete command is now:

```bash
corepack npm run verify:all -- silent
```

The toolchain is now enforced at Node `24.18.1` and npm `12.0.2`; Corepack and a
temporary task-graph shim prevent workspace subprocesses from falling back to the
host npm. Java 21, Gradle 9.7.1, TypeScript 6, and Vite 8 remain the verified
repository lines. The exact locked consumer and required peer-floor consumer pass.

## Release-readiness decision

| Target                                  | Decision          | Reason                                                                                                                     |
| --------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Continue private development/review     | Ready             | Complete local authoritative verification is green and all changes are committed in reviewable checkpoints                 |
| Publish another private GitHub Package  | Technically ready | Existing destinations and credentials are unchanged; strengthened artifact/consumer gates run before publication           |
| Make the GitHub repository public       | **Blocked**       | Author-email disclosure decision, legal identity, and provider security/recovery controls are unresolved                   |
| Publish packages anonymously consumable | **Blocked**       | Final npm/Maven coordinates and public registries are unresolved; current GitHub Packages require authentication           |
| Publish to npmjs/Maven Central          | **Blocked**       | Trusted publishing/provenance, verified Maven namespace, signing, protected environments, and migrated metadata are absent |
| Claim the D-105 support matrix publicly | **Blocked**       | Browser, database, cross-OS clean-room, optional-integration, and physical-device evidence remains incomplete              |

## Blocking decisions and external actions

These cannot be safely inferred or completed only in source:

| Priority | Decision/action                                                                                                               | Owner evidence required                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| B0       | Accept exposure of the personal author address in hundreds of commits or authorize a coordinated history rewrite              | Explicit repository-owner decision, rewrite/force-push window if chosen, contributor/clone coordination         |
| B0       | Approve the professional product/organization name, domain, trademark posture, legal copyright owner, and license attribution | Identity/legal approval and domain ownership                                                                    |
| B0       | Approve and create the final npm organization/scope and Maven Central namespace/publisher account                             | npm organization/security settings; verified domain/namespace and Central account                               |
| B0       | Approve protected signing/provenance identities and recovery owners                                                           | npm trusted publisher, Maven signing key or approved keyless mechanism, protected environments, recovery access |
| B1       | Enable/test repository private vulnerability reporting and provider secret/code-scanning settings after visibility is chosen  | GitHub administrator access and a monitored fallback contact                                                    |

## Engineering work that can continue now

This order minimizes rework and does not require public packages or another
developer's implementation input:

1. **Package portability/documentation** — explicitly document TypeScript Bundler
   resolution, decide whether source maps remain public, and make installation docs
   distribution-neutral until coordinates land.
2. **Release-pipeline preparation** — build provider-independent verification,
   provenance/signing assertions, rollback/non-republication rules, and dry-run
   release evidence without embedding final namespaces or secrets.
3. **Support evidence lanes** — implement the code-owned portions of D-105:
   Java 25 compatibility, PostgreSQL 17/18, Firefox/WebKit, clean container builds,
   and recurring evidence metadata. Physical devices and external OS machines stay
   manual/hosted follow-ups.

The code-owned part of item 1 is complete. Item 2 now produces an audited,
commit-bound release manifest, SHA-256/SHA-512 checksums, an npm CycloneDX SBOM,
and retained dry-run npm/Maven artifacts before publication. It intentionally
labels that bundle unsigned and blocks any claim of provenance until the selected
public registry can sign/attest the exact published bytes. Exact-byte promotion,
JVM dependency SBOM generation, and registry verification remain part of the
coordinate/provider unblock.

The code-owned cross-repository portion of item 3 is now source-complete. Starter
runs Java 25 tests while retaining Java 21 bytecode, requires its migration-upgrade
fixture against PostgreSQL 17/18, compiles all required and optional UI integrations
at their peer floors, and runs the TypeScript gate in a digest-pinned clean Node
container. Template adds the same Java runtime distinction, full-stack Firefox and
WebKit smoke, and Flyway plus browser-driven CRUD on PostgreSQL 17/18. Every lane
retains structured commit/toolchain/environment/result metadata. These rows remain
unactivated until recurring CI records are green; branded/physical browsers,
installed PWA checks, and hosted OS clean rooms remain separate follow-ups.

Template also now owns one production-like deployment path: independent unprivileged
frontend/backend images and PostgreSQL 18 are digest-pinned, Compose keeps backend
and database ports internal, and CI checks the static PWA, same-origin API proxy,
backend readiness, and database health. Database upgrade/backup/restore/rollback and
multi-architecture evidence remain release follow-ups.

## Coordinate-unblock sequence

Once the B0 decisions are complete:

1. migrate npm names, Maven group, repository URLs, developer/copyright metadata,
   docs, dependency edges, BOM, Template consumers, and fixtures in one coordinated
   branch;
2. configure npm public access plus trusted publishing/provenance and Maven Central
   publication plus signatures;
3. rerun repository, artifact, API, and clean-consumer gates under the final names;
4. publish a disposable/prerelease candidate where the registries allow it;
5. consume it without credentials from empty npm/Gradle caches and from the Starter
   Template's published mode;
6. only then approve repository visibility and stable public release as separate,
   explicit external actions.

## Final preflight disposition

The code-owned publication and release-security boundaries are materially stronger
and fully green. The remaining blockers are explicit: identity/ownership, history
privacy, provider accounts/settings and recovery, public-registry provenance, and
support activation. Public visibility or publication before those B0/B1 items close
would be a governance and distribution failure, not a missing test that this
repository can safely bypass.
