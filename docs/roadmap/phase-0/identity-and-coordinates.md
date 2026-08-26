# Phase 0 identity and package-coordinate decision

Decision date: 2026-08-26

Status: working identity approved; external activation blocked on reservation and
professional clearance

This is an engineering and product decision, not legal advice or trademark
clearance. Availability observations are point-in-time and confer no rights.

## Decision

- Use **Vireo Code** as the qualified publisher and community identity.
- Use **Vireo Framework** on first reference to the product; use **Vireo** only after
  the qualified identity is visible in the same context.
- Retain the controlled GitHub organization and publisher handle `vireocodedev`.
- Prefer `vireocode.dev` as the canonical domain if it is acquired and cleared.
- Do not publish or promote the project as unqualified “Vireo.”
- Do not use the unscoped npm package `vireo`.
- Do not publicly publish Maven coordinates under `com.vireocode` unless ownership
  of `vireocode.com` is established; it was registered to an unknown party during
  this audit.

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

| Domain               | RDAP result              | Decision                                           |
| -------------------- | ------------------------ | -------------------------------------------------- |
| `vireo.com`          | Registered since 2000    | Reject                                             |
| `vireo.dev`          | Registered since 2019    | Reject                                             |
| `getvireo.com`       | Registered since 2024    | Reject                                             |
| `vireocode.com`      | Registered in June 2026  | Do not base package ownership on it                |
| `vireocode.dev`      | No registration returned | Preferred acquisition target                       |
| `vireoframework.dev` | No registration returned | Defensive fallback                                 |
| `getvireo.dev`       | No registration returned | Defensive redirect only, not the primary identity  |
| `vireoframework.com` | No registration returned | Optional defensive registration if still available |

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

The public registry returned the following snapshot:

- `vireo` exists and cannot represent this project;
- `create-vireo`, `vireo-cli`, `@vireocodedev/cli`, and the checked
  `@vireocodedev/*` framework package names had no public package record;
- checked `@vireocode/*` package names also had no public package record, but the
  `@vireocode` scope is not controlled and therefore is not selected.

### Maven Central

No artifacts were returned for `com.vireocode`, `dev.vireocode`, `io.vireo`,
`com.vireo`, or `org.vireo`. Maven Central namespace verification still requires
proof of control; absence of artifacts is not ownership.

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

Preferred coordinates after acquiring `vireocode.dev`:

| Current private coordinate                | Canonical public coordinate   |
| ----------------------------------------- | ----------------------------- |
| `com.vireocode:vireo-starter-bom`         | `dev.vireocode:vireo-bom`     |
| `com.vireocode:vireo-starter-core`        | `dev.vireocode:vireo-core`    |
| `com.vireocode:vireo-starter-auth`        | `dev.vireocode:vireo-auth`    |
| `com.vireocode:vireo-starter-history`     | `dev.vireocode:vireo-history` |
| `com.vireocode:vireo-starter-offline`     | `dev.vireocode:vireo-offline` |
| `com.vireocode:vireo-starter-queryengine` | `dev.vireocode:vireo-query`   |

Canonical Java packages should move from `com.vireocode.starter.*` to
`dev.vireocode.*` before a public compatibility promise. If the domain cannot be
acquired and verified, the approved fallback is Maven group
`io.github.vireocodedev` and Java prefix `io.github.vireocodedev.vireo`; the project
must not improvise a third namespace.

## Activation checklist

Before changing source coordinates or public visibility:

1. obtain professional US/EU/international similarity and goods/services review for
   “Vireo Code” and “Vireo Framework,” including classes 009 and 042;
2. run and retain official USPTO, EUIPO/TMview, WIPO, company-name, common-law, and
   relevant national searches;
3. acquire `vireocode.dev` and configure protected registrar access, renewal,
   recovery, DNSSEC where supported, and more than one trusted administrator;
4. reserve the npm organization/scope and every canonical package, including the
   create launcher, without publishing misleading functional releases;
5. verify the Maven Central namespace using the acquired domain, or activate the
   documented GitHub-based fallback;
6. confirm GitHub repository target names and preserve all old names as redirects or
   archived pointers;
7. reserve consistent documentation, social, and community handles where useful;
8. rerun the collision report immediately before public launch.

No growth campaign, public package release, logo investment, or repository rename
should precede steps 1–5.

## Migration and compatibility plan

Because current packages and repositories are private, use one coordinated
pre-public breaking migration:

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

- If legal review rejects Vireo Code, keep Vireo as an internal codename, select a
  new coined identity, and repeat this report before public release. No canonical
  coordinates will yet have been promised.
- If `vireocode.dev` becomes unavailable, use the GitHub-based Maven fallback and
  select a different cleared domain; do not use `com.vireocode` without control.
- If npm package reservation fails, retain the controlled `@vireocodedev` scope and
  choose descriptive scoped package names; never fall back to unscoped lookalikes.
- If a rename happens after public release, maintain redirects and deprecated
  forwarding packages for the full published support window.

## Evidence limitations

Search engines and registry APIs do not find every unregistered right, similar mark,
private product, reserved namespace, or jurisdictional conflict. [EUIPO's official
availability guidance](https://www.euipo.europa.eu/en/trade-marks/before-applying/availability)
explicitly recommends searching identical and similar signs and notes that earlier
rights may still support opposition. The working identity therefore remains blocked
from external activation until a qualified professional reviews it.
