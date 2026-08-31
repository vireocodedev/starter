# Provider-control desired state — 2026-08-31

Status: **source-reviewed desired state; not evidence that GitHub has applied it**

The checked-in JSON under [`.github/rulesets`](../../.github/rulesets),
[`.github/environments`](../../.github/environments), and
[`.github/settings`](../../.github/settings) is split by the GitHub endpoint it
describes. `actions.json` is the repository Actions-permissions PUT payload,
including `sha_pinning_required`; `selected-actions.json` is the selected-actions
PUT payload. Each environment JSON
is its environment PUT payload; its matching
`.deployment-branch-policies.json` file is the collection of per-policy POST
payloads. These files must not be submitted as one combined payload.

Environment `*.live-assertions.json` files describe settings that must be verified
from live provider evidence rather than sent through those REST payloads. In
particular, GitHub does not expose environment administrator bypass through the documented
REST or GraphQL schemas used here: disable it in the GitHub UI and retain both UI
confirmation and an authenticated environment GET export. `corepack npm run
security:repository` rejects source drift; it cannot read or change provider
settings.

The desired state is:

- an active, no-bypass `main` ruleset in both repositories: deletion and force
  pushes blocked; PR conversation resolution and strict named checks required;
- an active, no-bypass Starter tag ruleset for `refs/tags/**`; Template retains
  its release-specific immutable-tag rulesets;
- selected GitHub Actions only, with SHA pinning, GitHub-owned actions, and the
  reviewed Gradle/Changesets pins; read-only default workflow tokens and no
  workflow PR approval;
- `package-release` and `maven-central` restricted to `main`, and `github-pages`
  restricted to `main`, all without administrator bypass; and
- `template-release` restricted to `main` dispatches and `starter-template@*`
  tags, without administrator bypass.

The only currently evidenced owner is GitHub user `53398175` (`@brunotot`).
Accordingly the interim main rulesets set zero required approvals and do not
require CODEOWNERS approval; self-review prevention is disabled for protected
publication environments. These are availability safeguards for a single-owner
repository, not evidence of independent review. A second trusted maintainer,
independent review, and a backup-owner recovery exercise remain open.

Before updating this file to a live-evidence record, capture the ruleset IDs and
full settings/environment API responses, confirm their branch/tag policies, and
record the authenticated actor and timestamp. Never mark `P1-09` or `G-107`
complete from this desired-state file alone.
