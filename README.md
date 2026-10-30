# agents-kit-svelte

Svelte 5 Runes port of [`agents-ui/agents-kit`](https://agents-ui.github.io/agents-kit/) and the **Trailside Dynamic Claude Code Chat Component**.

## Highlights

- **Pure Svelte 5 Runes Architecture**: Every component uses `$props()`, `$state()`, `$derived()`, `$effect()`, and typed `Snippet` blocks — zero legacy Svelte 4 syntax (`export let` or `$:`).
- **Semantic Design System Tokens**: Built on Tailwind CSS v4 with OKLCH semantic tokens (`bg-canvas-primary`, `bg-canvas-secondary`, `bg-card-bg`, `text-fg-main`, `text-fg-light`, `text-fg-inverse`, `border-card-border`, `border-canvas-border`, plus semantic diff/status/terminal tokens) supporting automatic Light & Dark mode switching.
- **SSR Interaction Readiness**: Client-dependent interactive controls (`ToolApproval`, `ApprovalCard`, `PromptInput`) coordinate hydration readiness (`disabled={!ready}`) so server-rendered first paint never drops early user input.
- **IME-Safe Composer**: `PromptInput.svelte` guards `Enter` submission with `event.isComposing || event.keyCode === 229` so CJK/IME composition never triggers premature sends.

## Ported Component Suite

### Agent Stream Primitives (`src/lib/agents/`)
- `AgentActivity.svelte` — Collapsible Claude Code tool/thinking/search/step trace with `+additions`/`-deletions` badges.
- `TodoList.svelte` — Collapsible task checklist with animated status indicators and completion counter.
- `ToolApproval.svelte` — Permission card (`Allow once`, `Always allow`, `Deny`) with expandable `<dl>` parameter list.
- `ToolResult.svelte` — Collapsible live command output stream (`role="log"`, `aria-live="polite"`) with duration meta and copy/retry actions.
- `FileDiff.svelte` — Unified diff viewer with dual old/new line numbers, `+`/`-` counters, and copy button.
- `CodeBlock.svelte` — Code viewer with line numbers, line highlighting, and streaming/ready states.
- `ApprovalCard.svelte` — Multi-step interactive clarifying question & approval card (single-select radio, multi-select checkbox, custom write-in input).
- `StreamingResponse.svelte` & `Citations.svelte` — Response stream with expandable source citations and feedback actions.
- `Message.svelte` & `MessageScroller.svelte` — Structured conversation turns with auto-follow bottom edge (`56px` threshold) and `PreviewRail` jump navigation.
- `PromptInput.svelte` — Composer with `@worktree`/`@skill` context chips, Supported Agent selector (`Claude Code`, `Codex`, `Gemini`), and IME-safe `Enter`-to-submit.
- `ThinkingShimmer.svelte`, `AgentProgress.svelte`, `ReasoningText.svelte`, `AgentDisclosure.svelte`.

### Runtime & Workspace (`src/lib/runtime/` & `src/lib/trailside/`)
- `AgentContextMeter.svelte` — Token window progress bar with expandable source breakdown.
- `AgentCheckpoint.svelte` — Worktree commit checkpoint card with one-click restore action.
- `FileTree.svelte`, `Terminal.svelte`, `TestResults.svelte`.
- `TrailsideClaudeChat.svelte` — Flagship Trailside Claude Code dynamic chat & workbench.

## Commands

```bash
corepack pnpm check        # svelte-kit sync && svelte-check --fail-on-warnings
corepack pnpm test         # Unit tests + Svelte 5 Runes & semantic token static audit
corepack pnpm test:browser # End-to-end Playwright browser verification
corepack pnpm dev          # Start local dev server on http://127.0.0.1:5188
```
