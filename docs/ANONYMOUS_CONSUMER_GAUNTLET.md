# Anonymous consumer zero-to-production gauntlet

The scheduled **Anonymous consumer gauntlet** is Vireo's public-consumption
qualification. It derives every exact npm, Maven and Template coordinate from
[`contracts/ecosystem-release-contract.json`](../contracts/ecosystem-release-contract.json),
then consumes registry/Central artifacts rather than this checkout.

It creates a fresh temporary consumer for every run. npm uses a blank user config
and cache; credential-shaped environment variables are removed; Gradle receives a
fresh user home; Maven Local and workspace/file/link dependencies are refused. The
consumer job is token-free and publishes only sanitized, atomic JSON evidence. A
separate least-privilege `attestations: read` job consumes that evidence to verify
the signed SBOMs; its GitHub token is never exposed to the consumer process.
That verifier keeps the immutable release-tag commit, the exact gauntlet verifier
commit, and the SBOM-attester commit as distinct identities. It derives the
attester commit only from GitHub's verified certificate, requires all certificate
SHA claims to agree, and accepts it only within the policy's checked-in trusted
workflow ancestry window. This permits a later gauntlet to verify historical
public SBOMs without treating the release tag as the attester source. Future
attestations are ignored rather than allowed to alter the historical result.

The policy requires sequential evidence for public artifacts; CLI help/dry-run and
failure cleanup; frontend and H2 applications; PostgreSQL production-like creation;
Doctor/identity/provenance; generation, idempotence and refusal; sample removal and
ejection; Storybook, production, browser/PWA, container/proxy/header/database
boundaries; supported adjacent upgrades; and npm/Maven package surfaces.

Automation records command-level hashes, timing, expected exits, structured
findings and external warnings. It verifies public registry/Central artifacts,
licenses, SBOM/provenance material, package surfaces and generated-project
contracts. Detached Maven signatures use the checked-in pinned public key and
hard-fail on any import, fingerprint, checksum, or signature mismatch. Physical-device
PWA branding/install evidence and real adopter/product decisions remain human-only
work.

Run the structural offline check with `corepack npm run consumer:gauntlet:check`.
The actual gauntlet is intentionally hosted because it uses public registries,
containers, Chromium and JVM verification. Trigger it from Actions or run
`corepack npm run consumer:gauntlet -- --evidence-dir anonymous-consumer-evidence`.
Its evidence is diagnostic only: a real provider, product or physical-device
decision is recorded as a human roadmap item rather than silently treated as pass.
