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

The complete command is now:

```bash
npm run verify:all -- silent
```

The recorded run used Node `24.18.1`, npm `11.16.0`, Java 21, Gradle 9.7.1,
TypeScript 6, and Vite 8. It completed successfully on 2026-08-26. The TypeScript
gate's nine checks took 2m 42.200s; the JVM source/integration suite and publication
consumer then passed. npm 11 is evidence for current correctness, not activation of
the accepted npm 12 support row.

## Release-readiness decision

| Target                                  | Decision          | Reason                                                                                                                           |
| --------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Continue private development/review     | Ready             | Complete local authoritative verification is green and all changes are committed in reviewable checkpoints                       |
| Publish another private GitHub Package  | Technically ready | Existing destinations and credentials are unchanged; strengthened artifact/consumer gates run before publication                 |
| Make the GitHub repository public       | **Blocked**       | Author-email disclosure decision, legal identity, comprehensive secret scan, and provider security controls are unresolved       |
| Publish packages anonymously consumable | **Blocked**       | Final npm/Maven coordinates and public registries are unresolved; current GitHub Packages require authentication                 |
| Publish to npmjs/Maven Central          | **Blocked**       | Trusted publishing/provenance, verified Maven namespace, signing, least-privilege environments, and migrated metadata are absent |
| Claim the D-105 support matrix publicly | **Blocked**       | npm 12, pinned OS, peer-floor/range, browser, database, clean-room, and device evidence is incomplete                            |

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

1. **Release security hardening** — pin every action to a reviewed commit, reduce
   job permissions, separate verification from publication, add a dedicated
   full-history/ongoing secret scanner, and document environment/recovery controls.
2. **Toolchain policy activation** — run npm 12 exactly, pin canonical Ubuntu
   rather than relying only on `ubuntu-latest`, narrow over-broad React/MUI peers,
   and add the admitted peer-floor fixture.
3. **API reduction review** — reduce accidental UI barrels (currently 1,364
   distinct symbols), decide the four Storybook exports, and classify the 111 JVM
   public types before first public compatibility expectations harden.
4. **Package portability/documentation** — explicitly document TypeScript Bundler
   resolution, decide whether source maps remain public, and make installation docs
   distribution-neutral until coordinates land.
5. **Release-pipeline preparation** — build provider-independent verification,
   provenance/signing assertions, rollback/non-republication rules, and dry-run
   release evidence without embedding final namespaces or secrets.
6. **Support evidence lanes** — implement the code-owned portions of D-105:
   Java 25 compatibility, PostgreSQL 17/18, Firefox/WebKit, clean container builds,
   and recurring evidence metadata. Physical devices and external OS machines stay
   manual/hosted follow-ups.

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

The code-owned publication boundary is materially stronger and fully green. The
remaining blockers are now explicit: identity/ownership, history privacy, provider
accounts/settings, release security, and support activation. Public visibility or
publication before those B0/B1 items close would be a governance and distribution
failure, not a missing test that this repository can safely bypass.
