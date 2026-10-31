---
'agents-kit-svelte': minor
---

Add collection entry points: `agents-kit-svelte/chat`, `/github`, `/skills`, `/workflows`, `/generative`, `/data`, `/effects`, `/primitives`, `/core` and `/fixtures`. The root import still exports every component and helper.

Breaking: the site-only `CATALOG_ITEMS` catalogue and `validateSvelte5ComponentSource` audit are no longer part of the package, and the skill sample data (`SAMPLE_SKILLS` and friends) moved from the root to `agents-kit-svelte/fixtures`. `sideEffects` now lists only CSS.
