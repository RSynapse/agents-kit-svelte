# Agents Kit Svelte (`agents-kit-svelte`)

A **Svelte 5 Runes** component collection for AI agent interfaces—porting [`agents-ui/agents-kit`](https://agents-ui.github.io/agents-kit/) to Svelte 5 and adding **AK-S Chat (`TrailsideClaudeChat`)**, **GitHub Cards & Reactive Kanban/Bento Layouts**, and a **Schema-Driven Intelligent UI Engine**.

---

## Highlights

- **68 Svelte 5 Runes Components** (`$props()`, `$state()`, `$derived()`, `$effect()`, `Spring`, `Tween`, `crossfade`, `flip`, `SvelteSet`, `SvelteMap`) across 7 collections:
  1. **beUI Agents (20)**: `TrailsideClaudeChat` (`AK-S Chat`), `AgentActivity`, `TodoList`, `ToolApproval`, `ToolResult`, `FileDiff`, `CodeBlock`, `ApprovalCard`, `PromptInput`, `Message`, `MessageBubble`, `MessageScroller`, `StreamingResponse`, `Citations`, `ImageGeneration`, `AISidebar`, `ThinkingShimmer`, `AgentProgress`, `ReasoningText`, `AgentDisclosure`.
  2. **Beautiful UI (11)**: `ToolChips`, `RecommendationCard`, `InsightCards`, `ContextCards`, `Flowchart`, `FineTuneCard`, `SearchList`, `FilterTable`, `SelectionActions`, `RecordsTable`, `DiffTable`.
  3. **GitHub Cards & Layouts (7)**: `GitHubIssueCard`, `GitHubPullRequestCard`, `GitHubCommitCard`, `GitHubChecksPanel`, `GitHubReviewThreadCard`, `GitHubBentoLayout`, `GitHubKanbanBoard`.
  4. **Intelligent UI & Generative (3)**: `IntelligentUIRenderer`, `AgentGenerativeSurface`, `ResultActions`.
  5. **Agents UI Orchestration (11)**: `AgentContextMeter`, `AgentThinkingIndicator`, `AgentTaskQueue`, `AgentCheckpoint`, `AgentToolPalette`, `AgentArtifact`, `AgentFormGenerator`, `AgentOrchestrator`, `AgentRoutingHub`, `AgentEvaluator`, `AgentSequentialWorkflow`, `AgentParallelProcessor`, `AgentOpsMonitor`.
  6. **AI Elements & Coding (13)**: `ChainOfThought`, `PlanCard`, `PromptSuggestions`, `WebPreview`, `FileTree`, `Terminal`, `TestResults`, `StackTrace`, `SchemaDisplay`, `EnvironmentVariables`, `PackageInfo`.
  7. **Voice & Effects (3)**: `Svelte5MotionLab`, `VoiceWaveVisualizer`, `BorderBeam`.
- **OKLCH Semantic Design Tokens**: Automatic Light & Dark theming via CSS custom properties (`bg-canvas-primary`, `bg-card-bg`, `text-fg-main`, `border-card-border`) with layered hairline elevation (`--shadow-card`, `--shadow-btn`).
- **Static GitHub Pages Ready**: Pre-configured with `@sveltejs/adapter-static`, `BASE_PATH` support, and `.github/workflows/deploy-pages.yml`.

---

## Local Development

```bash
corepack enable
corepack pnpm install

# Start interactive showcase dev server
corepack pnpm dev

# Run Svelte 5 type & warning checks
corepack pnpm check

# Run unit & Svelte 5 compliance tests
corepack pnpm test

# Run Playwright browser E2E suite
corepack pnpm test:browser
```

---

## Deploying to GitHub Pages (`github.io`)

1. Create a public GitHub repository (e.g. `agents-kit-svelte`):
   ```bash
   gh repo create agents-kit-svelte --public --source=. --remote=origin --push
   ```
2. Enable GitHub Pages via GitHub Actions:
   - In your repository on GitHub, open **Settings → Pages**.
   - Under **Build and deployment → Source**, select **GitHub Actions**.
3. Every push to `main` automatically runs [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), sets `BASE_PATH=/<repo-name>`, builds the static site into `./build`, and publishes to:
   `https://<your-username-or-org>.github.io/agents-kit-svelte/`

---

## Credits & License

- MIT Licensed — see [LICENSE](LICENSE).
- Inspired by and ported from [`agents-ui/agents-kit`](https://github.com/agents-ui/agents-kit) (MIT License, Copyright (c) 2026 Emiliano).
