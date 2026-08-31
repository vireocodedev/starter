# Provider-control desired state — 2026-08-31

Status: **live machine controls applied and authenticated; environment administrator-bypass UI action open**

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

## Authenticated live evidence

GitHub user `@brunotot` applied and re-read the controls at
`2026-08-31T21:05:49Z`:

- Starter ruleset `21958171` actively protects `main` with no bypass actor,
  PR-only updates, resolved conversations, deletion/force-push prevention, and
  all 12 required checks bound to GitHub Actions app `15368` or Advanced
  Security app `57789` as appropriate.
- Starter ruleset `21958125` actively prevents update or deletion of every tag,
  with no bypass actor. Template rulesets `21958166`, `21958135`, and `21926710`
  protect `main`, `starter-template@0.7.0`, and `starter-template@0.6.0`.
- both repositories report selected Actions, SHA pinning, the exact checked-in
  external-action patterns, read-only default workflow permissions, and
  `can_approve_pull_request_reviews: false`;
- `package-release`, `maven-central`, and `github-pages` admit only branch
  `main`; `template-release` admits only branch `main` and tag pattern
  `starter-template@*`; publication environments retain the documented sole
  interim reviewer; and
- both CODEOWNERS error endpoints return an empty error list. Private
  vulnerability reporting, Dependabot security updates, secret scanning,
  non-provider patterns, push protection, and validity checks remain enabled in
  both repositories.

The authenticated environment reads still report `can_admins_bypass: true` for
all four environments. GitHub exposes this value for reading but not through the
documented REST or GraphQL update schemas, so disabling it in the GitHub UI and
capturing a new GET export is the remaining machine-provider action. Independent
approval and backup-owner recovery remain separate human gaps.
