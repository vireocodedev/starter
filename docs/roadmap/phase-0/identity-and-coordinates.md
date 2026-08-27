# Phase 0 identity and package-coordinate decision

Decision date: 2026-08-26

Status: technical publisher namespaces and public artifact coordinates activated;
professional clearance remains an accepted pre-1.0 identity risk

This is an engineering and product decision, not legal advice or trademark
clearance. Availability observations are point-in-time and confer no rights.

## Decision

- Use **Vireo Code** as the qualified publisher and community identity.
- Use **Vireo Framework** on first reference to the product; use **Vireo** only after
  the qualified identity is visible in the same context.
- Retain the controlled GitHub organization and publisher handle `vireocodedev`.
- Retain the controlled `vireocode.com` domain as the package-namespace authority.
- Do not publish or promote the project as unqualified “Vireo.”
- Do not use the unscoped npm package `vireo`.
- Publish Maven coordinates under `com.vireocode` only while control of
  `vireocode.com` and its verified Central namespace is retained.

The public lockup should read **Vireo Framework · by Vireo Code**. Repository cards,
package pages, documentation titles, social previews, and search descriptions must
include the React + Spring Boot category rather than relying on the short name.

## Why unqualified Vireo is rejected

The short name has high software/search collision risk:

| Collision                          | Current evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Consequence                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| National Instruments Vireo runtime | Public unscoped [`vireo`](https://www.npmjs.com/package/vireo) npm package with a long release history                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | The obvious npm name is unavailable and developer searches are ambiguous                                           |
| Twitter Vireo                      | Public [video-processing library](https://github.com/twitter/vireo) with substantial existing GitHub recognition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | GitHub/code searches do not uniquely identify this framework                                                       |
| Texas Digital Library Vireo        | Public [Spring-based ETD management system](https://github.com/TexasDigitalLibrary/Vireo)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Even “Vireo Spring” is ambiguous                                                                                   |
| Vireo wildlife application         | Active [desktop application and documentation](https://vireo.photo/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Current general software/product search collision                                                                  |
| PyPI Vireo                         | Existing [event-driven application framework](https://pypi.org/project/vireo/)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | “Vireo framework” is not unique across ecosystems                                                                  |
| US trademark records               | Indexed exact-word records include downloadable/recorded software in class 009, including serials [86346321](https://tsdr.uspto.gov/#caseNumber=86346321&caseSearchType=US_APPLICATION&caseType=DEFAULT&searchType=statusSearch), [90654906](https://tsdr.uspto.gov/#caseNumber=90654906&caseSearchType=US_APPLICATION&caseType=DEFAULT&searchType=statusSearch), [99727000](https://tsdr.uspto.gov/#caseNumber=99727000&caseSearchType=US_APPLICATION&caseType=DEFAULT&searchType=statusSearch), and [99731373](https://tsdr.uspto.gov/#caseNumber=99731373&caseSearchType=US_APPLICATION&caseType=DEFAULT&searchType=statusSearch) | A qualified name reduces search ambiguity but does not replace professional similarity and goods/services analysis |

An exact web search did not reveal an established software product using the spaced
phrase “Vireo Code,” but a Finnish software business uses the visually and
phonetically close name [**Virecode**](https://virecode.com/), and `vireocode.com`
was newly registered in 2026. Those facts keep legal risk non-trivial.

## Namespace and domain snapshot

Registry/API responses were checked on 2026-08-26. `404` means no public record was
returned at that moment; it is not a reservation guarantee.

### Domains

| Domain               | RDAP result                 | Decision                                           |
| -------------------- | --------------------------- | -------------------------------------------------- |
| `vireo.com`          | Registered since 2000       | Reject                                             |
| `vireo.dev`          | Registered since 2019       | Reject                                             |
| `getvireo.com`       | Registered since 2024       | Reject                                             |
| `vireocode.com`      | Controlled by the publisher | Canonical package-namespace authority              |
| `vireocode.dev`      | No registration returned    | Preferred acquisition target                       |
| `vireoframework.dev` | No registration returned    | Defensive fallback                                 |
| `getvireo.dev`       | No registration returned    | Defensive redirect only, not the primary identity  |
| `vireoframework.com` | No registration returned    | Optional defensive registration if still available |

The checks used the official Google Registry RDAP service for `.dev` and Verisign
RDAP for `.com`.

### GitHub

| Handle/repository name              | Result                                                                | Decision                                                                         |
| ----------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `vireocodedev`                      | Controlled organization                                               | Canonical publisher organization                                                 |
| `vireo`                             | Existing user account; organization repository name remains available | Use only as `vireocodedev/vireo`                                                 |
| `getvireo`                          | Existing user account                                                 | Reject as identity                                                               |
| `vireocode`                         | No public user/org returned                                           | Optional future organization rename only after reservation and redirect planning |
| `vireo-framework`, `vireoframework` | No public user/org returned                                           | Defensive options, not primary publisher names                                   |

The organization name should not be changed during initial public release. GitHub
organization redirects, registry ownership, automation identities, package URLs,
and provenance are less risky when the already-controlled publisher remains stable.

### npm

The 2026-08-26 availability snapshot was superseded on 2026-08-27. All seven
selected `@vireocodedev/*` framework packages are public at `0.2.1` and expose npm
provenance attestations linked to `vireocodedev/starter`. `create-vireo`,
`vireo-cli`, and `@vireocodedev/cli` remain unimplemented; the unscoped `vireo`
collision remains unchanged.

### Maven Central

No artifacts were returned during the 2026-08-26 snapshot. On 2026-08-27 the
publisher verified `com.vireocode` through control of `vireocode.com` and published
the signed `vireo-{bom,core,auth,query,history,offline}` `0.2.0` family to Maven
Central. Anonymous POM, signature, checksum, and Gradle consumer checks supersede
the original absence result.

### Reproducible registry endpoints

Substitute the audited handle, package, group, or domain in these public endpoints:

```text
https://api.github.com/users/{handle}
https://api.github.com/orgs/vireocodedev/repos?per_page=100
https://registry.npmjs.org/{package}
https://search.maven.org/solrsearch/select?q=g:%22{group}%22&rows=20&wt=json
https://pubapi.registry.google/rdap/domain/{domain}
https://rdap.verisign.com/com/v1/domain/{domain}
```

Capture response status and body with the UTC check date. A later response
supersedes this snapshot; a negative result never grants ownership.

## Canonical public coordinates

### npm

Use the controlled publisher scope and remove the internal “starter” label before
the first public release:

| Current private coordinate             | Canonical public coordinate                     |
| -------------------------------------- | ----------------------------------------------- |
| `@vireocodedev/starter-history`        | `@vireocodedev/history`                         |
| `@vireocodedev/starter-infrastructure` | `@vireocodedev/infrastructure`                  |
| `@vireocodedev/starter-localization`   | `@vireocodedev/localization`                    |
| `@vireocodedev/starter-queryengine`    | `@vireocodedev/query`                           |
| `@vireocodedev/starter-shell`          | `@vireocodedev/shell`                           |
| `@vireocodedev/starter-sqlite`         | `@vireocodedev/sqlite`                          |
| `@vireocodedev/starter-ui`             | `@vireocodedev/ui`                              |
| Not implemented                        | `@vireocodedev/cli`                             |
| Not implemented                        | `create-vireo` launcher, only after reservation |

The workspace root is private and is not a public framework package.

### Maven and Java

Canonical coordinates after verifying `vireocode.com`:

| Current private coordinate                | Canonical public coordinate   |
| ----------------------------------------- | ----------------------------- |
| `com.vireocode:vireo-starter-bom`         | `com.vireocode:vireo-bom`     |
| `com.vireocode:vireo-starter-core`        | `com.vireocode:vireo-core`    |
| `com.vireocode:vireo-starter-auth`        | `com.vireocode:vireo-auth`    |
| `com.vireocode:vireo-starter-history`     | `com.vireocode:vireo-history` |
| `com.vireocode:vireo-starter-offline`     | `com.vireocode:vireo-offline` |
| `com.vireocode:vireo-starter-queryengine` | `com.vireocode:vireo-query`   |

Canonical Java packages moved from `com.vireocode.starter.*` to
`com.vireocode.vireo.*` before the first public release. The product segment
is intentional: Spring Boot adds this root to entity and repository scanning, so
using bare `com.vireocode` would also scan publisher-owned consumer applications.
If domain control or Central verification is lost, any future coordinate migration
uses Maven group `io.github.vireocodedev` and Java prefix
`io.github.vireocodedev.vireo`; the project must not improvise a third namespace.

## Activation and remaining identity checklist

Technical activation completed the controlled npm scope, verified Maven namespace,
canonical package migration, public repositories, and public releases. The
remaining pre-1.0 and pre-growth work is:

1. obtain professional US/EU/international similarity and goods/services review for
   “Vireo Code” and “Vireo Framework,” including classes 009 and 042;
2. run and retain official USPTO, EUIPO/TMview, WIPO, company-name, common-law, and
   relevant national searches;
3. retain `vireocode.com` and configure protected registrar access, renewal,
   recovery, DNSSEC where supported, and more than one trusted administrator;
4. reserve the future create/CLI coordinates without publishing misleading
   functional releases;
5. retain the verified Maven Central namespace and documented fallback;
6. confirm GitHub repository target names and preserve all old names as redirects or
   archived pointers;
7. reserve consistent documentation, social, and community handles where useful;
8. rerun the collision report before 1.0 and any material growth campaign.

The public `0.x` source and artifact activation has occurred. Professional clearance
and the remaining identity controls are disclosed accepted risks, not evidence that
the name is legally cleared.

## Migration and compatibility plan

The coordinated pre-public breaking migration used this sequence:

1. freeze private releases and inventory every consumer;
2. reserve/verify target namespaces;
3. rename repository and source coordinates on one migration branch;
4. update API snapshots, generated examples, docs, local-source mode, package
   consumers, Gradle fixtures, Template, CI, and release automation atomically;
5. publish `0.x` release candidates only at canonical coordinates;
6. run clean external npm/Maven consumers plus both Template dependency modes;
7. if unknown private consumers exist, publish one final compatibility release at
   old coordinates with deprecation and relocation guidance; otherwise do not create
   public legacy packages;
8. reserve old coordinates permanently and never reuse them for different behavior.

Repository redirects, DNS redirects, npm deprecation notices, Maven relocation POMs,
and explicit migration documentation are preferred over silent aliasing.

## Reversal plan

- If legal review rejects Vireo Code, select a new coined identity and publish a
  versioned migration plan. Existing public coordinates and releases cannot be
  erased and must remain documented for the supported window.
- If control of `vireocode.com` is lost before release, use the GitHub-based Maven
  fallback and select a different cleared domain; do not use `com.vireocode`
  without control.
- If npm package reservation fails, retain the controlled `@vireocodedev` scope and
  choose descriptive scoped package names; never fall back to unscoped lookalikes.
- If a rename happens after public release, maintain redirects and deprecated
  forwarding packages for the full published support window.

## Evidence limitations

Search engines and registry APIs do not find every unregistered right, similar mark,
private product, reserved namespace, or jurisdictional conflict. [EUIPO's official
availability guidance](https://www.euipo.europa.eu/en/trade-marks/before-applying/availability)
explicitly recommends searching identical and similar signs and notes that earlier
rights may still support opposition. The working identity is technically active.
Professional review remains an explicit accepted risk and is required before a 1.0
brand commitment or substantial brand investment; this document is not legal
clearance.
