# Releasing `agents-kit-svelte`

The package is built from `src/lib` with `svelte-package` into `dist/` and published to npm.
Versions and changelogs are managed with [Changesets](https://github.com/changesets/changesets).

## Day to day

1. In any PR that changes `src/lib`, run `corepack pnpm changeset`, pick patch / minor / major
   and describe the change for users. Commit the generated `.changeset/*.md` file.
2. CI (`.github/workflows/ci.yml`) runs `check`, `test`, `package` (with publint) and
   `test:install`, which installs the packed tarball into a fresh Svelte 5 + Tailwind v4 app
   and type-checks and builds it.
3. On `main`, the release workflow (`.github/workflows/release.yml`) opens or updates a
   **"chore(release): version packages"** PR that bumps `package.json` and writes `CHANGELOG.md`.
4. Merging that PR publishes the new version to npm, **only when publishing is enabled** (below).

## Enabling publishing (one-time)

Nothing is published until the repository variable `NPM_PUBLISH` is `true`.

1. **First publish of `0.1.0`.** Either:
   - locally: `npm login`, then `corepack pnpm package && npm publish --provenance=false`
     (provenance can only be generated in CI), or
   - from CI: create an npm granular access token with publish rights, save it as the
     repository secret `NPM_TOKEN`, set the variable `NPM_PUBLISH=true`, and re-run the
     Release workflow from the Actions tab. `changeset publish` publishes any version in
     `package.json` that is not on npm yet.
2. **Switch to trusted publishing (recommended).** On npmjs.com open the package →
   Settings → Trusted publishing → add GitHub Actions with repository
   `RSynapse/agents-kit-svelte` and workflow `release.yml`. You can then delete the
   `NPM_TOKEN` secret; the workflow authenticates with GitHub OIDC and adds provenance.
3. Secrets and variables live under **GitHub → Settings → Secrets and variables → Actions**.

## Manual release (fallback)

```bash
corepack pnpm changeset version   # bump version + CHANGELOG
git commit -am "chore(release): version packages" && git push
corepack pnpm release             # package + changeset publish
```
