# Vireo CLI

The public `create-vireo` package exposes two executables with different jobs.

## `create-vireo`

Use the create executable through npm to produce a new project from the pinned golden-path template:

```bash
npm create vireo@latest my-app
npm create vireo@latest my-ui -- --profile frontend
```

Creation is atomic: the destination is not presented as complete until the projection and metadata are valid.

## `vireo`

Generated projects pin the application-development CLI through their `vireo` npm script:

```bash
corepack npm run vireo -- generate entity schema.json
corepack npm run vireo -- check
corepack npm run vireo -- eject entity-plural
corepack npm run vireo -- upgrade --to VERSION
```

## Project scripts versus CLI commands

`setup`, `dev`, `doctor` and `verify` are project scripts. `generate`, `check`, `eject` and `upgrade` are Vireo CLI commands. This distinction lets diagnostics and runtime composition vary by profile without expanding the global CLI surface.

## Machine-readable output

Generation and checking support `--json` where automation needs structured output. Human output remains optimized for review and includes the next safe command.

Continue with [Doctor diagnostics](/docs/cli/doctor/), [Entity generation](/docs/cli/generate/) or [Project upgrades](/docs/upgrades/).
