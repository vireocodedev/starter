# Application projection and ownership

Status: executable foundation for the `create-vireo` Template projection.

`contracts/application-projection-contract.json` is the authoritative, schema-versioned
classification of Template surfaces. It replaces the assumption that a generated
application owns every file in the Vireo flagship repository.

## Ownership categories

- `maintainer-only`: flagship operations, evidence, and Vireo governance; excluded.
- `managed`: framework integration copied with provenance and upgraded by Vireo tooling.
- `application-owned`: copied once and then reviewed and maintained by the application.
- `optional`: emitted only for a selected profile, example, or capability.
- `substitution-required`: rendered from explicit project and ownership identity.
- `historical`: dated Vireo evidence; retained upstream and excluded from applications.

Exact path rules outrank prefix rules. Among prefixes, the longest matching prefix wins.
Equal-specificity matches and unclassified paths fail closed. This lets narrowly reviewed
exceptions override a larger source area without making an unknown future file silently
application-owned.

## Identity contract

Creation requires a project name and display name. Application owner, repository,
support, and security coordinates may initially use the contract's conspicuous `UNRESOLVED_VIREO_*` markers,
but a release-facing check must reject every unresolved marker. A released project must
use its own repository, and its security route must be distinct from ordinary support.
Vireo Starter and Template routes are explicitly forbidden as generated defaults.

Run the semantic contract and corruption tests with:

```bash
corepack npm run projection:check
```

The root generator gate and `create-vireo` consume the same bundled classifier. Creation
inventories every pinned Template path, rejects an unclassified or ambiguous path, excludes
maintainer-only and historical material, and emits optional rules only when the contract
selects them by default. The published package ships an exact copy of the contract; the
projection policy rejects drift between that copy and this canonical file.

`create-vireo` renders the public identity surfaces and persists all six identity fields in
`.vireo/project.json`. Release coordinates default to their unresolved markers so a newly
created application never inherits Vireo's repository, support, or security routes.
