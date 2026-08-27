# Governance

Vireo is currently stewarded by the Vireo Code maintainers. This document describes
how public contributions are evaluated; it does not promise staffing or response
times.

## Roles and authority

- Contributors propose issues, documentation, code, tests, and design feedback.
- Maintainers triage contributions, review changes, manage releases and security,
  and interpret the project's published contracts.
- Repository ownership is declared in [`.github/CODEOWNERS`](.github/CODEOWNERS).
  Code ownership requests review; it does not grant merge or release authority.
- Vireo Code maintainers have final responsibility for roadmap, merge, release,
  moderation, security, and compatibility decisions.

There is currently no elected governing body or guaranteed path from contribution to
maintainer status. Maintainers may invite additional trusted maintainers based on
sustained technical judgment, constructive participation, security practices, and
available capacity. Access is least-privilege and may be removed when inactive or
when needed to protect the project.

## Decision process

Routine decisions are made in issues and pull requests. Material changes to public
APIs, compatibility, security, package coordinates, or architecture must state the
problem, alternatives, migration impact, and verification evidence. Maintainers seek
rough consensus when practical and record the final decision in the relevant pull
request or roadmap decision record. When consensus is not possible, maintainers make
the decision and explain the trade-off.

The roadmap communicates intent, not a delivery guarantee. An accepted issue or pull
request does not commit the project to a release date.

## Merge and release

Changes require review, the authoritative verification gate, and compliance with
[CONTRIBUTING.md](CONTRIBUTING.md). Only authorized maintainers may merge, publish
npm or Maven artifacts, approve protected release environments, or issue security
releases. Release compatibility follows [the compatibility policy](docs/COMPATIBILITY.md).

Conduct concerns follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md); vulnerabilities
follow [SECURITY.md](SECURITY.md); general requests follow [SUPPORT.md](SUPPORT.md).
