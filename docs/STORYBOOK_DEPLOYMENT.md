# Documentation deployment

The repository-wide Vireo documentation portal is published as a static GitHub
Pages site at <https://vireocodedev.github.io/starter/docs/>. Storybook remains at
the site root and is also preserved inside the current version-specific snapshot.

The deployment workflow lives in
[`storybook-pages.yml`](../.github/workflows/storybook-pages.yml). Every push to
`main` builds package declarations, Storybook, aggregate JVM Javadocs, generated
TypeScript API references, the unified search index, and the versioned portal. It
validates and uploads `packages/ui/storybook-static` as the Pages artifact, then
deploys it to the `github-pages` environment. Maintainers can also start the
workflow manually with `workflow_dispatch`.

## One-time repository setup

1. Open **Settings → Pages** in the GitHub repository.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Confirm that Actions may create deployments for the `github-pages`
   environment. Add environment protection rules only when deployments should
   require manual approval.
4. Merge the deployment workflow into `main` or run it manually after merging.

The workflow uses only `GITHUB_TOKEN`. Its build job needs `contents: read`; its
deployment job needs `pages: write` and `id-token: write`. No long-lived deployment
secret, publish branch, or generated documentation output is committed.

GitHub Pages is public. Do not put credentials, private payloads, production
customer data, or other confidential material in stories, MDX, fixtures, or
static assets.

## Local production verification

Build the exact directory uploaded by the workflow:

```bash
corepack npm ci
corepack npm run build-docs
```

The generated site is written to `packages/ui/storybook-static` and ignored by
Git. `corepack npm run verify` builds the production Storybook; the complete
`corepack npm run verify:all` gate additionally assembles and validates the
TypeScript/JVM API portal.

## Custom domain

The initial deployment should use the standard `github.io` address. A verified
custom subdomain can be added later in **Settings → Pages** without changing the
workflow. If a custom domain is introduced, configure its DNS record, verify the
domain in GitHub, and enforce HTTPS before treating it as canonical.

## Operational behavior

- Deployments are serialized through the `pages` concurrency group.
- An in-progress deployment is allowed to finish; a newer run waits rather than
  cancelling a partially published site.
- The build and deploy jobs are separate, so Pages can only publish a completed
  artifact.
- The deployment URL is recorded on the `github-pages` environment and in the
  workflow run summary.
- A failed build or upload leaves the currently published site untouched.

For a failed deployment, inspect the **Deploy Storybook to GitHub Pages**
workflow first. The most common setup failure is that the repository's Pages
source has not yet been changed to **GitHub Actions**.
