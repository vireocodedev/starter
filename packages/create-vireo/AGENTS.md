# create-vireo

`create-vireo` owns project creation, generated capability contracts, and declared upgrade edges. It must fail closed rather than overwrite application decisions.

- Keep creation metadata, entity manifests, generated contracts, and ownership classifications compatible with the published CLI contract.
- Classify every Template path in the projection contract before copying it. Managed paths may be upgraded; application-owned paths must remain reviewable and ejectable.
- Preserve both full-stack and frontend projection behavior deliberately. A full-stack path must not leak into frontend output merely because it is present in the Template.
- Use local fixtures and dry-runs for generator or projection changes. Do not use a real consumer directory as a test fixture.

Read `README.md`, `../../docs/APPLICATION_PROJECTION.md`, and `../../docs/architecture/generated-code-ownership.md` before changing projection or upgrades.
