# agents-kit-svelte

Complete open-source **Svelte 5 Runes** port of [`agents-ui/agents-kit`](https://agents-ui.github.io/agents-kit/), extended with **Trailside's GitHub Card & Layout Suite** and a **Dynamic Intelligent UI & Schema Renderer Engine**.

## Highlights

- **67 Svelte 5 Components** across 7 families (`beUI Agents`, `Beautiful UI`, `GitHub Cards & Layouts`, `Intelligent UI & Generative`, `Agents UI Orchestration`, `AI Elements & Runtime Coding`, `Voice & Effects`).
- **100% Svelte 5 Runes**: Built exclusively with `$props()`, `$state()`, `$derived()`, and `$effect()`. Zero legacy `export let` or `$:` statements.
- **100% Semantic OKLCH Token System**: Powered by Tailwind CSS v4 `@theme inline` (`src/app.css`) with automatic Light & Dark mode variables (`bg-canvas-primary`, `bg-canvas-secondary`, `bg-card-bg`, `text-fg-main`, `text-fg-light`, `text-fg-inverse`, `border-card-border`, `border-canvas-border`).
- **SSR Hydration Readiness**: Interactive controls guard against lost early clicks before client hydration completes.
- **4-Route Interactive Showcase Website**:
  - `/` — **Component Catalogue & App Showcase Hub** (all 67 components rendered live with category filters, search, and copyable Svelte 5 usage snippets)
  - `/claude-code` — **Trailside Claude Code Workbench** (multi-turn Claude Code chat with inline tool traces, unified diffs, bash approvals, clarifying questions, and worktree context meter)
  - `/github` — **GitHub Cards, Bento Repository Pulse & Reactive Kanban Board** (`GitHubKanbanBoard`, `GitHubBentoLayout`, `GitHubIssueCard`, `GitHubPullRequestCard`, `GitHubCommitCard`, `GitHubChecksPanel`, `GitHubReviewThreadCard`)
  - `/intelligent-ui` — **Dynamic Intelligent UI & Generative Surface Engine** (`IntelligentUIRenderer` declarative JSON-schema-to-Svelte-5 engine + polymorphic `AgentGenerativeSurface` & `ResultActions`)

## Quick Start

```bash
cd /Users/gregory.winkler/agents-kit-svelte
corepack pnpm install
corepack pnpm dev
```

## Verification Suite

```bash
corepack pnpm check        # svelte-check (0 errors, 0 warnings across 67 components)
corepack pnpm test         # Pure state unit tests + static Svelte 5 Runes & semantic token audit
corepack pnpm test:browser # Playwright E2E browser verification across /, /claude-code, /github, /intelligent-ui
```
