# Phase 2 verification record

## Required automated evidence

1. `create-vireo` unit tests: customization, metadata, target refusal, dry run, and cleanup behavior.
2. Packed-tarball smoke: executable CLI, importable programmatic API, strict declarations, and no forbidden content.
3. Public-archive clean room: generate from the pinned GitHub archive into an empty directory, setup, doctor, build, JVM test, and repository verification.
4. Database matrix: H2 first run and PostgreSQL Compose preflight.
5. CLI matrix: interactive-equivalent defaults and fully non-interactive flags.
6. Template authoritative gate after the minimal-boundary change.

## 2026-08-27 engineering record

| Evidence                      | Result                                                                                                                                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Minimal Template and root DX  | Template `5745c47`; frontend typecheck and all 82 unit/integration tests passed.                                                                                                                                                                                                         |
| Bundle regression remediation | Template `a806ece`; production build passed at 1,748.2 KiB total and 639.4 KiB largest chunk.                                                                                                                                                                                            |
| Hosted setup binding          | Template `9c77b6e`; root setup is now the documented and CI-executed install path. Template `f1005fb` preserves the frontend-lockfile boundary in CodeQL after the root package was introduced; `88cd525` gives browser interactions an explicit CI budget.                              |
| Exact public archive          | `create-vireo` generated from pinned full commit `88cd525f779badef1f671140f2140f088324f4e4`; project name, Java package, database, metadata, README, PWA name, and localized brand were customized.                                                                                      |
| H2 clean room                 | Runtime-equivalent Template `a806ece` installed 691 locked packages with zero audit vulnerabilities; every doctor check passed; frontend production build and JVM tests passed. Later pinned commits change workflow/test wiring, not generated runtime behavior.                        |
| Root development workflow     | The generated app started frontend and backend together; `http://127.0.0.1:3000/` returned successfully and `/actuator/health` returned `UP`; one interrupt stopped both processes.                                                                                                      |
| PostgreSQL preflight          | The generated default selected PostgreSQL and doctor emitted `VIR-DB-001` with the Docker Compose remedy. This host has no `docker compose`, so a local PostgreSQL root-dev launch was not fabricated; existing hosted PostgreSQL/deployment lanes remain the database-runtime evidence. |
| Packed package consumer       | All eight tarballs, 23 entry points, licenses, integrity, strict declarations, source-map policy, importability, and the `create-vireo --dry-run --json` executable passed.                                                                                                              |
| Template authoritative gate   | 5/5 stages passed in 134.7 seconds: public contract, frontend 10/10, browser smoke, JVM build, and container contract; zero performance warnings.                                                                                                                                        |
| Starter authoritative gate    | 11/11 stages passed in 90.3 seconds; zero performance warnings.                                                                                                                                                                                                                          |
| Final hosted heads            | Template `88cd525` passed Verify (including its production-like PostgreSQL deployment), Security, and CodeQL. Starter `7a096a3` passed CI, Security, CodeQL, documentation/Pages deployment, and release-PR maintenance.                                                                 |

The clean-room directory was outside both repositories and is disposable evidence, not committed product state. Registry resolution is recorded independently because a local tarball cannot prove `npm create vireo@latest` is anonymously consumable.

## 2026-08-28 public activation record

`create-vireo@0.2.0` and `@vireocodedev/ui@0.2.2` were published from protected
workflow run [`33142739135`](https://github.com/vireocodedev/starter/actions/runs/33142739135)
with registry-backed provenance. Token-free public verification run
[`33143174421`](https://github.com/vireocodedev/starter/actions/runs/33143174421)
resolved every exact workspace version, compiled and bundled every public entry
point, and verified registry integrity and signatures. SBOM attestation run
[`33143174581`](https://github.com/vireocodedev/starter/actions/runs/33143174581)
bound and verified the public npm and Maven artifacts. This closes the registry
portion of `P2-02`; the unfamiliar-human gate in `P2-08` remains external.

## Human exit gate

The roadmap gate is at least 70% successful unassisted starts by unfamiliar external testers. Record participant count, recruitment criteria, exact public command/version, unassisted success count, time to first running app, and anonymized friction codes. Maintainers, automated jobs, and AI proxy sessions are excluded from the percentage.

Until that evidence exists, Phase 2 may be **engineering complete** but not gate-complete.
