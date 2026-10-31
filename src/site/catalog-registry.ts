export type CatalogCategory =
	| 'beUI Agents'
	| 'Beautiful UI'
	| 'GitHub Cards & Layouts'
	| 'Intelligent UI & Generative'
	| 'Agents UI Orchestration'
	| 'AI Elements & Coding'
	| 'Agentic Skills'
	| 'Voice & Effects';

export interface CatalogItemMeta {
	slug: string;
	name: string;
	category: CatalogCategory;
	sveltePath: string;
	upstreamSource: string;
	description: string;
	usageSnippet: string;
}

export const CATALOG_ITEMS: CatalogItemMeta[] = [
	// 1. beUI Agents (20 components)
	{
		slug: 'trailside-claude-chat',
		name: 'AK-S Chat (TrailsideClaudeChat)',
		category: 'beUI Agents',
		sveltePath: 'src/lib/trailside/TrailsideClaudeChat.svelte',
		upstreamSource: 'AK-S Dynamic Agentic Workbench · components/beui/components/agents/*',
		description:
			'Full multi-turn AK-S Chat workbench combining AgentActivity, TodoList, FileDiff, ToolApproval, ApprovalCard, StreamingResponse, AgentContextMeter, and PromptInput.',
		usageSnippet: `<script lang="ts">
  import { TrailsideClaudeChat } from 'agents-kit-svelte';

  let darkTheme = $state(false);
</script>

<div class="h-[720px] overflow-hidden rounded-[14px] border border-card-border">
  <TrailsideClaudeChat initialDark={darkTheme} />
</div>`
	},
	{
		slug: 'agent-activity',
		name: 'AgentActivity',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/AgentActivity.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/agent-activity',
		description:
			'Collapsible agent reasoning, tool, search, and file edit trace with +additions/-deletions counts.',
		usageSnippet: `<script lang="ts">
  import { AgentActivity, type ActivityItem } from 'agents-kit-svelte';

  const items: ActivityItem[] = [
    {
      id: 'act-1',
      type: 'text',
      label: 'Auditing SSR hydration readiness across interactive surfaces',
      status: 'complete'
    },
    {
      id: 'act-2',
      type: 'tool',
      label: 'Read',
      target: 'apps/web/src/routes/w/[workspaceSlug]/board/+page.svelte',
      status: 'complete'
    },
    {
      id: 'act-3',
      type: 'tool',
      label: 'Edit',
      target: 'apps/web/src/lib/components/CardRunDrawer.svelte',
      additions: 18,
      deletions: 4,
      status: 'complete'
    }
  ];
</script>

<AgentActivity
  {items}
  status="complete"
  durationSeconds={6}
  defaultOpen={true}
/>`
	},
	{
		slug: 'agent-disclosure',
		name: 'AgentDisclosure',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/AgentDisclosure.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/agent-disclosure.tsx',
		description:
			'Svelte 5 slide + fade collapsible disclosure primitive with inert hidden state and reduced-motion support.',
		usageSnippet: `<script lang="ts">
  import { AgentDisclosure } from 'agents-kit-svelte';

  let open = $state(true);
</script>

<div class="space-y-2">
  <button
    type="button"
    onclick={() => (open = !open)}
    class="rounded-lg border border-card-border bg-canvas-secondary px-3 py-1.5 font-mono text-xs text-fg-main"
  >
    {open ? '▼ Collapse Disclosure' : '▶ Expand Disclosure'}
  </button>

  <AgentDisclosure {open}>
    <div class="rounded-xl border border-card-border bg-canvas-secondary p-3 font-mono text-xs text-fg-main">
      Accessible Svelte 5 slide+fade disclosure panel with inert hidden state.
    </div>
  </AgentDisclosure>
</div>`
	},
	{
		slug: 'todo-list',
		name: 'TodoList',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/TodoList.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/todo-list.tsx',
		description:
			'Streaming task plan checklist with Svelte 5 Tween progress bar, animate:flip items, and completion counter.',
		usageSnippet: `<script lang="ts">
  import { TodoList, type TodoItem } from 'agents-kit-svelte';

  let items = $state<TodoItem[]>([
    { id: 't-1', label: 'Port beUI Agents & Beautiful UI to Svelte 5 Runes', status: 'completed' },
    { id: 't-2', label: 'Build GitHub Issue, PR, Commit, Checks & Kanban cards', status: 'completed' },
    { id: 't-3', label: 'Verify dynamic IntelligentUIRenderer schema engine', status: 'in-progress' },
    { id: 't-4', label: 'Run Playwright browser showcase verification', status: 'pending' }
  ]);
</script>

<TodoList
  title="Svelte 5 Port & Verification Plan"
  {items}
  defaultOpen={true}
/>`
	},
	{
		slug: 'tool-approval',
		name: 'ToolApproval',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/ToolApproval.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/tool-approval.tsx',
		description:
			'Expandable tool permission prompt with Allow once, Always allow, Deny, and structured <dl> parameters.',
		usageSnippet: `<script lang="ts">
  import { ToolApproval, type ToolApprovalParam, type ToolApprovalStatus } from 'agents-kit-svelte';

  let status = $state<ToolApprovalStatus>('pending');

  const params: ToolApprovalParam[] = [
    { label: 'cwd', value: '/Users/gregory.winkler/agents-kit-svelte', code: true },
    { label: 'timeoutMs', value: '10000', code: true }
  ];
</script>

<ToolApproval
  tool="Bash"
  summary="corepack pnpm check && corepack pnpm test"
  {params}
  {status}
  onApprove={() => (status = 'approved')}
  onAlwaysApprove={() => (status = 'approved')}
  onDeny={() => (status = 'denied')}
/>`
	},
	{
		slug: 'tool-result',
		name: 'ToolResult',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/ToolResult.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/tool-result.tsx',
		description:
			'Collapsible terminal & tool output stream with duration metadata, copy, and retry callbacks.',
		usageSnippet: `<script lang="ts">
  import { ToolResult } from 'agents-kit-svelte';

  const output = [
    '$ corepack pnpm check && corepack pnpm test',
    'svelte-check found 0 errors and 0 warnings',
    '✔ all 76 Svelte components in src/ comply with Svelte 5 Runes'
  ].join('\\n');
</script>

<ToolResult
  tool="Bash"
  summary="corepack pnpm test"
  status="success"
  meta="96ms · 9 passed"
  {output}
  defaultOpen={true}
/>`
	},
	{
		slug: 'file-diff',
		name: 'FileDiff',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/FileDiff.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/file-diff.tsx',
		description:
			'Unified diff viewer with dual old/new line numbers, +additions/-deletions badges, and copy button.',
		usageSnippet: `<script lang="ts">
  import { FileDiff } from 'agents-kit-svelte';

  const patch = \`@@ -14,4 +14,5 @@
-  let open = false;
+  let { defaultOpen = false }: Props = $props();
+  let open = $state(false);\`;
</script>

<FileDiff
  filename="src/lib/agents/AgentActivity.svelte"
  {patch}
  defaultOpen={true}
/>`
	},
	{
		slug: 'code-block',
		name: 'CodeBlock',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/CodeBlock.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/code-block.tsx',
		description:
			'Syntax-aware code block with line numbers, highlighted lines, copy action, and streaming/ready states.',
		usageSnippet: `<script lang="ts">
  import { CodeBlock } from 'agents-kit-svelte';

  const code = \`export function computeContextMeter(used: number, max: number) {
  const ratio = Math.min(1, used / Math.max(1, max));
  return { percent: Math.round(ratio * 100) };
}\`;
</script>

<CodeBlock
  filename="src/lib/state/chat-helpers.ts"
  language="typescript"
  {code}
  highlightLines={[2]}
/>`
	},
	{
		slug: 'approval-card',
		name: 'ApprovalCard',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/ApprovalCard.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/approval-card',
		description:
			'Multi-step interactive clarifying question card with radio, checkbox, and custom write-in input.',
		usageSnippet: `<script lang="ts">
  import { ApprovalCard, type ApprovalQuestion, type ApprovalCardAnswers } from 'agents-kit-svelte';

  let recorded = $state<ApprovalCardAnswers | null>(null);

  const questions: ApprovalQuestion[] = [
    {
      id: 'q-scope',
      question: 'Which validation suites should run before opening the PR?',
      options: [
        {
          id: 'all',
          label: '(Recommended) Unit + SvelteCheck + Playwright Browser',
          description: 'Full end-to-end verification across Light and Dark themes.'
        },
        {
          id: 'fast',
          label: 'Unit + SvelteCheck only',
          description: 'Fast static and unit verification.'
        }
      ],
      allowCustom: true
    }
  ];
</script>

<ApprovalCard
  title="Confirm verification scope before creating PR"
  {questions}
  onSubmit={(answers) => (recorded = answers)}
/>`
	},
	{
		slug: 'prompt-input',
		name: 'PromptInput',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/PromptInput.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/prompt-input.tsx',
		description:
			'IME-safe composer with @worktree/@skill context pills and Supported Agent switcher.',
		usageSnippet: `<script lang="ts">
  import { PromptInput, type SupportedAgentId, type SupportedAgentOption } from 'agents-kit-svelte';

  let value = $state('');
  let selectedAgentId = $state<SupportedAgentId>('claude-code');
  let lastSubmitted = $state('');

  const agents: SupportedAgentOption[] = [
    { id: 'claude-code', label: 'AK-S Agent', version: 'v0.3.0', signedIn: true },
    { id: 'codex', label: 'Codex CLI', version: 'v0.29.0', signedIn: true }
  ];
</script>

<PromptInput
  bind:value
  {agents}
  {selectedAgentId}
  onAgentChange={(id) => (selectedAgentId = id)}
  onSubmit={(text) => (lastSubmitted = text)}
/>`
	},
	{
		slug: 'message',
		name: 'Message',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/Message.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/message.tsx',
		description:
			'Turn-level conversation container with role avatar, badge, timestamp, and Svelte 5 Snippet children.',
		usageSnippet: `<script lang="ts">
  import { Message } from 'agents-kit-svelte';
</script>

<Message
  role="assistant"
  author="AK-S Agent"
  badge="Connected Computer"
  timestamp="21:18"
>
  <p class="text-sm text-fg-main">
    Verified worktree <code class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-xs">trailside/2151-drawer-hydration</code> with zero TypeScript diagnostics.
  </p>
</Message>`
	},
	{
		slug: 'message-bubble',
		name: 'MessageBubble',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/MessageBubble.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/message-bubble.tsx',
		description:
			'Composable message bubble with tint/soft/solid/dash variants, delivery status, and show-more disclosure.',
		usageSnippet: `<script lang="ts">
  import { MessageBubble } from 'agents-kit-svelte';
</script>

<div class="space-y-2">
  <MessageBubble
    variant="tint"
    align="end"
    author="gregory.winkler"
    timestamp="21:15"
    status="delivered"
    text="Port the entire agents-kit suite to Svelte 5 Runes and include GitHub card layouts."
  />
  <MessageBubble
    variant="soft"
    align="start"
    author="AK-S Agent"
    timestamp="21:16"
    collapsible={true}
    text="All 76 Svelte 5 components are live with strict TypeScript Props, OKLCH dark/light tokens, and interactive showcases."
  />
</div>`
	},
	{
		slug: 'message-scroller',
		name: 'MessageScroller',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/MessageScroller.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/message-scroller.tsx',
		description:
			'Auto-pinned conversation scroll container with interactive PreviewRail hover cards, container-scoped jump navigation, and floating Jump to latest pill.',
		usageSnippet: `<script lang="ts">
  import { MessageScroller, MessageBubble } from 'agents-kit-svelte';

  const turns = [
    { id: 'scope-q', from: 'user' as const, author: 'You', content: 'What should the first field study include?' },
    { id: 'scope-a', from: 'assistant' as const, author: 'AK-S Agent', content: 'Start with eight rider interviews and two station walkthroughs.' },
    { id: 'states-q', from: 'user' as const, author: 'You', content: 'Include wheelchair users and people traveling with luggage.' },
    { id: 'states-a', from: 'assistant' as const, author: 'AK-S Agent', content: 'Yes. Both groups encounter the same lift bottlenecks and wayfinding gaps.' }
  ];
</script>

<MessageScroller
  navigation="rail"
  followOutput={true}
  class="h-[420px] rounded-xl border border-card-border bg-card-bg"
>
  {#each turns as turn (turn.id)}
    <MessageBubble
      id={turn.id}
      variant={turn.from === 'user' ? 'solid' : 'soft'}
      align={turn.from === 'user' ? 'end' : 'start'}
      author={turn.author}
      collapsible={false}
      text={turn.content}
    />
  {/each}
</MessageScroller>`
	},
	{
		slug: 'streaming-response',
		name: 'StreamingResponse',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/StreamingResponse.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/streaming-response.tsx',
		description:
			'Streaming response wrapper with copy action, thumbs up/down feedback, and grounded source citations.',
		usageSnippet: `<script lang="ts">
  import { StreamingResponse, type CitationItem } from 'agents-kit-svelte';

  const sources: CitationItem[] = [
    {
      id: 'cit-1',
      title: 'Svelte 5 Runes Migration & Reactivity Contract',
      url: 'https://svelte.dev/docs/svelte/what-are-runes',
      domain: 'svelte.dev'
    }
  ];
</script>

<StreamingResponse
  status="complete"
  copyText="All 76 Svelte 5 components verified with 0 errors and 0 warnings."
  {sources}
>
  <p class="text-sm text-fg-main">
    All 76 Svelte 5 components verified with <code class="font-mono text-xs">svelte-check</code> (0 errors, 0 warnings).
  </p>
</StreamingResponse>`
	},
	{
		slug: 'citations',
		name: 'Citations',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/Citations.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/citations.tsx',
		description:
			'Collapsible grounded source citations list with domain badges and index markers.',
		usageSnippet: `<script lang="ts">
  import { Citations, type CitationItem } from 'agents-kit-svelte';

  const citations: CitationItem[] = [
    {
      id: 'cit-1',
      title: 'Svelte 5 Runes Migration & Reactivity Contract',
      url: 'https://svelte.dev/docs/svelte/what-are-runes',
      domain: 'svelte.dev'
    },
    {
      id: 'cit-2',
      title: 'Trailside Browser Read Contract (G0 Revision 3)',
      url: 'https://trailside.io/docs/specs/g0-browser-read-contract',
      domain: 'trailside.io'
    }
  ];
</script>

<Citations {citations} defaultOpen={true} />`
	},
	{
		slug: 'image-generation',
		name: 'ImageGeneration',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/ImageGeneration.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/image-generation.tsx',
		description:
			'Media generation surface stepping through queued, generating, refining, complete, and error states.',
		usageSnippet: `<script lang="ts">
  import { ImageGeneration } from 'agents-kit-svelte';

  let stage = $state<'queued' | 'generating' | 'refining' | 'complete' | 'error'>('complete');
</script>

<ImageGeneration
  prompt="Architectural diagram of an isolated Git worktree pipeline in dark mode"
  aspectRatio="16:9"
  initialStage={stage}
/>`
	},
	{
		slug: 'ai-sidebar',
		name: 'AISidebar',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/AISidebar.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/ai-sidebar.tsx',
		description:
			'Collapsible workspace conversation sidebar with search filter, pinned threads, and inline rename.',
		usageSnippet: `<script lang="ts">
  import { AISidebar } from 'agents-kit-svelte';

  let activeThreadId = $state('conv-1');

  const threads = [
    { id: 'conv-1', title: 'Card 2151 · Hydration readiness guard', updatedAt: '2m ago', pinned: true, unread: false },
    { id: 'conv-2', title: 'Card 2148 · Ready for You empty state', updatedAt: '18m ago', pinned: true, unread: false },
    { id: 'conv-3', title: 'GitHub Kanban Board & Bento layout', updatedAt: '1h ago', pinned: false, unread: true }
  ];
</script>

<AISidebar
  {threads}
  {activeThreadId}
  onSelect={(id) => (activeThreadId = id)}
/>`
	},
	{
		slug: 'thinking-shimmer',
		name: 'ThinkingShimmer',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/ThinkingShimmer.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/loading-states/thinking-shimmer.tsx',
		description: 'OKLCH gradient text shimmer indicator with reduced-motion fallback.',
		usageSnippet: `<script lang="ts">
  import { ThinkingShimmer } from 'agents-kit-svelte';

  let label = $state('Analyzing repository structure...');
</script>

<div class="flex items-center gap-3">
  <ThinkingShimmer {label} />
</div>`
	},
	{
		slug: 'agent-progress',
		name: 'AgentProgress',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/AgentProgress.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/loading-states/agent-progress.tsx',
		description: 'Animated 3x3 matrix activity indicator with live elapsed timer.',
		usageSnippet: `<script lang="ts">
  import { AgentProgress } from 'agents-kit-svelte';

  let elapsedSeconds = $state(14);
</script>

<AgentProgress
  label="Running Playwright suite"
  {elapsedSeconds}
/>`
	},
	{
		slug: 'reasoning-text',
		name: 'ReasoningText',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/ReasoningText.svelte',
		upstreamSource: 'beUI · components/beui/components/agents/loading-states/reasoning-text.tsx',
		description: 'Cycling status phrase indicator for long-running agent reasoning turns.',
		usageSnippet: `<script lang="ts">
  import { ReasoningText } from 'agents-kit-svelte';

  const phrases = [
    'Inspecting AST & component boundaries…',
    'Verifying Svelte 5 Runes compliance…',
    'Checking WCAG 2.2 AA contrast tokens…'
  ];
</script>

<ReasoningText {phrases} intervalMs={2200} />`
	},

	// 2. Beautiful UI (11 components)
	{
		slug: 'tool-chips',
		name: 'ToolChips',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/ToolChips.svelte',
		upstreamSource: 'Beautiful UI · components/beautiful-ui/tool-chips.tsx',
		description:
			'Compact interactive status pills for parallel tool invocations with expandable output drawer.',
		usageSnippet: `<script lang="ts">
  import { ToolChips, type ToolChipItem } from 'agents-kit-svelte';

  const chips: ToolChipItem[] = [
    { id: 'tc-1', tool: 'Read', target: 'src/lib/index.ts', duration: '12ms', status: 'success', output: 'Exported 76 Svelte 5 components.' },
    { id: 'tc-2', tool: 'Bash', target: 'pnpm check', duration: '640ms', status: 'success', output: 'svelte-check found 0 errors and 0 warnings.' },
    { id: 'tc-3', tool: 'Search', target: 'CatalogItemMeta', duration: '28ms', status: 'running', output: 'Matched 4 files in src/.' }
  ];
</script>

<ToolChips {chips} />`
	},
	{
		slug: 'recommendation-card',
		name: 'RecommendationCard',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/RecommendationCard.svelte',
		upstreamSource: 'Beautiful UI · components/beautiful-ui/recommendation-card.tsx',
		description:
			'Confidence-scored agent recommendation card with reasoning bullets and alternative actions.',
		usageSnippet: `<script lang="ts">
  import { RecommendationCard } from 'agents-kit-svelte';

  let accepted = $state(false);
</script>

<RecommendationCard
  title="Use Svelte 5 Spring + crossfade for reactive Kanban board transitions"
  confidence={96}
  summary="Eliminates layout thrashing when moving GitHub Issue cards across columns while respecting prefersReducedMotion."
  reasons={[
    'Zero external animation dependencies required',
    'Automatic interruption & velocity preservation via svelte/motion Spring',
    'WCAG 2.2 AA reduced-motion fallback built into motion.svelte.ts'
  ]}
  onAccept={() => (accepted = true)}
/>`
	},
	{
		slug: 'context-cards',
		name: 'ContextCards',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/ContextCards.svelte',
		upstreamSource: 'Beautiful UI · components/beautiful-ui/context-cards.tsx',
		description:
			'Grid of attached context sources (files, URLs, commits, issues, schemas) with token counts.',
		usageSnippet: `<script lang="ts">
  import { ContextCards, type ContextCardItem } from 'agents-kit-svelte';

  const items: ContextCardItem[] = [
    { id: 'ctx-1', kind: 'file', title: 'src/lib/state/motion.svelte.ts', subtitle: 'Svelte 5 Spring & Tween helpers', tokens: 1420, pinned: true },
    { id: 'ctx-2', kind: 'issue', title: 'Issue #2151 · CardRunDrawer hydration', subtitle: 'RSynapse/trailside · ready', tokens: 890, pinned: true },
    { id: 'ctx-3', kind: 'commit', title: 'Commit 456f3b4 · 76-card catalogue', subtitle: 'main · verified', tokens: 640 }
  ];
</script>

<ContextCards {items} />`
	},
	{
		slug: 'diff-table',
		name: 'DiffTable',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/DiffTable.svelte',
		upstreamSource: 'Beautiful UI · components/beautiful-ui/diff-table.tsx',
		description:
			'Structured key/field before-and-after comparison table for config or schema mutations.',
		usageSnippet: `<script lang="ts">
  import { DiffTable, type DiffTableRow } from 'agents-kit-svelte';

  const rows: DiffTableRow[] = [
    { field: 'framework', before: 'React 19 (useState / useMemo)', after: 'Svelte 5 ($state / $derived)', status: 'modified' },
    { field: 'motion.engine', before: 'motion/react', after: 'svelte/motion (Spring, Tween, crossfade)', status: 'modified' },
    { field: 'github.suite', before: 'none', after: '15 components (Kanban, Bento, PR, Issue, Checks, Triage, Merge queue, Deploys, Releases, Incidents)', status: 'added' }
  ];
</script>

<DiffTable
  title="Runtime & Architecture Delta"
  {rows}
/>`
	},
	{
		slug: 'records-table',
		name: 'RecordsTable',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/RecordsTable.svelte',
		upstreamSource: 'Beautiful UI · components/beautiful-ui/records-table.tsx',
		description:
			'Sortable, multi-selectable agent data table with category tags and strength badges.',
		usageSnippet: `<script lang="ts">
  import { RecordsTable } from 'agents-kit-svelte';

  let selectedIds = $state<string[]>(['rec-1', 'rec-2']);
</script>

<RecordsTable
  {selectedIds}
  onSelectionChange={(ids) => (selectedIds = ids)}
/>`
	},
	{
		slug: 'selection-actions',
		name: 'SelectionActions',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/SelectionActions.svelte',
		upstreamSource: 'Beautiful UI · components/beautiful-ui/selection-actions.tsx',
		description: 'Floating bulk-action toolbar for selected table rows or text excerpts.',
		usageSnippet: `<script lang="ts">
  import { SelectionActions } from 'agents-kit-svelte';

  let selectedCount = $state(3);
</script>

<SelectionActions
  {selectedCount}
  onClear={() => (selectedCount = 0)}
  onAction={(actionId) => console.log('Bulk action:', actionId)}
/>`
	},
	{
		slug: 'filter-table',
		name: 'FilterTable',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/FilterTable.svelte',
		upstreamSource: 'Beautiful UI · components/beautiful-ui/filter-table.tsx',
		description: 'Faceted search and tag-filterable agent evaluation table.',
		usageSnippet: `<script lang="ts">
  import { FilterTable, type FilterTableRow } from 'agents-kit-svelte';

  const rows: FilterTableRow[] = [
    { id: 'f-1', name: 'Card 2151 · Overflow menu label', agent: 'AK-S Agent', status: 'passed', duration: '18s', tags: ['a11y', 'board'] },
    { id: 'f-2', name: 'Card 2148 · Empty column note', agent: 'AK-S Agent', status: 'passed', duration: '14s', tags: ['copy', 'board'] },
    { id: 'f-3', name: 'Card 2128 · Drawer focus restore', agent: 'Codex CLI', status: 'running', duration: '9s', tags: ['a11y', 'focus'] }
  ];
</script>

<FilterTable {rows} />`
	},
	{
		slug: 'flowchart',
		name: 'Flowchart',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/Flowchart.svelte',
		upstreamSource: 'Beautiful UI · components/beautiful-ui/flowchart.tsx',
		description: 'Interactive DAG workflow flowchart with node status inspection.',
		usageSnippet: `<script lang="ts">
  import { Flowchart, type FlowchartNode } from 'agents-kit-svelte';

  const nodes: FlowchartNode[] = [
    { id: 'n-1', label: '1. Triage Issue', detail: 'Verify repro & risk tier', status: 'complete' },
    { id: 'n-2', label: '2. Worktree Run', detail: 'Write failing test & minimal fix', status: 'complete' },
    { id: 'n-3', label: '3. Referee Gate', detail: 'svelte-check + Playwright parity', status: 'running' },
    { id: 'n-4', label: '4. Ready for You', detail: 'Human merge approval', status: 'pending' }
  ];
</script>

<Flowchart
  title="Factory 1.0 Card Run Pipeline"
  {nodes}
/>`
	},
	{
		slug: 'insight-cards',
		name: 'InsightCards',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/InsightCards.svelte',
		upstreamSource: 'Beautiful UI · components/beautiful-ui/insight-cards.tsx',
		description:
			'KPI metric cards with sparkline trend bars, delta badges, and agent insight annotations.',
		usageSnippet: `<script lang="ts">
  import { InsightCards, type InsightCardItem } from 'agents-kit-svelte';

  const metrics: InsightCardItem[] = [
    { id: 'm-1', label: 'First-Attempt Referee Pass', value: '94.2%', delta: '+6.4%', trend: 'up', sparkline: [68, 74, 81, 86, 91, 94], note: 'Improved after adding SSR readiness skill' },
    { id: 'm-2', label: 'Median Worktree Run Time', value: '42s', delta: '-11s', trend: 'up', sparkline: [65, 58, 54, 49, 45, 42], note: 'Parallel svelte-check + targeted node --test' },
    { id: 'm-3', label: 'Token Budget Utilization', value: '32%', delta: '-4.1%', trend: 'neutral', sparkline: [40, 38, 36, 35, 33, 32], note: 'Compact AST symbol slices' }
  ];
</script>

<InsightCards {metrics} />`
	},
	{
		slug: 'fine-tune-card',
		name: 'FineTuneCard',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/FineTuneCard.svelte',
		upstreamSource: 'Beautiful UI · components/beautiful-ui/fine-tune-card.tsx',
		description:
			'Interactive parameter tuning card for thinking budget, temperature, risk tier, and max turns.',
		usageSnippet: `<script lang="ts">
  import { FineTuneCard, type FineTuneConfig } from 'agents-kit-svelte';

  let savedConfig = $state<FineTuneConfig | null>(null);
</script>

<FineTuneCard
  initialConfig={{
    thinkingBudgetTokens: 16000,
    temperature: 0.2,
    maxTurns: 12,
    riskTier: 'T2',
    autoRunTests: true
  }}
  onApply={(cfg) => (savedConfig = cfg)}
/>`
	},
	{
		slug: 'search-list',
		name: 'SearchList',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/SearchList.svelte',
		upstreamSource: 'Beautiful UI · components/beautiful-ui/search-list.tsx',
		description: 'Instant faceted search list across issues, files, runs, and specs.',
		usageSnippet: `<script lang="ts">
  import { SearchList, type SearchListItem } from 'agents-kit-svelte';

  const items: SearchListItem[] = [
    { id: 's-1', category: 'file', title: 'src/lib/intelligent-ui/IntelligentUIRenderer.svelte', subtitle: 'Dynamic JSON schema renderer', badge: 'Svelte 5' },
    { id: 's-2', category: 'issue', title: '#2151 · Board overflow menu accessible name', subtitle: 'RSynapse/trailside · area:app', badge: 'PR #2153' },
    { id: 's-3', category: 'spec', title: '2026-10-02-g0-browser-read-contract-design.md', subtitle: 'Section 0 (Revision 3)', badge: 'Spec' }
  ];
</script>

<SearchList {items} />`
	},

	// 3. GitHub Cards & Layouts (15 components)
	{
		slug: 'github-issue-card',
		name: 'GitHubIssueCard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubIssueCard.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Suite',
		description:
			'GitHub issue card with triage labels, risk tier, active worktree run, Spring criteria progress, and dispatch actions.',
		usageSnippet: `<script lang="ts">
  import { GitHubIssueCard, type GitHubIssueData } from 'agents-kit-svelte';

  const issue: GitHubIssueData = {
    number: 2151,
    title: 'Card drawer hydration guard prevents lost early clicks on mobile viewports',
    repo: 'RSynapse/trailside',
    state: 'in-progress',
    author: 'grok-bot',
    createdAt: '8m ago',
    labels: [
      { name: 'ready', tone: 'accent' },
      { name: 'area:app', tone: 'neutral' },
      { name: 'type:bug', tone: 'danger' }
    ],
    size: 'S',
    riskTier: 'T2',
    assignedAgent: 'AK-S Agent 0.3',
    attemptNumber: 1,
    worktreeBranch: 'trailside/2151-drawer-hydration',
    criteriaCompleted: 4,
    criteriaTotal: 4
  };
</script>

<GitHubIssueCard {issue} />`
	},
	{
		slug: 'github-pr-card',
		name: 'GitHubPullRequestCard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubPullRequestCard.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Suite',
		description:
			'GitHub pull request card with head/base branches, +add/-del stats, referee verdict, and collapsible CI checks.',
		usageSnippet: `<script lang="ts">
  import { GitHubPullRequestCard, type GitHubPullRequestData } from 'agents-kit-svelte';

  const pr: GitHubPullRequestData = {
    number: 2153,
    title: 'fix(app): guard interactive controls until client hydration completes',
    repo: 'RSynapse/trailside',
    state: 'open',
    author: 'aks-agent[bot]',
    headBranch: 'trailside/2151-drawer-hydration',
    baseBranch: 'main',
    updatedAt: '3m ago',
    additions: 46,
    deletions: 9,
    changedFilesCount: 3,
    riskTier: 'T2',
    linkedIssueNumber: 2151,
    refereeStatus: 'pass',
    checks: [
      { id: 'c-1', name: 'corepack pnpm check (svelte-check)', workflow: 'CI / Verify', status: 'passed', duration: '14s' },
      { id: 'c-2', name: 'Playwright Browser Parity (390x844 & 1440x900)', workflow: 'CI / Browser', status: 'passed', duration: '38s' }
    ]
  };
</script>

<GitHubPullRequestCard {pr} />`
	},
	{
		slug: 'github-commit-card',
		name: 'GitHubCommitCard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubCommitCard.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/commit.tsx + GitHub Suite',
		description:
			'Verified commit card with SHA copy, changed file list, and worktree checkout action.',
		usageSnippet: `<script lang="ts">
  import { GitHubCommitCard, type GitHubCommitData } from 'agents-kit-svelte';

  const commit: GitHubCommitData = {
    sha: '9f8e7d6c5b4a3210fedcba9876543210abcdef12',
    message: 'feat(agents-kit): port 76 agent & GitHub UI components to Svelte 5 Runes',
    author: 'AK-S Agent',
    branch: 'trailside/2151-drawer-hydration',
    timestamp: '2m ago',
    verified: true,
    additions: 435,
    deletions: 0,
    files: [
      { path: 'src/lib/github/GitHubKanbanBoard.svelte', status: 'added', additions: 195, deletions: 0 },
      { path: 'src/lib/intelligent-ui/IntelligentUIRenderer.svelte', status: 'added', additions: 240, deletions: 0 }
    ]
  };
</script>

<GitHubCommitCard {commit} />`
	},
	{
		slug: 'github-checks-panel',
		name: 'GitHubChecksPanel',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubChecksPanel.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Suite',
		description:
			'GitHub Actions & check suite status panel with one-click Fix with Agent action.',
		usageSnippet: `<script lang="ts">
  import { GitHubChecksPanel, type GitHubCheckItem } from 'agents-kit-svelte';

  const checks: GitHubCheckItem[] = [
    { id: 'c-1', name: 'corepack pnpm check (svelte-check)', workflow: 'CI / Verify', status: 'passed', duration: '14s' },
    { id: 'c-2', name: 'Playwright Browser Parity (390x844 & 1440x900)', workflow: 'CI / Browser', status: 'passed', duration: '38s' }
  ];
</script>

<GitHubChecksPanel {checks} />`
	},
	{
		slug: 'github-review-thread',
		name: 'GitHubReviewThreadCard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubReviewThreadCard.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Suite',
		description:
			'Inline PR code review thread with diff hunk, suggested patch application, and reply box.',
		usageSnippet: `<script lang="ts">
  import { GitHubReviewThreadCard, type GitHubReviewThreadData } from 'agents-kit-svelte';

  const thread: GitHubReviewThreadData = {
    id: 'th-1',
    filePath: 'apps/web/src/lib/components/CardRunDrawer.svelte',
    lineRange: 'L45-L49',
    resolved: false,
    diffHunk: '@@ -45,3 +45,5 @@\\n-  <button type="button" onclick={submitRun}>\\n+  <button type="button" disabled={!ready} onclick={submitRun}>',
    comments: [
      {
        id: 'rc-1',
        author: 'claude-referee',
        role: 'Referee',
        timestamp: '4m ago',
        body: 'Clean SSR readiness gate. Matches .agents/skills/ssr-interaction-readiness/SKILL.md.',
        suggestedPatch: '<button type="button" disabled={!ready} aria-busy={!ready} onclick={submitRun}>'
      }
    ]
  };
</script>

<GitHubReviewThreadCard {thread} />`
	},
	{
		slug: 'github-kanban-board',
		name: 'GitHubKanbanBoard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubKanbanBoard.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Suite',
		description:
			'4-column reactive GitHub board layout with Svelte 5 crossfade (send/receive) and animate:flip transitions.',
		usageSnippet: `<script lang="ts">
  import { GitHubKanbanBoard, type GitHubIssueData } from 'agents-kit-svelte';

  let lastDispatched = $state<number | null>(null);
</script>

<GitHubKanbanBoard
  repo="RSynapse/trailside"
  onDispatchIssue={(issueNumber) => (lastDispatched = issueNumber)}
/>`
	},
	{
		slug: 'github-bento-layout',
		name: 'GitHubBentoLayout',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubBentoLayout.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Suite',
		description:
			'Repository pulse bento layout combining active PR, issue dispatch card, CI checks panel, verified commit, and inline review thread.',
		usageSnippet: `<script lang="ts">
  import {
    GitHubBentoLayout,
    type GitHubIssueData,
    type GitHubPullRequestData
  } from 'agents-kit-svelte';

  let activeRepo = $state('RSynapse/trailside');
</script>

<GitHubBentoLayout
  repo={activeRepo}
/>`
	},
	{
		slug: 'github-lifecycle-timeline',
		name: 'GitHubLifecycleTimeline',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubLifecycleTimeline.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Lifecycle',
		description:
			'Ten-stage lifecycle stepper (issue, triage, branch, commits, PR, review, checks, merge, deploy, release) that plays itself and lets you pin any stage for details.',
		usageSnippet: `<script lang="ts">
  import { GitHubLifecycleTimeline, type GitHubLifecycleStage } from 'agents-kit-svelte';

  let pinned = $state<GitHubLifecycleStage | null>(null);
</script>

<GitHubLifecycleTimeline
  live
  onSelectStage={(stage) => (pinned = stage)}
/>`
	},
	{
		slug: 'github-issue-triage',
		name: 'GitHubIssueTriage',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubIssueTriage.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Lifecycle',
		description:
			'Issue intake card where an agent proposes type, priority, area, assignee and milestone with confidence bars, flags likely duplicates, and lets you drop suggestions before applying.',
		usageSnippet: `<script lang="ts">
  import { GitHubIssueTriage } from 'agents-kit-svelte';

  let appliedLabels = $state<string[]>([]);
</script>

<GitHubIssueTriage
  live
  onApply={(issueNumber, labels) => (appliedLabels = labels)}
  onMarkDuplicate={(issueNumber, duplicateOf) => console.log(issueNumber, duplicateOf)}
/>`
	},
	{
		slug: 'github-branch-card',
		name: 'GitHubBranchCard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubBranchCard.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Lifecycle',
		description:
			'Feature branch card with ahead/behind counts, a commit rail that fills as commits land, branch protection rules, and worktree / compare actions.',
		usageSnippet: `<script lang="ts">
  import { GitHubBranchCard } from 'agents-kit-svelte';

  let worktree = $state<string | null>(null);
</script>

<GitHubBranchCard
  live
  onOpenWorktree={(branch) => (worktree = branch)}
  onCompare={(branch, base) => console.log(base, branch)}
/>`
	},
	{
		slug: 'github-pr-review',
		name: 'GitHubPullRequestReview',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubPullRequestReview.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Lifecycle',
		description:
			'Files-changed review surface: file list with viewed checkboxes, a unified diff with inline comments, and an Approve / Comment / Request changes verdict.',
		usageSnippet: `<script lang="ts">
  import { GitHubPullRequestReview, type GitHubReviewVerdict } from 'agents-kit-svelte';

  let verdict = $state<GitHubReviewVerdict | null>(null);
</script>

<GitHubPullRequestReview
  live
  prNumber={2210}
  onSubmitReview={(prNumber, v) => (verdict = v)}
/>`
	},
	{
		slug: 'github-merge-queue',
		name: 'GitHubMergeQueue',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubMergeQueue.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Lifecycle',
		description:
			'Merge queue for a protected branch: the head group runs checks, the next is tested speculatively, merged PRs slide out with flip animations, and you can hold the queue or pull an entry.',
		usageSnippet: `<script lang="ts">
  import { GitHubMergeQueue } from 'agents-kit-svelte';

  let removed = $state<number[]>([]);
</script>

<GitHubMergeQueue
  live
  baseBranch="main"
  onRemove={(prNumber) => (removed = [...removed, prNumber])}
/>`
	},
	{
		slug: 'github-deployment-pipeline',
		name: 'GitHubDeploymentPipeline',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubDeploymentPipeline.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Lifecycle',
		description:
			'Environment promotion from Preview to Staging to Production, with a protected-environment approval gate, staged traffic rollout and one-click rollback.',
		usageSnippet: `<script lang="ts">
  import { GitHubDeploymentPipeline } from 'agents-kit-svelte';

  let lastAction = $state('');
</script>

<GitHubDeploymentPipeline
  live
  sha="9b07d3e"
  onApprove={(env) => (lastAction = \`approved \${env}\`)}
  onRollback={(env) => (lastAction = \`rolled back \${env}\`)}
/>`
	},
	{
		slug: 'github-release-card',
		name: 'GitHubReleaseCard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubReleaseCard.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Lifecycle',
		description:
			'Draft release whose notes are written from merged PRs and grouped by type, with contributors, assets, and a Latest / Pre-release publish control.',
		usageSnippet: `<script lang="ts">
  import { GitHubReleaseCard } from 'agents-kit-svelte';

  let publishedTag = $state<string | null>(null);
</script>

<GitHubReleaseCard
  live
  onPublish={(tag, prerelease) => (publishedTag = tag)}
/>`
	},
	{
		slug: 'github-incident-card',
		name: 'GitHubIncidentCard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubIncidentCard.svelte',
		upstreamSource: 'Agents Kit Svelte · GitHub Lifecycle',
		description:
			'Production incident card: a live error-rate sparkline crosses its threshold, the suspect deploy is identified, and a revert walks the incident to resolved.',
		usageSnippet: `<script lang="ts">
  import { GitHubIncidentCard } from 'agents-kit-svelte';

  let reverted = $state<number | null>(null);
</script>

<GitHubIncidentCard
  live
  onRevert={(prNumber, sha) => (reverted = prNumber)}
/>`
	},

	// 4. Intelligent UI & Generative (3 components)
	{
		slug: 'agent-generative-surface',
		name: 'AgentGenerativeSurface',
		category: 'Intelligent UI & Generative',
		sveltePath: 'src/lib/intelligent-ui/AgentGenerativeSurface.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-generative-surface.tsx',
		description:
			'Polymorphic generative surface supporting comparison, recommendation, checklist, document, source-brief, activity, and GitHub cards.',
		usageSnippet: `<script lang="ts">
  import { AgentGenerativeSurface, type GeneratedSurfaceContent } from 'agents-kit-svelte';

  const content: GeneratedSurfaceContent = {
    type: 'comparison',
    title: 'Framework Portability Evaluation',
    description: 'Generated by AK-S Agent · 96% confidence',
    selectedId: 'svelte5',
    options: [
      {
        id: 'svelte5',
        title: 'Svelte 5 Runes (agents-kit-svelte)',
        description: 'Fine-grained reactivity with zero Virtual DOM overhead and 100% OKLCH tokens.',
        recommended: true,
        attributes: [
          { label: 'Reactivity', value: '$props, $state, $derived' },
          { label: 'Theme System', value: 'OKLCH CSS variables (@theme inline)' }
        ]
      },
      {
        id: 'react',
        title: 'React Upstream',
        description: 'Original upstream reference implementation.',
        attributes: [
          { label: 'Reactivity', value: 'useState / useMemo hooks' },
          { label: 'Theme System', value: 'Tailwind utility classes' }
        ]
      }
    ]
  };
</script>

<AgentGenerativeSurface {content} />`
	},
	{
		slug: 'result-actions',
		name: 'ResultActions',
		category: 'Intelligent UI & Generative',
		sveltePath: 'src/lib/intelligent-ui/ResultActions.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/result-actions.tsx',
		description:
			'Composable action bar for generated surfaces with Expand, Edit, Compare, Save, Copy, and Markdown export.',
		usageSnippet: `<script lang="ts">
  import { ResultActions, type ResultActionState } from 'agents-kit-svelte';

  let mode = $state<ResultActionState>('view');
  let saved = $state(false);
</script>

<ResultActions
  state={mode}
  {saved}
  onExpand={() => (mode = mode === 'expanded' ? 'view' : 'expanded')}
  onEdit={() => (mode = mode === 'editing' ? 'view' : 'editing')}
  onCompare={() => (mode = mode === 'comparing' ? 'view' : 'comparing')}
  onSave={() => (saved = !saved)}
/>`
	},
	{
		slug: 'intelligent-ui-renderer',
		name: 'IntelligentUIRenderer',
		category: 'Intelligent UI & Generative',
		sveltePath: 'src/lib/intelligent-ui/IntelligentUIRenderer.svelte',
		upstreamSource: 'Agents Kit Svelte · Dynamic Intelligent UI Engine',
		description:
			'Declarative JSON-schema to Svelte 5 renderer with animate:flip and fly transitions.',
		usageSnippet: `<script lang="ts">
  import { IntelligentUIRenderer, type DynamicUINode } from 'agents-kit-svelte';

  const nodes: DynamicUINode[] = [
    {
      id: 'dyn-1',
      component: 'agent-activity',
      title: 'Dynamic Schema Node 1 · AgentActivity',
      props: {
        status: 'complete',
        durationSeconds: 4,
        defaultOpen: true,
        items: [
          { id: 'a-1', type: 'tool', label: 'Read', target: 'src/lib/index.ts', status: 'complete' }
        ]
      }
    },
    {
      id: 'dyn-2',
      component: 'todo-list',
      title: 'Dynamic Schema Node 2 · TodoList',
      props: {
        title: 'Generated Verification Plan',
        items: [
          { id: 't-1', label: 'Validate JSON schema payload', status: 'completed' },
          { id: 't-2', label: 'Mount Svelte 5 component tree', status: 'in-progress' }
        ]
      }
    }
  ];
</script>

<IntelligentUIRenderer
  {nodes}
  onIntent={(intent, payload) => console.log(intent, payload)}
/>`
	},

	// 5. Agents UI Orchestration (11 components)
	{
		slug: 'agent-orchestrator',
		name: 'AgentOrchestrator',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentOrchestrator.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-orchestrator.tsx',
		description:
			'Supervisor-to-subagent delegation graph with live handoff status and token budgets.',
		usageSnippet: `<script lang="ts">
  import { AgentOrchestrator, type SubagentWorker } from 'agents-kit-svelte';

  const workers: SubagentWorker[] = [
    { id: 'w-1', role: 'UI & Runes Porter', model: 'AK-S Agent', status: 'completed', task: 'Convert beUI & Beautiful UI to Svelte 5', tokensUsed: 18400 },
    { id: 'w-2', role: 'GitHub Suite Builder', model: 'AK-S Agent', status: 'running', task: 'Verify Kanban crossfade & Bento layout', tokensUsed: 12100 },
    { id: 'w-3', role: 'Playwright Verifier', model: 'Codex CLI', status: 'queued', task: 'Run 1440x900 & 390x844 browser checks', tokensUsed: 0 }
  ];
</script>

<AgentOrchestrator
  supervisorName="Factory 1.0 Orchestrator"
  {workers}
/>`
	},
	{
		slug: 'agent-parallel-processor',
		name: 'AgentParallelProcessor',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentParallelProcessor.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-parallel-processor.tsx',
		description:
			'Multi-lane parallel worker pool monitor for concurrent worktree, test, and search jobs.',
		usageSnippet: `<script lang="ts">
  import { AgentParallelProcessor, type ParallelJobLane } from 'agents-kit-svelte';

  const lanes: ParallelJobLane[] = [
    { id: 'l-1', name: 'Lane A · svelte-check', progress: 100, status: 'completed', durationMs: 840, output: '0 errors, 0 warnings' },
    { id: 'l-2', name: 'Lane B · Unit & Audit Suite', progress: 100, status: 'completed', durationMs: 105, output: '9/9 tests passed' },
    { id: 'l-3', name: 'Lane C · Chromium Showcase', progress: 78, status: 'running', durationMs: 3200, output: 'Capturing 76 component cards…' }
  ];
</script>

<AgentParallelProcessor {lanes} />`
	},
	{
		slug: 'agent-sequential-workflow',
		name: 'AgentSequentialWorkflow',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentSequentialWorkflow.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-sequential-workflow.tsx',
		description:
			'Step-by-step pipeline planner with gate dependencies, retry actions, and stage durations.',
		usageSnippet: `<script lang="ts">
  import { AgentSequentialWorkflow, type SequentialStage } from 'agents-kit-svelte';

  const stages: SequentialStage[] = [
    { id: 'st-1', title: '1. Reproduce & Write Failing Test', description: 'Verify issue in Chromium and add regression test', status: 'completed', duration: '1m 12s' },
    { id: 'st-2', title: '2. Implement Minimal Svelte 5 Fix', description: 'Apply semantic token & Runes patch', status: 'completed', duration: '2m 04s' },
    { id: 'st-3', title: '3. Run Verification Gates', description: 'corepack pnpm check && corepack pnpm test', status: 'active', duration: '18s' }
  ];
</script>

<AgentSequentialWorkflow {stages} />`
	},
	{
		slug: 'agent-routing-hub',
		name: 'AgentRoutingHub',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentRoutingHub.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-routing-hub.tsx',
		description:
			'Intent classifier & agent router showing confidence scores across AK-S Agent, Claude Code, Codex, and Gemini.',
		usageSnippet: `<script lang="ts">
  import { AgentRoutingHub, type RouteCandidate } from 'agents-kit-svelte';

  const candidates: RouteCandidate[] = [
    { id: 'r-1', agent: 'AK-S Agent (Svelte 5 Specialist)', confidence: 97, reason: 'Matches Svelte 5 Runes, OKLCH tokens, and UI component architecture', selected: true },
    { id: 'r-2', agent: 'Codex CLI (Test Runner)', confidence: 84, reason: 'Strong fit for unit test generation and shell verification', selected: false }
  ];
</script>

<AgentRoutingHub
  prompt="Convert agents-kit catalogue to Svelte 5 with live Preview & Source tabs"
  {candidates}
/>`
	},
	{
		slug: 'agent-evaluator',
		name: 'AgentEvaluator',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentEvaluator.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-evaluator.tsx',
		description: 'Rubric-based evaluation & red-team referee scorecard with weighted criteria.',
		usageSnippet: `<script lang="ts">
  import { AgentEvaluator, type EvaluationCriterion } from 'agents-kit-svelte';

  const criteria: EvaluationCriterion[] = [
    { id: 'c-1', name: 'Svelte 5 Runes Compliance ($props, $state, $derived)', score: 100, weight: '35%', passed: true, note: 'Zero legacy export let or $: statements across 76 files' },
    { id: 'c-2', name: 'Semantic Design System (Zero Hex Literals)', score: 100, weight: '35%', passed: true, note: 'All surfaces use bg-canvas-*, bg-card-*, text-fg-* tokens' },
    { id: 'c-3', name: 'Interactive Usage & Source Code Tabs', score: 98, weight: '30%', passed: true, note: 'Every component showcases Preview, Usage Code, and Source' }
  ];
</script>

<AgentEvaluator
  title="Referee Quality Gate Scorecard"
  {criteria}
/>`
	},
	{
		slug: 'agent-ops-monitor',
		name: 'AgentOpsMonitor',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentOpsMonitor.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-ops-monitor.tsx',
		description:
			'Live latency, token throughput, tool success rate, and Companion daemon health panel.',
		usageSnippet: `<script lang="ts">
  import { AgentOpsMonitor } from 'agents-kit-svelte';
</script>

<AgentOpsMonitor
  daemonName="studio-mac · Companion v0.3"
  uptime="14d 06h 42m"
  p95LatencyMs={184}
  toolSuccessRate={99.4}
/>`
	},
	{
		slug: 'agent-task-queue',
		name: 'AgentTaskQueue',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentTaskQueue.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-task-queue.tsx',
		description: 'Prioritized agent run queue with pause, promote, and cancel controls.',
		usageSnippet: `<script lang="ts">
  import { AgentTaskQueue, type QueuedAgentTask } from 'agents-kit-svelte';

  const tasks: QueuedAgentTask[] = [
    { id: 'q-1', title: 'Card #2151 · Board overflow menu label', priority: 'high', status: 'running', worktree: 'argon/2151-overflow-label' },
    { id: 'q-2', title: 'Card #2148 · Ready for You empty state', priority: 'normal', status: 'queued', worktree: 'argon/2148-empty-note' },
    { id: 'q-3', title: 'Card #2128 · Drawer focus restoration', priority: 'normal', status: 'completed', worktree: 'argon/2128-focus-restore' }
  ];
</script>

<AgentTaskQueue {tasks} />`
	},
	{
		slug: 'agent-artifact',
		name: 'AgentArtifact',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentArtifact.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-artifact.tsx',
		description:
			'Rich artifact viewer/editor with tabs for Preview, Markdown Source, Schema, and History.',
		usageSnippet: `<script lang="ts">
  import { AgentArtifact } from 'agents-kit-svelte';

  const markdown = [
    '# Agents Kit Svelte v0.3',
    '- 76 Svelte 5 Runes components',
    '- GitHub Kanban & Bento suite',
    '- Dynamic IntelligentUIRenderer'
  ].join('\\n');
</script>

<AgentArtifact
  title="walkthrough.md · Agents Kit Svelte v0.3"
  version="v3 · Verified"
  {markdown}
/>`
	},
	{
		slug: 'agent-form-generator',
		name: 'AgentFormGenerator',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentFormGenerator.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-form-generator.tsx',
		description:
			'Dynamic schema-to-form generator for structured agent tool inputs with live payload preview.',
		usageSnippet: `<script lang="ts">
  import { AgentFormGenerator, type GeneratedFormField } from 'agents-kit-svelte';

  let submittedPayload = $state<Record<string, unknown> | null>(null);

  const fields: GeneratedFormField[] = [
    { name: 'worktreeBranch', label: 'Worktree Branch', type: 'text', required: true, value: 'trailside/2151-drawer-hydration' },
    { name: 'riskTier', label: 'Risk Tier', type: 'select', options: ['T1', 'T2', 'T3'], value: 'T2' },
    { name: 'runPlaywright', label: 'Run Playwright Browser Suite', type: 'boolean', value: true }
  ];
</script>

<AgentFormGenerator
  title="Dispatch Card Run Configuration"
  {fields}
  onSubmit={(payload) => (submittedPayload = payload)}
/>`
	},
	{
		slug: 'agent-tool-palette',
		name: 'AgentToolPalette',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentToolPalette.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-tool-palette.tsx',
		description:
			'Interactive command & MCP tool palette with category filter and parameter preview.',
		usageSnippet: `<script lang="ts">
  import { AgentToolPalette, type ToolPaletteEntry } from 'agents-kit-svelte';

  let invokedTool = $state<string | null>(null);

  const tools: ToolPaletteEntry[] = [
    { id: 't-read', name: 'read_file', category: 'Filesystem', description: 'Read UTF-8 file slices with line bounds', riskTier: 'T1' },
    { id: 't-bash', name: 'run_command', category: 'Worktree Shell', description: 'Run verification command in isolated git worktree', riskTier: 'T2' },
    { id: 't-gh', name: 'gh_issue_view', category: 'GitHub MCP', description: 'Inspect issue labels, body, and active claims', riskTier: 'T1' }
  ];
</script>

<AgentToolPalette
  {tools}
  onInvoke={(toolName) => (invokedTool = toolName)}
/>`
	},
	{
		slug: 'agent-thinking-indicator',
		name: 'AgentThinkingIndicator',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentThinkingIndicator.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-thinking-indicator.tsx',
		description:
			'Multi-variant animated thinking indicator (wave, spin, stars, infinity, orbs).',
		usageSnippet: `<script lang="ts">
  import { AgentThinkingIndicator } from 'agents-kit-svelte';

  let variant = $state<'wave' | 'spin' | 'stars' | 'infinity' | 'orbs'>('wave');
</script>

<AgentThinkingIndicator
  initialVariant={variant}
  label="Synthesizing Svelte 5 component tree…"
/>`
	},

	// 6. AI Elements & Coding (13 components)
	{
		slug: 'agent-context-meter',
		name: 'AgentContextMeter',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/runtime/AgentContextMeter.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-context-meter.tsx',
		description:
			'Spring-animated token window usage bar with expandable source breakdown popover.',
		usageSnippet: `<script lang="ts">
  import { AgentContextMeter, type ContextSourceItem } from 'agents-kit-svelte';

  const sources: ContextSourceItem[] = [
    { id: 'sys', label: 'System & Architecture Brief', tokens: 14200, category: 'system' },
    { id: 'wt', label: 'Worktree AST & Diffs', tokens: 32000, category: 'worktree' },
    { id: 'conv', label: 'Session History', tokens: 18000, category: 'conversation' }
  ];
</script>

<AgentContextMeter
  usedTokens={64200}
  maxTokens={200000}
  {sources}
/>`
	},
	{
		slug: 'agent-checkpoint',
		name: 'AgentCheckpoint',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/runtime/AgentCheckpoint.svelte',
		upstreamSource: 'Agents Kit · components/agents-ui/agent-checkpoint.tsx',
		description:
			'Worktree git checkpoint card with commit SHA, changed file count, and restore trigger.',
		usageSnippet: `<script lang="ts">
  import { AgentCheckpoint, type CheckpointEntry } from 'agents-kit-svelte';

  const checkpoint: CheckpointEntry = {
    id: 'cp-1',
    title: 'Verified 76 Svelte 5 components + unit suite',
    description: 'All static and unit checks green',
    commitSha: '456f3b4',
    worktreeBranch: 'trailside/2151-drawer-hydration',
    timestamp: '2m ago',
    filesChanged: 12,
    restorable: true
  };
</script>

<AgentCheckpoint {checkpoint} />`
	},
	{
		slug: 'chain-of-thought',
		name: 'ChainOfThought',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/ChainOfThought.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/chain-of-thought.tsx',
		description:
			'Multi-step collapsible chain-of-thought reasoning trace with step durations and confidence.',
		usageSnippet: `<script lang="ts">
  import { ChainOfThought, type ThoughtStep } from 'agents-kit-svelte';

  const steps: ThoughtStep[] = [
    { id: 'th-1', title: 'Inspect upstream agents-kit catalogue layout', detail: 'Matched sticky left sidebar + dashed section dividers + Preview/Source tabs', durationMs: 420, status: 'complete' },
    { id: 'th-2', title: 'Generate complete Svelte 5 usage snippets', detail: 'Included $state, typed sample data, and callbacks for all 76 components', durationMs: 680, status: 'complete' }
  ];
</script>

<ChainOfThought
  summary="Reasoned across 2 architectural steps (1.1s)"
  {steps}
  defaultOpen={true}
/>`
	},
	{
		slug: 'stack-trace',
		name: 'StackTrace',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/StackTrace.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/stack-trace.tsx',
		description:
			'Interactive error stack trace viewer with highlighted source frame and Send to Agent action.',
		usageSnippet: `<script lang="ts">
  import { StackTrace } from 'agents-kit-svelte';

  let sentToAgent = $state(false);
</script>

<StackTrace
  errorName="SvelteRunesStateMutationError"
  errorMessage="state_unsafe_mutation: Updating state inside $derived.by(...) is forbidden"
  frames={[
    { file: 'src/routes/intelligent-ui/+page.svelte', line: 92, column: 5, fn: 'parsedSchema ($derived.by)', isInternal: false, snippet: 'const parsed = JSON.parse(schemaText); return { nodes: parsed, error: null };' },
    { file: 'node_modules/svelte/src/internal/client/reactivity/deriveds.js', line: 114, column: 12, fn: 'update_derived', isInternal: true }
  ]}
  onSendToAgent={() => (sentToAgent = true)}
/>`
	},
	{
		slug: 'schema-display',
		name: 'SchemaDisplay',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/SchemaDisplay.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/schema-display.tsx',
		description:
			'Interactive HTTP/Tool schema inspector with expandable nested request/response properties.',
		usageSnippet: `<script lang="ts">
  import { SchemaDisplay, type SchemaFieldNode } from 'agents-kit-svelte';

  const requestFields: SchemaFieldNode[] = [
    { name: 'issueNumber', type: 'number', required: true, description: 'GitHub issue number to dispatch' },
    { name: 'agentId', type: "'claude-code' | 'codex'", required: true, description: 'Supported Agent runtime identifier' },
    { name: 'worktreeBranch', type: 'string', required: false, description: 'Optional isolated git branch override' }
  ];
</script>

<SchemaDisplay
  method="POST"
  endpoint="/api/runs/dispatch"
  title="Dispatch Isolated Worktree Run"
  {requestFields}
/>`
	},
	{
		slug: 'environment-variables',
		name: 'EnvironmentVariables',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/EnvironmentVariables.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/environment-variables.tsx',
		description:
			'Masked .env and runtime configuration inspector with reveal toggles and scope badges.',
		usageSnippet: `<script lang="ts">
  import { EnvironmentVariables, type EnvVarEntry } from 'agents-kit-svelte';

  const variables: EnvVarEntry[] = [
    { key: 'PUBLIC_APP_URL', value: 'http://127.0.0.1:5173', scope: 'public', secret: false },
    { key: 'GITHUB_APP_ID', value: '984210', scope: 'runtime', secret: false },
    { key: 'NEON_DATABASE_URL', value: 'postgres://user:pass@ep-cool-darkness.neon.tech/neondb', scope: 'worktree', secret: true }
  ];
</script>

<EnvironmentVariables {variables} />`
	},
	{
		slug: 'package-info',
		name: 'PackageInfo',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/PackageInfo.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/package-info.tsx',
		description:
			'Package metadata card with version diff, dependencies, scripts, and verification status.',
		usageSnippet: `<script lang="ts">
  import { PackageInfo } from 'agents-kit-svelte';
</script>

<PackageInfo
  name="agents-kit-svelte"
  previousVersion="0.2.0"
  currentVersion="0.3.0"
  license="MIT"
/>`
	},
	{
		slug: 'web-preview',
		name: 'WebPreview',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/WebPreview.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/web-preview.tsx',
		description:
			'Live web preview frame with URL bar, 390px/768px/1440px viewport switcher, and console drawer.',
		usageSnippet: `<script lang="ts">
  import { WebPreview } from 'agents-kit-svelte';

  const consoleLogs = [
    '[vite] connected to http://127.0.0.1:5173',
    '[ak-s] Hydrated 76 Svelte 5 components in 14ms'
  ];
</script>

<WebPreview
  initialUrl="http://127.0.0.1:5173/github"
  title="GitHub Reactive Board & Bento Preview"
  {consoleLogs}
/>`
	},
	{
		slug: 'plan-card',
		name: 'PlanCard',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/PlanCard.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/plan.tsx',
		description:
			'Structured agent execution plan card with approval status and step dependencies.',
		usageSnippet: `<script lang="ts">
  import { PlanCard } from 'agents-kit-svelte';

  let approved = $state(false);
</script>

<PlanCard
  title="Align Showcase with agents-ui/agents-kit Gallery"
  onApprove={() => (approved = true)}
/>`
	},
	{
		slug: 'prompt-suggestions',
		name: 'PromptSuggestions',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/PromptSuggestions.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/suggestion.tsx',
		description: 'Categorized starter prompt pills with search highlighting.',
		usageSnippet: `<script lang="ts">
  import { PromptSuggestions, type PromptSuggestionItem } from 'agents-kit-svelte';

  let chosenPrompt = $state('');

  const suggestions: PromptSuggestionItem[] = [
    { id: 'ps-1', category: 'Worktree', label: 'Run svelte-check and unit tests across changed files' },
    { id: 'ps-2', category: 'GitHub', label: 'Inspect PR #2153 referee verdict and browser checks' },
    { id: 'ps-3', category: 'Schema', label: 'Generate a comparison surface for Svelte 5 Runes vs React hooks' }
  ];
</script>

<PromptSuggestions
  {suggestions}
  onSelect={(promptText) => (chosenPrompt = promptText)}
/>`
	},
	{
		slug: 'test-results',
		name: 'TestResults',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/runtime/TestResults.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/test-results.tsx',
		description:
			'Expandable test suite runner with pass/fail/skip counts and per-case durations.',
		usageSnippet: `<script lang="ts">
  import { TestResults, type SuiteGroup } from 'agents-kit-svelte';

  const suites: SuiteGroup[] = [
    {
      id: 'suite-1',
      name: 'tests/svelte5-audit.test.ts',
      status: 'passed',
      tests: [
        { id: 'tc-1', name: 'all 76 Svelte components comply with Svelte 5 Runes and semantic tokens', status: 'passed', durationMs: 6 },
        { id: 'tc-2', name: 'every component has a dedicated 1-to-1 showcase entry and usage snippet', status: 'passed', durationMs: 2 }
      ]
    }
  ];
</script>

<TestResults {suites} durationMs={105} />`
	},
	{
		slug: 'terminal',
		name: 'Terminal',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/runtime/Terminal.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/terminal.tsx',
		description: 'Worktree terminal console with copy buffer and streaming status.',
		usageSnippet: `<script lang="ts">
  import { Terminal } from 'agents-kit-svelte';

  let output = $state(
    [
      '$ corepack pnpm check && corepack pnpm test',
      'svelte-check found 0 errors and 0 warnings',
      '✔ all 76 Svelte components pass audit (105ms)'
    ].join('\\n')
  );
</script>

<Terminal
  title="~/agents-kit-svelte · zsh"
  {output}
  onClear={() => (output = '$ # Cleared')}
/>`
	},
	{
		slug: 'file-tree',
		name: 'FileTree',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/runtime/FileTree.svelte',
		upstreamSource: 'AI Elements · components/ai-elements/file-tree.tsx',
		description:
			'Accessible worktree changed-file tree with per-file +additions/-deletions.',
		usageSnippet: `<script lang="ts">
  import { FileTree, type WorktreeFileNode } from 'agents-kit-svelte';

  let selectedPath = $state('src/lib/agents');

  const nodes: WorktreeFileNode[] = [
    {
      path: 'src/lib',
      name: 'src/lib',
      kind: 'folder',
      children: [
        { path: 'src/lib/agents', name: 'agents/ (19 components)', kind: 'file', additions: 19 },
        { path: 'src/lib/beautiful', name: 'beautiful/ (11 components)', kind: 'file', additions: 11 },
        { path: 'src/lib/github', name: 'github/ (15 components)', kind: 'file', additions: 15 },
        { path: 'src/lib/intelligent-ui', name: 'intelligent-ui/ (3 components)', kind: 'file', additions: 3 }
      ]
    }
  ];
</script>

<FileTree
  {nodes}
  {selectedPath}
  onSelect={(path) => (selectedPath = path)}
/>`
	},

	// 7. Agentic Skills (6 components)
	{
		slug: 'skill-library',
		name: 'SkillLibrary',
		category: 'Agentic Skills',
		sveltePath: 'src/lib/skills/SkillLibrary.svelte',
		upstreamSource: 'Agents Kit Svelte · Agentic Skills',
		description:
			'Searchable library of installed skills with Personal, Project, Plugin and Built-in scopes, enable switches and flip-animated filtering.',
		usageSnippet: `<script lang="ts">
  import { SkillLibrary, type AgentSkill } from 'agents-kit-svelte';
  import { SAMPLE_SKILLS } from 'agents-kit-svelte/fixtures';

  let skills = $state<AgentSkill[]>(SAMPLE_SKILLS);
  let lastRun = $state<string | null>(null);
</script>

<SkillLibrary
  {skills}
  onToggle={(id, enabled) =>
    (skills = skills.map((s) => (s.id === id ? { ...s, enabled } : s)))}
  onInvoke={(skill) => (lastRun = skill.name)}
  onCreate={() => console.log('open the skill editor')}
/>`
	},
	{
		slug: 'skill-card',
		name: 'SkillCard',
		category: 'Agentic Skills',
		sveltePath: 'src/lib/skills/SkillCard.svelte',
		upstreamSource: 'Agents Kit Svelte · Agentic Skills',
		description:
			'One skill at a glance: description, trigger phrases, allowed tools, bundled files, run count and an enable switch.',
		usageSnippet: `<script lang="ts">
  import { SkillCard, type AgentSkill } from 'agents-kit-svelte';

  const skill: AgentSkill = {
    id: 'release-notes',
    name: 'release-notes',
    description: 'Drafts release notes from merged PRs. Use when asked for a changelog.',
    scope: 'project',
    version: '1.2.0',
    triggers: ['write the release notes', 'what shipped this week'],
    allowedTools: ['Bash(git log:*)', 'Read', 'Write'],
    files: [
      { path: 'SKILL.md', kind: 'skill', size: '2.1 KB' },
      { path: 'scripts/collect_prs.sh', kind: 'script', size: '840 B' }
    ],
    invocations: 37,
    lastUsedLabel: '2h ago'
  };
</script>

<SkillCard
  {skill}
  defaultFilesOpen={true}
  onToggle={(id, enabled) => console.log(id, enabled)}
  onInvoke={(s) => console.log('run', s.name)}
/>`
	},
	{
		slug: 'skill-router',
		name: 'SkillRouter',
		category: 'Agentic Skills',
		sveltePath: 'src/lib/skills/SkillRouter.svelte',
		upstreamSource: 'Agents Kit Svelte · Agentic Skills',
		description:
			'Shows which skill a request would load: ranked candidates, matched terms, a threshold marker and a tweened confidence readout.',
		usageSnippet: `<script lang="ts">
  import { SkillRouter, type SkillMatch } from 'agents-kit-svelte';
  import { SAMPLE_SKILLS } from 'agents-kit-svelte/fixtures';

  let routed = $state<SkillMatch | null>(null);
</script>

<SkillRouter
  skills={SAMPLE_SKILLS}
  prompt="Chart weekly signups by region"
  threshold={0.45}
  onRoute={(prompt, match) => (routed = match)}
/>`
	},
	{
		slug: 'skill-invocation',
		name: 'SkillInvocation',
		category: 'Agentic Skills',
		sveltePath: 'src/lib/skills/SkillInvocation.svelte',
		upstreamSource: 'Agents Kit Svelte · Agentic Skills',
		description:
			'Inline “Using skill” trace for a chat transcript, with step statuses, a tweened progress bar and an optional result snippet.',
		usageSnippet: `<script lang="ts">
  import { SkillInvocation, type SkillInvocationStep } from 'agents-kit-svelte';
  import { SAMPLE_SKILLS } from 'agents-kit-svelte/fixtures';

  let steps = $state<SkillInvocationStep[]>([
    { id: 's-1', label: 'Read SKILL.md', detail: 'release-notes · 2.1 KB', status: 'complete' },
    { id: 's-2', label: 'Run scripts/collect_prs.sh', detail: '14 PRs merged', status: 'running' },
    { id: 's-3', label: 'Write RELEASE_NOTES.md', status: 'pending' }
  ]);
</script>

<SkillInvocation skill={SAMPLE_SKILLS[0]} {steps} status="running">
  {#snippet result()}
    <p class="text-xs text-fg-light">RELEASE_NOTES.md · 42 lines</p>
  {/snippet}
</SkillInvocation>`
	},
	{
		slug: 'skill-editor',
		name: 'SkillEditor',
		category: 'Agentic Skills',
		sveltePath: 'src/lib/skills/SkillEditor.svelte',
		upstreamSource: 'Agents Kit Svelte · Agentic Skills',
		description:
			'Author a SKILL.md: name, description, allowed tools and instructions, with a live file preview and frontmatter checks.',
		usageSnippet: `<script lang="ts">
  import { SkillEditor, type SkillManifest } from 'agents-kit-svelte';

  const manifest: SkillManifest = {
    name: 'incident-review',
    description: 'Builds a blameless incident timeline. Use after an outage.',
    allowedTools: ['Read', 'Grep'],
    body: '# Incident review\\n\\n1. Collect logs and chat.\\n2. Build the timeline.'
  };
</script>

<SkillEditor
  {manifest}
  title="New skill"
  onSave={(next, skillMd) => console.log(skillMd)}
/>`
	},
	{
		slug: 'skill-proposal-card',
		name: 'SkillProposalCard',
		category: 'Agentic Skills',
		sveltePath: 'src/lib/skills/SkillProposalCard.svelte',
		upstreamSource: 'Agents Kit Svelte · Agentic Skills',
		description:
			'Review card for a skill the agent suggests saving, or an update to one, with the evidence, a line diff of SKILL.md and Save or Not now.',
		usageSnippet: `<script lang="ts">
  import { SkillProposalCard, type SkillProposal } from 'agents-kit-svelte';
  import { SAMPLE_SKILL_PROPOSAL } from 'agents-kit-svelte/fixtures';

  const proposal: SkillProposal = SAMPLE_SKILL_PROPOSAL;
  let saved = $state(false);
</script>

<SkillProposalCard
  {proposal}
  onSave={() => (saved = true)}
  onDismiss={() => (saved = false)}
/>`
	},

	// 8. Voice & Effects (3 components)
	{
		slug: 'voice-wave-visualizer',
		name: 'VoiceWaveVisualizer',
		category: 'Voice & Effects',
		sveltePath: 'src/lib/ai-elements/VoiceWaveVisualizer.svelte',
		upstreamSource: 'Voice Agents · components/voice-agents/session.tsx',
		description:
			'Interactive voice session & 24-bar audio waveform visualizer with mic selector and live transcript.',
		usageSnippet: `<script lang="ts">
  import { VoiceWaveVisualizer } from 'agents-kit-svelte';

  let state = $state<'idle' | 'listening' | 'thinking' | 'speaking'>('speaking');
</script>

<VoiceWaveVisualizer
  agentName="AK-S Voice Companion"
  initialState={state}
/>`
	},
	{
		slug: 'border-beam',
		name: 'BorderBeam',
		category: 'Voice & Effects',
		sveltePath: 'src/lib/effects/BorderBeam.svelte',
		upstreamSource: 'Effects · components/effects/border-beam.tsx',
		description: 'Animated active-work border beam treatment for running agent cards and composers.',
		usageSnippet: `<script lang="ts">
  import { BorderBeam, PromptInput } from 'agents-kit-svelte';

  let active = $state(true);
</script>

<BorderBeam
  {active}
  label="Active AK-S Worktree Run"
  subtitle="Compositor-safe border beam with prefers-reduced-motion fallback"
/>`
	},
	{
		slug: 'svelte5-motion-lab',
		name: 'Svelte5MotionLab',
		category: 'Voice & Effects',
		sveltePath: 'src/lib/effects/Svelte5MotionLab.svelte',
		upstreamSource: 'Agents Kit Svelte · Svelte 5 Motion, Crossfade & Reactivity Suite',
		description:
			'Interactive Svelte 5 physics & microanimation playground showcasing Spring, Tween, crossfade (send/receive), animate:flip, SvelteSet, SvelteMap, and {#snippet}.',
		usageSnippet: `<script lang="ts">
  import {
    Svelte5MotionLab,
    ReactiveSpringMetric,
    ReactiveTweenProgress,
    createBoardCrossfade,
    pressScale,
    magneticHover
  } from 'agents-kit-svelte';

  const confidenceSpring = new ReactiveSpringMetric(92);
  const progressTween = new ReactiveTweenProgress(75);
  const [send, receive] = createBoardCrossfade();
</script>

<Svelte5MotionLab />`
	}
];
