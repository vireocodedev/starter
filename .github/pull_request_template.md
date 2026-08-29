## Summary

Describe the user-visible behavior and architectural owner.

## Release impact

- [ ] Every affected npm package has a changed Changeset, or a changed
      `.release-impact/*.json` no-release exemption with a concrete justification.
- [ ] Every affected JVM module or deployable application has a changed
      `.release-impact/*.json` release decision or justified no-release exemption.
- [ ] Release summaries and bump/deploy intent are appropriate for consumers.

List the relevant Changeset and release-impact record paths. See
[`docs/RELEASE_IMPACT.md`](../docs/RELEASE_IMPACT.md).

## Loading-state contract

- [ ] This change has no async-capable visual surface, or every affected surface declares its loading category.
- [ ] Initial, content, refreshing, empty, error, and mutation states are defined or intentionally not applicable.
- [ ] Geometry is declared as Level A, B, or C where applicable.
- [ ] Usable content remains visible during refresh and busy actions retain their context.
- [ ] One boundary owns reveal timing, `aria-busy`, and announcements; nested visual leaves remain silent.
- [ ] Applicable canonical stories and geometry/accessibility tests are included.
- [ ] Supported themes, localization, responsive modes, and reduced motion were considered.

## Verification

List the focused and full checks run for this change.
