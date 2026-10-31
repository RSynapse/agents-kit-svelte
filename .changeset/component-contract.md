---
'agents-kit-svelte': minor
---

Components no longer fall back to demo data. Lists default to empty, the main label or record a component shows is required, and descriptions, timestamps and stats are hidden when not passed. Demo loops (`live`) are off by default. All the old samples are exported from `agents-kit-svelte/fixtures`.

Every component now forwards extra attributes (`id`, `aria-*`, `data-*`, `style`, handlers) to its root element. `AgentToolPalette` builds its category tabs from the tools you pass (`ToolCategory` is now `string`), with `categoryLabels` and `defaultSelectedId`.
