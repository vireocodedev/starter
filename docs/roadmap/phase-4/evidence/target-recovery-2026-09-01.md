# Target-environment recovery evidence — 2026-09-01

Status: **maintainer preparation complete; independent witness still required**.

On 2026-08-31T23:11:06Z–23:11:28Z, a maintainer performed an isolated synthetic
hosted-demo rehearsal against Template revision
`a24f9435d3f624fb1962c3d5c4e3457b69f5be28`. This was not a production recovery
claim and `independentWitness` was `false`.

| Step | Sanitized result |
| --- | --- |
| Guarded backup | 1 s; 25,048 bytes; mode `0600`; SHA-256 `ed671e99c90f6c8b29c28e1f18e7ce0d0f07e7ac7450e44d1589b8a6932b2a86`; `pg_restore --list` passed |
| Isolated restore | New temporary database; 11 s from restore start through application verification; snapshot age at verification 11 s |
| Data and application acceptance | Source and target each had 8 Items, 1 user, and 4 Flyway migrations; readiness, demo login, and authenticated Item search passed |
| Sanitized SEV-3 recovery incident | A loopback-only recovery application was removed; outage was detected; the reviewed immutable image was recreated against the restored database; readiness, login, and Item search passed in 10 s; no public traffic was affected |
| Cleanup and retention | Temporary application/database count: 0. Successful backup and JSON are retained mode `0600` at `/opt/apps/vireo-flagship-demo/operations/evidence/recovery-20260831T231106Z.{dump,json}`; failed-attempt backups were removed |

An earlier restart-only attempt did not regain readiness within the verifier window.
The incident procedure now prefers immutable image recreation or a reviewed rollback
over mutable-container restart. The backup is retained on the same host and is **not**
independent-failure-domain storage; this rehearsal does not claim disaster-recovery
durability.

The detailed Template [rehearsal record](https://github.com/vireocodedev/vireo-template/blob/main/docs/hosted-demo-recovery-rehearsal-2026-09-01.md),
[database recovery](https://github.com/vireocodedev/vireo-template/blob/main/docs/database-recovery.md),
and [incident response](https://github.com/vireocodedev/vireo-template/blob/main/docs/incident-response.md)
remain the operating sources. A second trusted person must witness a target-environment
restore and incident rehearsal before the Phase 4 row can pass.
