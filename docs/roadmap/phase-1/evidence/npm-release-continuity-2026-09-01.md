# npm release continuity evidence — 2026-09-01

The repository-rename trusted-publisher migration is complete for all eight public
npm packages:

- `create-vireo`
- `@vireocodedev/history`
- `@vireocodedev/infrastructure`
- `@vireocodedev/localization`
- `@vireocodedev/query`
- `@vireocodedev/shell`
- `@vireocodedev/sqlite`
- `@vireocodedev/ui`

For every package, the sanitized npm trusted-publisher readback identifies
`vireocodedev/vireo`, workflow `release-npm.yml`, and protected environment
`package-release`. The former `vireocodedev/starter` publisher identities were
replaced before the release exercise.

The post-rename release successfully published `create-vireo@0.8.0` from Vireo
commit `3aa5d5ab1bf01b0214a4a1e81d090ebb540b29e3`. The release publisher preserved
the seven immutable scoped package versions, verified their historical provenance,
and did not recreate a historical tag. Its protected publication and anonymous
registry verification are retained in [run 33545889091](https://github.com/vireocodedev/vireo/actions/runs/33545889091).

The public verification workflow then resolved, compiled, bundled, and verified
signatures/provenance for all eight npm packages from the anonymous registry in
[run 33547238163](https://github.com/vireocodedev/vireo/actions/runs/33547238163).
The coordinated attestation workflow created and verified eight npm and six Maven
SBOM attestations in [run 33547238437](https://github.com/vireocodedev/vireo/actions/runs/33547238437).

This closes repository-rename npm release continuity as an engineering evidence
item. It does not change participant, adopter, or maintained-deployment counters.
Future repository-identity migrations and new public npm packages must repeat the
trusted-publisher procedure and a protected publication followed by anonymous
verification.
