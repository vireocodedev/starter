# Anonymous consumer zero-to-production gauntlet

The scheduled **Anonymous consumer gauntlet** is Vireo's public-consumption
qualification. It derives every exact npm, Maven and Template coordinate from
[`contracts/ecosystem-release-contract.json`](../contracts/ecosystem-release-contract.json),
then consumes registry/Central artifacts rather than this checkout.

It creates a fresh temporary consumer for every run. npm uses a blank user config
and cache; credential-shaped environment variables are removed; Gradle receives a
fresh user home; Maven Local and workspace/file/link dependencies are refused. The
workflow has no secrets and publishes only sanitized, atomic JSON evidence.

The policy requires sequential evidence for public artifacts; CLI help/dry-run and
failure cleanup; frontend and H2 applications; PostgreSQL production-like creation;
Doctor/identity/provenance; generation, idempotence and refusal; sample removal and
ejection; Storybook, production, browser/PWA, container/proxy/header/database
boundaries; supported adjacent upgrades; and npm/Maven package surfaces.

Run the structural offline check with `corepack npm run consumer:gauntlet:check`.
The actual gauntlet is intentionally hosted because it uses public registries,
containers, Chromium and JVM verification. Trigger it from Actions or run
`corepack npm run consumer:gauntlet -- --evidence-dir anonymous-consumer-evidence`.
Its evidence is diagnostic only: a real provider, product or physical-device
decision is recorded as a human roadmap item rather than silently treated as pass.
