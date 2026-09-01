# Working with Codex in Vireo repositories

Start Codex from the repository you intend to change:

```bash
cd vireo
codex
```

Use the same pattern for the Template or a generated application. Starting in the
repository root lets Codex load that repository's `AGENTS.md` and its `.agents/skills`
guidance. Start from a deliberate shared workspace only for cross-repository work;
say which repositories are in scope, because a workspace-root session should not
assume every nested repository is part of the change.

## Skills and instructions

Codex discovers skills from the active repository's `.agents/skills` directory.
Starter contains framework-maintainer skills. The Template keeps its maintainer skill
separate and projects application-facing skills into newly generated apps. Read the
nearest `AGENTS.md` before changing a specialized subtree; those files route to the
authoritative project documents rather than replacing them.

Generated applications may customize their root `AGENTS.md`, but should preserve the
meaning of managed Vireo files until an upgrade or ejection deliberately transfers
ownership. Older applications can lack current metadata or skills; inspect their
actual manifests and scripts instead of assuming the latest Template layout.

## Trust and external connections

Trust a repository only after you have reviewed its source and intended commands.
Trust allows its project configuration and instructions to influence your session; it
does not authorize publishing, deployment, credential changes, or destructive work.

Plugins and connected services are optional. Connect only services your organization
uses, review their requested permissions, and keep human approval for external
mutations. Repository skills should describe repeatable engineering work; live
provider data and organization permissions belong in explicitly connected tools.
