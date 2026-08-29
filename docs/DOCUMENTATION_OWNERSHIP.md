# Documentation ownership

`contracts/documentation-ownership-contract.json` gives every public document one
purpose, owner, and freshness rule. The documentation gate inventories checked-in
Markdown and MDX rather than relying on a hand-maintained list of titles.

## Categories

- `canonical` is authoritative current guidance. The website content is canonical
  for adopter journeys; repository policies remain canonical for maintainers.
- `generated` is rebuilt from source policies or API inventories and is not an
  independent editing surface.
- `exact-version` describes a package, API, or compatibility snapshot and follows
  `contracts/documentation-release-policy.json`.
- `historical` preserves dated evidence and decisions without presenting them as
  current instructions.
- `application-owned` is rendered for a scaffold and becomes the generated
  application's responsibility, including its support and security routes.

Exact paths take precedence over directory rules; otherwise the longest matching
directory rule wins. Unknown paths and equal-specificity matches fail. Repeated
titles are permitted across one ownership category, but a title spanning categories
must have an exact resolution naming the canonical document and every intentional
duplicate. Stale exceptions fail too.

`Architecture` is the current intentional cross-category title: the site page is
canonical adopter guidance, while `docs/ARCHITECTURE.md` is an exact-version package
dependency record.

Run the executable policy and its adversarial tests with:

```bash
node scripts/documentation-ownership-policy.mjs
node --test scripts/documentation-ownership-policy.test.mjs
```
