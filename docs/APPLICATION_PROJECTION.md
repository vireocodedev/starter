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

The root generator gate invokes this command. The next projection implementation should
consume the same classifier while materializing the pinned Template, reject unclassified
archive paths, render substitution-required surfaces, and persist resolved identity in
`.vireo/project.json`.
