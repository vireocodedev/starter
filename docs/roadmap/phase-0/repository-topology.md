# ADR: canonical Vireo Code repository topology

- Decision: D-104
- Date: 2026-08-26
- Status: executed 2026-09-01; canonical provider names are active and prior names
  are retained only as GitHub redirect/history compatibility paths

## Context

Vireo currently has one active framework repository, one active Template repository,
and an older private Template repository:

| Current repository                          | Baseline role                                                               | Finding                                                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `vireocodedev/vireo`                        | TypeScript and JVM libraries, contracts, generators, verification, and docs | Canonical framework source                                                                             |
| `vireocodedev/vireo-template`               | Active full-stack reference/golden-path consumer                            | Canonical Template implementation at immutable 0.8.6 commit `cef67cc74af3d28028fba424e1d5c6a92faa6fc9` |
| `vireocodedev/starter` / `starter-template` | Historical provider names                                                   | GitHub redirects preserve old public links; they are not canonical release/source coordinates          |

Creating a repository for every deliverable would increase navigation, security,
release, issue, and maintenance cost before the project has external contributors.
Combining the framework and Template would weaken the published-consumer boundary
that currently catches dependency and packaging failures.

## Decision

Use two canonical repositories now and authorize one deferred examples repository:

| Target repository                        | Owns                                                                                                                                                                          | Release boundary                                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `vireocodedev/vireo`                     | TypeScript packages, JVM modules/BOM, CLI, generators, cross-stack contracts, compatibility fixtures, framework docs/site source, architecture tests, benchmarks, and roadmap | TypeScript packages, JVM artifacts, CLI, and docs may release independently from one coordinated source commit |
| `vireocodedev/vireo-template`            | Minimal generated/cloned application, integration adapters, one Item vertical slice, published-package consumer checks, deployment reference, and flagship source             | Template versions declare an explicit compatible framework range and are verified against public artifacts     |
| `vireocodedev/vireo-examples` (deferred) | Kitchen-sink capabilities, recipes, dev tools, experimental integrations, and non-golden-path demonstrations extracted in Phase 2                                             | Follows supported framework releases but carries no stable application API promise                             |

Do not create separate CLI, website, contracts, benchmark, fixture, or demo-source
repositories until the split criteria below are met.

## Executed transition sequence

The provider migration was completed after identity activation prerequisites passed:

1. preserve/archive the older conflicting Template name before the target became available;
2. rename `vireocodedev/starter` to `vireocodedev/vireo`;
3. rename active `vireocodedev/starter-template` to
   `vireocodedev/vireo-template`;
4. update remotes, package metadata, badges, CODEOWNERS, workflows, release consumers,
   branch protections, security settings, and cross-repository tokens;
5. verify GitHub redirects from the old repository URLs and retain explicit pointer
   repositories if any integration does not follow redirects safely;
6. defer the examples split until Phase 2 defines the minimal Template.

## Why TypeScript and JVM stay together

The framework repository contains two independent build and release graphs because
the TypeScript and JVM artifacts have different ecosystems and semantic-versioning
needs. They remain in one source repository because:

- cross-stack wire contracts, generated slices, and compatibility fixtures must
  change atomically;
- one issue and roadmap must express end-to-end application behavior;
- architecture reviews can see both sides of a capability;
- coordinated releases and Template updates can identify one source commit;
- a small maintainer team avoids duplicating governance, automation, and security
  surfaces.

Normative rules:

1. neither build graph resolves unpublished artifacts from the other;
2. TypeScript and JVM packages retain independent versions and changelogs;
3. shared contracts are language-neutral fixtures or schemas, never imports from the
   other build output;
4. CI reports each graph separately and tests their shared contracts explicitly;
5. a failure in one graph blocks a coordinated change but does not force a version
   bump in unaffected artifacts.

## Directory ownership in `vireo`

| Area                                                 | Responsibility                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| `packages/`                                          | Public TypeScript packages and future CLI package                         |
| `jvm/`                                               | Public JVM modules, BOM, consumer fixtures, and aggregate documentation   |
| `contracts/`                                         | Language-neutral canonical wire schemas/fixtures                          |
| `fixtures/compatibility/`                            | Previous/current version consumers and generated migration fixtures       |
| `generators/` or current generator-owned script area | Project/component/entity generator implementation and templates           |
| `docs/`                                              | Framework, architecture, contributor, API, and roadmap documentation      |
| `site/` (when introduced)                            | Documentation/marketing site source and deployment configuration          |
| `examples/`                                          | Only small executable documentation examples required to test packages    |
| `benchmarks/`                                        | Reproducible non-normative performance harnesses and recorded methodology |

If a future source move changes these exact paths, it must preserve the ownership
boundaries rather than the spelling.

## Cross-repository contracts

- `vireo` owns public package APIs, schemas, generators, release metadata, and the
  compatibility policy.
- `vireo-template` owns application composition and replaceable adapters; it may not
  reach into unpublished framework source in its authoritative published mode.
- The Template records the exact framework source/release it verifies and tests both
  public-package and explicitly enabled local-source modes.
- Issues originate in the repository that owns the defect. Cross-repository work
  uses reciprocal links and a `cross-repo` label; duplicate issues are not used as
  synchronization state.
- A framework release is not complete until its clean consumer fixture passes. A
  Template release is not complete until its declared public package range passes.
- Security advisories remain private in the owning repository and are coordinated
  before either side discloses a shared vulnerability.

## Website, CLI, demo, and examples

- **CLI:** stays in `vireo` because it generates and upgrades framework contracts and
  must be tested atomically with them. It releases as its own npm package.
- **Website:** source stays under `vireo/site`; deployment is independent. Split only
  if a separate content team/cadence emerges.
- **Demo:** deploy from a tagged Template or examples commit. Do not fork product
  behavior into a demo-only repository.
- **Examples:** remain small package fixtures until Phase 2 extracts the current
  broad dev-tool catalog to `vireo-examples`.
- **Benchmarks:** stay beside the contract they measure and are never release gates
  without an approved measurement policy.

## Repository admission and split criteria

A new repository requires all of:

1. an independently understandable product or deployable with a distinct owner;
2. a release/support cadence materially different from existing repositories;
3. a boundary enforceable only through published artifacts or network contracts;
4. lower total contributor and security cost than a directory boundary;
5. a migration, issue-routing, release-linking, and archival plan.

Archive or merge a repository when it has no distinct release, owner, or adoption
surface for two supported release cycles.

## Consequences

### Positive

- one discoverable framework repository and one honest external consumer;
- cross-stack changes remain atomic without coupling artifact versions;
- the minimal Template cannot silently depend on workspace internals;
- the project avoids premature repository and automation sprawl;
- examples can evolve quickly without redefining the golden path.

### Costs

- the framework CI remains broad and needs graph-aware performance budgets;
- changes spanning Template and framework still require coordinated pull requests;
- the old Template repository must be archived carefully before the target name is
  available;
- repository redirects and package metadata require a rehearsed migration.

## Reversal and future split

TypeScript or JVM may split into its own repository only if it gains an independent
maintainer/release community, shared-contract changes become uncommon, and published
compatibility fixtures can replace atomic source changes. Preserve history with a
filtered migration, retain old-path documentation, and make the old monorepo consume
the split artifacts before declaring success.

If the active Template must return to the framework monorepo, keep its published
consumer verification in an isolated build with no workspace substitution. The
architectural boundary matters more than repository count.
