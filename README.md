# Agents Kit Svelte (`agents-kit-svelte`)

A **Svelte 5 Runes** component collection for AI agent interfaces—porting [`agents-ui/agents-kit`](https://agents-ui.github.io/agents-kit/) to Svelte 5 and adding **AK-S Chat (`TrailsideClaudeChat`)**, **GitHub Cards & Reactive Kanban/Bento Layouts**, and a **Schema-Driven Intelligent UI Engine**.

---

## Highlights

- **74 Svelte 5 Runes Components** (`$props()`, `$state()`, `$derived()`, `$effect()`, `Spring`, `Tween`, `crossfade`, `flip`, `SvelteSet`, `SvelteMap`) across 8 collections:
  1. **beUI Agents (20)**: `TrailsideClaudeChat` (`AK-S Chat`), `AgentActivity`, `TodoList`, `ToolApproval`, `ToolResult`, `FileDiff`, `CodeBlock`, `ApprovalCard`, `PromptInput`, `Message`, `MessageBubble`, `MessageScroller`, `StreamingResponse`, `Citations`, `ImageGeneration`, `AISidebar`, `ThinkingShimmer`, `AgentProgress`, `ReasoningText`, `AgentDisclosure`.
  2. **Beautiful UI (11)**: `ToolChips`, `RecommendationCard`, `InsightCards`, `ContextCards`, `Flowchart`, `FineTuneCard`, `SearchList`, `FilterTable`, `SelectionActions`, `RecordsTable`, `DiffTable`.
  3. **GitHub Cards & Layouts (7)**: `GitHubIssueCard`, `GitHubPullRequestCard`, `GitHubCommitCard`, `GitHubChecksPanel`, `GitHubReviewThreadCard`, `GitHubBentoLayout`, `GitHubKanbanBoard`.
  4. **Intelligent UI & Generative (3)**: `IntelligentUIRenderer`, `AgentGenerativeSurface`, `ResultActions`.
  5. **Agents UI Orchestration (11)**: `AgentContextMeter`, `AgentThinkingIndicator`, `AgentTaskQueue`, `AgentCheckpoint`, `AgentToolPalette`, `AgentArtifact`, `AgentFormGenerator`, `AgentOrchestrator`, `AgentRoutingHub`, `AgentEvaluator`, `AgentSequentialWorkflow`, `AgentParallelProcessor`, `AgentOpsMonitor`.
  6. **AI Elements & Coding (13)**: `ChainOfThought`, `PlanCard`, `PromptSuggestions`, `WebPreview`, `FileTree`, `Terminal`, `TestResults`, `StackTrace`, `SchemaDisplay`, `EnvironmentVariables`, `PackageInfo`.
  7. **Agentic Skills (6)**: `SkillLibrary`, `SkillCard`, `SkillRouter`, `SkillInvocation`, `SkillEditor`, `SkillProposalCard`, plus `rankSkills`, `validateSkillManifest`, `serializeSkillManifest`, `parseSkillManifest` and `diffSkillLines` helpers. Try them together on the `/skills` studio page.
  8. **Voice & Effects (3)**: `Svelte5MotionLab`, `VoiceWaveVisualizer`, `BorderBeam`.
- **OKLCH Semantic Design Tokens**: Automatic Light & Dark theming via CSS custom properties (`bg-canvas-primary`, `bg-card-bg`, `text-fg-main`, `border-card-border`) with layered hairline elevation (`--shadow-card`, `--shadow-btn`).
- **Static GitHub Pages Ready**: Pre-configured with `@sveltejs/adapter-static`, `BASE_PATH` support, and `.github/workflows/deploy-pages.yml`.

---

## Connecting a real agent

The chat components take plain data, so you can feed them from any agent runtime. The kit ships a small data layer for that:

- **`AgentEvent`**: one event union for text and thinking deltas, tool calls and results, approvals, todos, usage and errors.
- **`AgentSession`**: a Svelte 5 runes class that folds events into reactive state (`messages`, `toolCalls`, `todos`, `usage`, `status`).
- **Selectors** that turn that state into component props: `toActivityItems`, `toApprovalParams`, `messageText`, `contextTokens`, `pendingApprovals`.
- **Adapters** for Claude: `fromClaudeAgentSdk` (Claude Agent SDK `query()` messages) and `fromMessagesStream` (Messages API streaming events). They are typed structurally, so the kit doesn't depend on either SDK.

```svelte
<script lang="ts">
  import {
    AgentActivity, TodoList, ToolApproval, AgentSession,
    fromClaudeAgentSdk, toActivityItems, toApprovalParams, pendingApprovals
  } from 'agents-kit-svelte';

  const session = new AgentSession();
  // Stream SDK messages from your server (e.g. as server-sent events), then:
  // await session.consume(fromClaudeAgentSdk(messages));
</script>

<AgentActivity items={toActivityItems(session.state)} />
<TodoList items={session.state.todos} />
{#each pendingApprovals(session.state) as call (call.id)}
  <ToolApproval
    tool={call.name}
    params={toApprovalParams(call.input)}
    onApprove={() => session.resolveApproval(call.id, true)}
    onDeny={() => session.resolveApproval(call.id, false)}
  />
{/each}
```

Approvals come from the Agent SDK's `canUseTool` callback rather than its message stream. When the SDK runs in the same process as the UI, `await session.requestApproval(toolUseID, { params })` inside that callback resolves once the user clicks. When it runs on a server, send an `approval.request` event to the browser alongside the messages, and post the user's answer back from `onApprove` / `onDeny`. For another runtime, write an adapter that yields `AgentEvent`s; see `src/lib/core/agent/adapters.ts` for the pattern.

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

Agents Kit Svelte stands on other people's work, and we want that to stay visible.

- **Agents Kit for React.** This library is a Svelte 5 port of, and is inspired by, [`agents-ui/agents-kit`](https://github.com/agents-ui/agents-kit) by Emiliano (MIT License). Its copyright and license notice is kept in [NOTICE](NOTICE).
- **Claude Code.** The warm, soft visual style is inspired by the look and feel of Claude Code by Anthropic. This is an independent project, not affiliated with or endorsed by Anthropic.
- **Lucide.** Icons come from [Lucide](https://lucide.dev) (ISC License).

### License

Licensed under the [Apache License 2.0](LICENSE). You can use, change and ship it, including commercially. If you redistribute the library or a work based on it, you must:

1. include a copy of the license,
2. keep the [NOTICE](NOTICE) file, which credits Agents Kit Svelte and the projects it builds on, and
3. say that you changed files, if you did.

A visible credit is appreciated too, for example: "UI components from [Agents Kit Svelte](https://github.com/rsynapse/agents-kit-svelte), a Svelte port of Agents Kit."
