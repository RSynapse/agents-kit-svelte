# Changesets

Every pull request that changes what ships in the npm package (anything under `src/lib/`)
should include a changeset. Run:

```bash
corepack pnpm changeset
```

pick `patch`, `minor` or `major`, and write one line describing the change for users.
The release workflow collects these into a "Version Packages" pull request; merging that
PR bumps the version, writes `CHANGELOG.md` and (once publishing is enabled) publishes to npm.
