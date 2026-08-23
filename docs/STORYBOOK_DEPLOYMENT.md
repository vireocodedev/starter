# Storybook deployment

The repository-wide Vireo Starter Storybook is published as a static GitHub
Pages site at <https://vireocodedev.github.io/starter/>.

The deployment workflow lives in
[`storybook-pages.yml`](../.github/workflows/storybook-pages.yml). Every push to
`main` builds the same Storybook production artifact used by the authoritative
verification bundle, uploads `packages/ui/storybook-static` as the Pages
artifact, and deploys it to the `github-pages` environment. Maintainers can also
start the workflow manually with `workflow_dispatch`.

## One-time repository setup

1. Open **Settings → Pages** in the GitHub repository.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Confirm that Actions may create deployments for the `github-pages`
   environment. Add environment protection rules only when deployments should
   require manual approval.
4. Merge the deployment workflow into `main` or run it manually after merging.

The workflow uses only `GITHUB_TOKEN`. It needs `contents: read` and
`packages: read` to install the monorepo, plus `pages: write` and
`id-token: write` to create the Pages deployment. No long-lived deployment
secret, publish branch, or generated Storybook output is committed.

GitHub Pages is public. Do not put credentials, private payloads, production
customer data, or other confidential material in stories, MDX, fixtures, or
static assets.

## Local production verification

Build the exact directory uploaded by the workflow:

```bash
npm ci
npm run build-storybook
```

The generated site is written to `packages/ui/storybook-static` and ignored by
Git. `npm run verify` also builds this production Storybook as its final step.

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
