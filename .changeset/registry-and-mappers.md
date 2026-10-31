---
'agents-kit-svelte': minor
---

`IntelligentUIRenderer` takes a `registry` prop: map node types to your own components (or replace the built-in ones) with `defineUIRegistry()`. Built-in node types live in `defaultUIRegistry`. Nodes missing a required prop, or naming an unknown type, render a short note. The renderer no longer invents sample data for nodes that omit props, and it now passes every node prop through to the component.

New in `agents-kit-svelte/core`: `fromGitHubRest.issue`, `.pullRequest`, `.checkRun` and `.commit` map GitHub REST responses to the card types, with `formatRelativeTime`, `formatDuration` and `labelTone` helpers.

Types: `DynamicUINode.component` and `SupportedAgentId` accept any string. `GitHubPullRequestData.riskTier` and `refereeStatus` are optional, and `PlanCard` shows a risk badge only when `riskTier` is passed.
