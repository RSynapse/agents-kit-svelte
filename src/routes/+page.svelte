<script lang="ts">
	import {
		AISidebar,
		AgentActivity,
		AgentArtifact,
		AgentCheckpoint,
		AgentContextMeter,
		AgentEvaluator,
		AgentFormGenerator,
		AgentGenerativeSurface,
		AgentOpsMonitor,
		AgentOrchestrator,
		AgentParallelProcessor,
		AgentProgress,
		AgentRoutingHub,
		AgentSequentialWorkflow,
		AgentTaskQueue,
		AgentThinkingIndicator,
		AgentToolPalette,
		ApprovalCard,
		BorderBeam,
		CATALOG_ITEMS,
		ChainOfThought,
		Citations,
		CodeBlock,
		ContextCards,
		DiffTable,
		EnvironmentVariables,
		FileDiff,
		FileTree,
		FilterTable,
		FineTuneCard,
		Flowchart,
		GitHubBentoLayout,
		GitHubChecksPanel,
		GitHubCommitCard,
		GitHubIssueCard,
		GitHubKanbanBoard,
		GitHubPullRequestCard,
		GitHubReviewThreadCard,
		ImageGeneration,
		InsightCards,
		IntelligentUIRenderer,
		MessageBubble,
		PackageInfo,
		PlanCard,
		PromptInput,
		PromptSuggestions,
		ReasoningText,
		RecommendationCard,
		RecordsTable,
		SchemaDisplay,
		SearchList,
		SelectionActions,
		StackTrace,
		Terminal,
		TestResults,
		ThinkingShimmer,
		TodoList,
		ToolApproval,
		ToolChips,
		ToolResult,
		VoiceWaveVisualizer,
		WebPreview
	} from '$lib';
	import type {
		ActivityItem,
		ApprovalQuestion,
		CatalogCategory,
		CheckpointEntry,
		CitationItem,
		DynamicUINode,
		GeneratedSurfaceContent,
		GitHubCheckItem,
		GitHubCommitData,
		GitHubIssueData,
		GitHubPullRequestData,
		GitHubReviewThreadData,
		SupportedAgentOption,
		TodoItem,
		ToolApprovalParam
	} from '$lib';

	const CATEGORIES: ('All' | CatalogCategory)[] = [
		'All',
		'beUI Agents',
		'Beautiful UI',
		'GitHub Cards & Layouts',
		'Intelligent UI & Generative',
		'Agents UI Orchestration',
		'AI Elements & Coding',
		'Voice & Effects'
	];

	interface Props {
		data?: Record<string, unknown>;
	}

	let { data: _data = {} }: Props = $props();

	let selectedCategory = $state<'All' | CatalogCategory>('All');
	let searchQuery = $state('');
	let codeViewSlugs = $state<Record<string, boolean>>({});
	let copiedSlug = $state<string | null>(null);
	let selectedRecordIds = $state<string[]>(['rec-1', 'rec-2']);
	let ready = $state(false);

	$effect(() => {
		ready = true;
	});

	let filteredCatalog = $derived.by(() => {
		return CATALOG_ITEMS.filter((item) => {
			const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
			const q = searchQuery.trim().toLowerCase();
			if (!q) return matchesCategory;
			return (
				matchesCategory &&
				(item.name.toLowerCase().includes(q) ||
					item.description.toLowerCase().includes(q) ||
					item.sveltePath.toLowerCase().includes(q))
			);
		});
	});

	// Sample fixtures for components that take required props
	const sampleActivity: ActivityItem[] = [
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

	const sampleTodos: TodoItem[] = [
		{ id: 't-1', label: 'Port beUI Agents & Beautiful UI to Svelte 5 Runes', status: 'completed' },
		{ id: 't-2', label: 'Build GitHub Issue, PR, Commit, Checks & Kanban cards', status: 'completed' },
		{ id: 't-3', label: 'Verify dynamic IntelligentUIRenderer schema engine', status: 'in-progress' },
		{ id: 't-4', label: 'Run Playwright browser showcase verification', status: 'pending' }
	];

	const sampleToolParams: ToolApprovalParam[] = [
		{ label: 'cwd', value: '/Users/gregory.winkler/agents-kit-svelte', code: true },
		{ label: 'timeoutMs', value: '10000', code: true }
	];

	const sampleQuestions: ApprovalQuestion[] = [
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
			]
		}
	];

	const sampleAgents: SupportedAgentOption[] = [
		{ id: 'claude-code', label: 'Claude Code', version: '1.0.44', signedIn: true },
		{ id: 'codex', label: 'Codex CLI', version: '0.29.0', signedIn: true }
	];

	const sampleCitations: CitationItem[] = [
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

	const sampleDiff = `@@ -14,4 +14,5 @@
-  let open = false;
+  let { defaultOpen = false }: Props = $props();
+  let open = $state(false);`;

	const sampleCode = `export function computeContextMeter(used: number, max: number) {
  const ratio = Math.min(1, used / Math.max(1, max));
  return { percent: Math.round(ratio * 100) };
}`;

	const sampleIssue: GitHubIssueData = {
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
		assignedAgent: 'Claude Code 1.0.44',
		attemptNumber: 1,
		worktreeBranch: 'trailside/2151-drawer-hydration',
		criteriaCompleted: 4,
		criteriaTotal: 4
	};

	const sampleChecks: GitHubCheckItem[] = [
		{
			id: 'c-1',
			name: 'corepack pnpm check (svelte-check)',
			workflow: 'CI / Verify',
			status: 'passed',
			duration: '14s'
		},
		{
			id: 'c-2',
			name: 'Playwright Browser Parity (390x844 & 1440x900)',
			workflow: 'CI / Browser',
			status: 'passed',
			duration: '38s'
		}
	];

	const samplePR: GitHubPullRequestData = {
		number: 2153,
		title: 'fix(app): guard interactive controls until client hydration completes',
		repo: 'RSynapse/trailside',
		state: 'open',
		author: 'claude-code[bot]',
		headBranch: 'trailside/2151-drawer-hydration',
		baseBranch: 'main',
		updatedAt: '3m ago',
		additions: 46,
		deletions: 9,
		changedFilesCount: 3,
		riskTier: 'T2',
		linkedIssueNumber: 2151,
		refereeStatus: 'pass',
		checks: sampleChecks
	};

	const sampleCommit: GitHubCommitData = {
		sha: '9f8e7d6c5b4a3210fedcba9876543210abcdef12',
		message: 'feat(agents-kit): port 67 agent & GitHub UI components to Svelte 5 Runes',
		author: 'Claude Code',
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

	const sampleThread: GitHubReviewThreadData = {
		id: 'th-1',
		filePath: 'apps/web/src/lib/components/CardRunDrawer.svelte',
		lineRange: 'L45-L49',
		resolved: false,
		diffHunk: `@@ -45,3 +45,5 @@\n-  <button type="button" onclick={submitRun}>\n+  <button type="button" disabled={!ready} onclick={submitRun}>`,
		comments: [
			{
				id: 'rc-1',
				author: 'claude-referee',
				role: 'Referee',
				timestamp: '4m ago',
				body: 'Clean SSR readiness gate. Matches .agents/skills/ssr-interaction-readiness/SKILL.md.',
				suggestedPatch: `<button type="button" disabled={!ready} aria-busy={!ready} onclick={submitRun}>`
			}
		]
	};

	const sampleSurfaceContent: GeneratedSurfaceContent = {
		type: 'comparison',
		title: 'Framework Portability Evaluation',
		description: 'Generated by Claude Code · 96% confidence',
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

	const sampleDynamicNodes: DynamicUINode[] = [
		{
			id: 'dyn-1',
			component: 'agent-activity',
			title: 'Dynamic Schema Node 1 · AgentActivity',
			props: {
				items: sampleActivity,
				status: 'complete',
				durationSeconds: 4,
				defaultOpen: true
			}
		},
		{
			id: 'dyn-2',
			component: 'github-pr-card',
			title: 'Dynamic Schema Node 2 · GitHubPullRequestCard',
			props: {
				pr: samplePR
			}
		}
	];

	const sampleCheckpoint: CheckpointEntry = {
		id: 'cp-1',
		title: 'Verified 67 Svelte 5 components + unit suite',
		description: 'All static and unit checks green',
		commitSha: '9f8e7d6',
		worktreeBranch: 'trailside/2151-drawer-hydration',
		timestamp: '2m ago',
		filesChanged: 12,
		restorable: true
	};

	const sampleTestSuites = [
		{
			id: 'suite-1',
			name: 'tests/svelte5-audit.test.ts',
			status: 'passed' as const,
			tests: [
				{
					id: 'tc-1',
					name: 'all 67 Svelte components comply with Svelte 5 Runes and semantic tokens',
					status: 'passed' as const,
					durationMs: 6
				}
			]
		}
	];

	const sampleTerminalOutput = `$ corepack pnpm check && corepack pnpm test
svelte-check found 0 errors and 0 warnings
✔ all 67 Svelte components pass audit (96ms)`;

	const sampleFileTree = [
		{
			path: 'src/lib',
			name: 'src/lib',
			kind: 'folder' as const,
			children: [
				{ path: 'src/lib/agents', name: 'agents/ (19 components)', kind: 'file' as const, additions: 19 },
				{ path: 'src/lib/beautiful', name: 'beautiful/ (11 components)', kind: 'file' as const, additions: 11 },
				{ path: 'src/lib/github', name: 'github/ (7 components)', kind: 'file' as const, additions: 7 },
				{ path: 'src/lib/intelligent-ui', name: 'intelligent-ui/ (3 components)', kind: 'file' as const, additions: 3 },
				{ path: 'src/lib/agents-ui', name: 'agents-ui/ (11 components)', kind: 'file' as const, additions: 11 },
				{ path: 'src/lib/ai-elements', name: 'ai-elements/ & runtime/ (15 components)', kind: 'file' as const, additions: 15 }
			]
		}
	];

	/**
	 * Toggles the code snippet drawer for a catalog item.
	 */
	function toggleCodeView(slug: string): void {
		codeViewSlugs = {
			...codeViewSlugs,
			[slug]: !codeViewSlugs[slug]
		};
	}

	/**
	 * Copies the Svelte 5 usage snippet for a catalog item.
	 */
	function copySnippet(slug: string, snippet: string): void {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(snippet).catch(() => {});
		}
		copiedSlug = slug;
		window.setTimeout(() => {
			if (copiedSlug === slug) copiedSlug = null;
		}, 1500);
	}
</script>

<svelte:head>
	<title>agents-kit-svelte · 67 Svelte 5 Agent, GitHub & Intelligent UI Components</title>
</svelte:head>

<div class="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
	<!-- Hero Section & Interactive Showcase Launchers -->
	<section class="mb-8 rounded-2xl border border-card-border bg-card-bg p-6 shadow-xs">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div class="max-w-3xl">
				<div class="flex flex-wrap items-center gap-2">
					<span class="rounded-full bg-accent-subtle px-2.5 py-0.5 font-mono text-xs font-semibold text-accent-primary">
						Open-Source Svelte 5 Port
					</span>
					<span class="rounded-full bg-status-success-subtle px-2.5 py-0.5 font-mono text-xs font-medium text-status-success">
						67 Components · 100% Svelte 5 Runes · OKLCH Tokens
					</span>
				</div>
				<h1 class="mt-2 text-2xl font-semibold tracking-tight text-fg-main sm:text-3xl">
					agents-kit-svelte: Dynamic Agentic, GitHub &amp; Intelligent UI Kit
				</h1>
				<p class="mt-2 text-sm leading-relaxed text-fg-light">
					Complete Svelte 5 Runes port of <code class="font-mono text-fg-main">agents-ui/agents-kit</code> plus Trailside’s GitHub Card &amp; Kanban suite and schema-driven <code class="font-mono text-fg-main">IntelligentUIRenderer</code>. Every component below is live, interactive, and theme-adaptive.
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<a
					href="/claude-code"
					class="rounded-xl bg-accent-primary px-4 py-2 text-xs font-semibold text-fg-inverse transition-opacity hover:opacity-90"
				>
					Launch Claude Code Workbench →
				</a>
				<a
					href="/github"
					class="rounded-xl border border-card-border bg-canvas-primary px-4 py-2 text-xs font-semibold text-fg-main transition-colors hover:bg-canvas-secondary"
				>
					Explore GitHub Suite →
				</a>
				<a
					href="/intelligent-ui"
					class="rounded-xl border border-card-border bg-canvas-primary px-4 py-2 text-xs font-semibold text-fg-main transition-colors hover:bg-canvas-secondary"
				>
					Intelligent UI Playground →
				</a>
			</div>
		</div>

		<!-- 3 Interactive Experience Cards -->
		<div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
			<a
				href="/claude-code"
				class="group flex flex-col justify-between rounded-xl border border-card-border bg-canvas-primary p-4 transition-colors hover:border-accent-primary"
			>
				<div>
					<div class="flex items-center justify-between">
						<span class="font-mono text-xs font-semibold text-accent-primary">01 · WORKBENCH</span>
						<span class="font-mono text-xs text-fg-light group-hover:text-accent-primary">→</span>
					</div>
					<h2 class="mt-1 text-base font-semibold text-fg-main">Trailside Claude Code Chat</h2>
					<p class="mt-1 text-xs text-fg-light">
						Interactive multi-turn Claude Code session with collapsible tool traces, inline unified diffs, bash permissions, and worktree context meter.
					</p>
				</div>
				<div class="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px] text-fg-light">
					<span class="rounded bg-canvas-secondary px-2 py-0.5">AgentActivity</span>
					<span class="rounded bg-canvas-secondary px-2 py-0.5">ToolApproval</span>
					<span class="rounded bg-canvas-secondary px-2 py-0.5">FileDiff</span>
				</div>
			</a>

			<a
				href="/github"
				class="group flex flex-col justify-between rounded-xl border border-card-border bg-canvas-primary p-4 transition-colors hover:border-accent-primary"
			>
				<div>
					<div class="flex items-center justify-between">
						<span class="font-mono text-xs font-semibold text-status-info">02 · GITHUB SUITE</span>
						<span class="font-mono text-xs text-fg-light group-hover:text-accent-primary">→</span>
					</div>
					<h2 class="mt-1 text-base font-semibold text-fg-main">GitHub Cards, Bento &amp; Kanban</h2>
					<p class="mt-1 text-xs text-fg-light">
						Reactive 4-column GitHub board, issue run dispatch cards, PR referee cards, CI check suites, verified commits, and review threads.
					</p>
				</div>
				<div class="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px] text-fg-light">
					<span class="rounded bg-canvas-secondary px-2 py-0.5">GitHubKanbanBoard</span>
					<span class="rounded bg-canvas-secondary px-2 py-0.5">GitHubBentoLayout</span>
					<span class="rounded bg-canvas-secondary px-2 py-0.5">GitHubPullRequestCard</span>
				</div>
			</a>

			<a
				href="/intelligent-ui"
				class="group flex flex-col justify-between rounded-xl border border-card-border bg-canvas-primary p-4 transition-colors hover:border-accent-primary"
			>
				<div>
					<div class="flex items-center justify-between">
						<span class="font-mono text-xs font-semibold text-status-success">03 · INTELLIGENT UI</span>
						<span class="font-mono text-xs text-fg-light group-hover:text-accent-primary">→</span>
					</div>
					<h2 class="mt-1 text-base font-semibold text-fg-main">Dynamic Generative UI Engine</h2>
					<p class="mt-1 text-xs text-fg-light">
						Declarative JSON-schema to Svelte 5 renderer plus polymorphic generative surfaces with inline Edit, Compare, and Markdown export.
					</p>
				</div>
				<div class="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px] text-fg-light">
					<span class="rounded bg-canvas-secondary px-2 py-0.5">IntelligentUIRenderer</span>
					<span class="rounded bg-canvas-secondary px-2 py-0.5">AgentGenerativeSurface</span>
					<span class="rounded bg-canvas-secondary px-2 py-0.5">ResultActions</span>
				</div>
			</a>
		</div>
	</section>

	<!-- Filter & Search Bar -->
	<section class="mb-6 flex flex-col gap-3 rounded-2xl border border-card-border bg-card-bg p-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Component category filter">
			{#each CATEGORIES as category (category)}
				{@const count =
					category === 'All'
						? CATALOG_ITEMS.length
						: CATALOG_ITEMS.filter((i) => i.category === category).length}
				<button
					type="button"
					role="tab"
					disabled={!ready}
					aria-selected={selectedCategory === category}
					onclick={() => (selectedCategory = category)}
					class="rounded-xl px-3 py-1.5 text-xs font-medium transition-colors {selectedCategory ===
					category
						? 'bg-accent-primary text-fg-inverse'
						: 'bg-canvas-secondary text-fg-light hover:text-fg-main'}"
				>
					{category}
					<span class="ml-1 font-mono text-[11px] opacity-80">({count})</span>
				</button>
			{/each}
		</div>

		<div class="flex items-center gap-2">
			<input
				type="search"
				aria-label="Search components"
				placeholder="Search 67 components (e.g. Kanban, Diff, Orchestrator)..."
				bind:value={searchQuery}
				class="w-full rounded-xl border border-card-border bg-canvas-primary px-3.5 py-2 text-xs text-fg-main outline-none focus:border-accent-primary sm:w-80"
			/>
		</div>
	</section>

	<!-- Live Component Catalogue Grid -->
	<div class="space-y-6">
		{#each filteredCatalog as item (item.slug)}
			{@const showCode = Boolean(codeViewSlugs[item.slug])}
			<article
				id={item.slug}
				data-component-slug={item.slug}
				class="overflow-hidden rounded-2xl border border-card-border bg-card-bg shadow-xs"
			>
				<!-- Component Showcase Header -->
				<header class="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-border bg-canvas-secondary px-5 py-3.5">
					<div>
						<div class="flex flex-wrap items-center gap-2">
							<h2 class="font-mono text-sm font-semibold text-fg-main">{item.name}</h2>
							<span class="rounded-full bg-accent-subtle px-2.5 py-0.5 font-mono text-[11px] font-medium text-accent-primary">
								{item.category}
							</span>
							<span class="font-mono text-[11px] text-fg-light">{item.sveltePath}</span>
						</div>
						<p class="mt-0.5 text-xs text-fg-light">{item.description}</p>
					</div>

					<div class="flex items-center gap-2">
						<button
							type="button"
							disabled={!ready}
							aria-pressed={showCode}
							onclick={() => toggleCodeView(item.slug)}
							class="rounded-lg border border-card-border bg-canvas-primary px-3 py-1.5 font-mono text-xs font-medium text-fg-main transition-colors hover:bg-canvas-secondary"
						>
							{showCode ? '◀ Live Preview' : '</> Svelte 5 Code'}
						</button>
						<button
							type="button"
							disabled={!ready}
							onclick={() => copySnippet(item.slug, item.usageSnippet)}
							class="rounded-lg border border-card-border bg-canvas-primary px-3 py-1.5 font-mono text-xs font-medium text-fg-light transition-colors hover:text-fg-main"
						>
							{copiedSlug === item.slug ? '✓ Copied' : 'Copy snippet'}
						</button>
					</div>
				</header>

				<!-- Live Component Body or Code View -->
				<div class="p-5">
					{#if showCode}
						<CodeBlock
							filename="{item.slug}.svelte"
							language="svelte"
							code={item.usageSnippet}
						/>
					{:else if item.slug === 'agent-activity'}
						<AgentActivity
							items={sampleActivity}
							status="complete"
							durationSeconds={6}
							defaultOpen={true}
						/>
					{:else if item.slug === 'todo-list'}
						<TodoList title="Svelte 5 Port & Verification Plan" items={sampleTodos} defaultOpen={true} />
					{:else if item.slug === 'tool-approval'}
						<ToolApproval
							tool="Bash"
							summary="corepack pnpm check && corepack pnpm test"
							params={sampleToolParams}
						/>
					{:else if item.slug === 'tool-result'}
						<ToolResult
							tool="Bash"
							summary="corepack pnpm test"
							status="success"
							meta="96ms · 7 passed"
							output="✔ all Svelte components in src/ comply with Svelte 5 Runes, Props typing, and semantic token rules"
							defaultOpen={true}
						/>
					{:else if item.slug === 'file-diff'}
						<FileDiff
							filename="src/lib/agents/AgentActivity.svelte"
							patch={sampleDiff}
						/>
					{:else if item.slug === 'code-block'}
						<CodeBlock
							filename="src/lib/state/chat-helpers.ts"
							language="typescript"
							code={sampleCode}
							highlightLines={[2]}
						/>
					{:else if item.slug === 'approval-card'}
						<ApprovalCard
							title="Confirm verification scope before creating PR"
							questions={sampleQuestions}
						/>
					{:else if item.slug === 'prompt-input'}
						<PromptInput
							agents={sampleAgents}
							selectedAgentId="claude-code"
						/>
					{:else if item.slug === 'message-bubble'}
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
								author="Claude Code"
								timestamp="21:16"
								collapsible={true}
								text="All 67 Svelte 5 components are live with strict TypeScript Props, OKLCH dark/light tokens, and interactive showcases."
							/>
						</div>
					{:else if item.slug === 'citations'}
						<Citations citations={sampleCitations} defaultOpen={true} />
					{:else if item.slug === 'image-generation'}
						<ImageGeneration />
					{:else if item.slug === 'ai-sidebar'}
						<AISidebar />
					{:else if item.slug === 'loading-states'}
						<div class="flex flex-wrap items-center gap-4">
							<ThinkingShimmer label="Analyzing repository structure..." />
							<AgentProgress label="Running Playwright suite" elapsedSeconds={14} />
							<ReasoningText />
						</div>
					{:else if item.slug === 'tool-chips'}
						<ToolChips />
					{:else if item.slug === 'recommendation-card'}
						<RecommendationCard />
					{:else if item.slug === 'context-cards'}
						<ContextCards />
					{:else if item.slug === 'diff-table'}
						<DiffTable />
					{:else if item.slug === 'records-table'}
						<div class="space-y-3">
							<SelectionActions
								selectedCount={selectedRecordIds.length}
								onClear={() => (selectedRecordIds = [])}
							/>
							<RecordsTable
								selectedIds={selectedRecordIds}
								onSelectionChange={(ids) => (selectedRecordIds = ids)}
							/>
						</div>
					{:else if item.slug === 'filter-table'}
						<FilterTable />
					{:else if item.slug === 'flowchart'}
						<Flowchart />
					{:else if item.slug === 'insight-cards'}
						<InsightCards />
					{:else if item.slug === 'fine-tune-card'}
						<FineTuneCard />
					{:else if item.slug === 'search-list'}
						<SearchList />
					{:else if item.slug === 'github-issue-card'}
						<GitHubIssueCard issue={sampleIssue} />
					{:else if item.slug === 'github-pr-card'}
						<GitHubPullRequestCard pr={samplePR} />
					{:else if item.slug === 'github-commit-card'}
						<GitHubCommitCard commit={sampleCommit} />
					{:else if item.slug === 'github-checks-panel'}
						<GitHubChecksPanel checks={sampleChecks} />
					{:else if item.slug === 'github-review-thread'}
						<GitHubReviewThreadCard thread={sampleThread} />
					{:else if item.slug === 'github-kanban-board'}
						<GitHubKanbanBoard />
					{:else if item.slug === 'github-bento-layout'}
						<GitHubBentoLayout />
					{:else if item.slug === 'agent-generative-surface'}
						<AgentGenerativeSurface content={sampleSurfaceContent} />
					{:else if item.slug === 'intelligent-ui-renderer'}
						<IntelligentUIRenderer nodes={sampleDynamicNodes} />
					{:else if item.slug === 'agent-orchestrator'}
						<AgentOrchestrator />
					{:else if item.slug === 'agent-parallel-processor'}
						<AgentParallelProcessor />
					{:else if item.slug === 'agent-sequential-workflow'}
						<AgentSequentialWorkflow />
					{:else if item.slug === 'agent-routing-hub'}
						<AgentRoutingHub />
					{:else if item.slug === 'agent-evaluator'}
						<AgentEvaluator />
					{:else if item.slug === 'agent-ops-monitor'}
						<AgentOpsMonitor />
					{:else if item.slug === 'agent-task-queue'}
						<AgentTaskQueue />
					{:else if item.slug === 'agent-artifact'}
						<AgentArtifact />
					{:else if item.slug === 'agent-form-generator'}
						<AgentFormGenerator />
					{:else if item.slug === 'agent-tool-palette'}
						<AgentToolPalette />
					{:else if item.slug === 'agent-thinking-indicator'}
						<AgentThinkingIndicator />
					{:else if item.slug === 'agent-context-meter'}
						<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<AgentContextMeter usedTokens={64200} maxTokens={200000} />
							<AgentCheckpoint checkpoint={sampleCheckpoint} />
						</div>
					{:else if item.slug === 'chain-of-thought'}
						<ChainOfThought />
					{:else if item.slug === 'stack-trace'}
						<StackTrace />
					{:else if item.slug === 'schema-display'}
						<SchemaDisplay />
					{:else if item.slug === 'environment-variables'}
						<EnvironmentVariables />
					{:else if item.slug === 'package-info'}
						<PackageInfo />
					{:else if item.slug === 'web-preview'}
						<WebPreview />
					{:else if item.slug === 'plan-card'}
						<div class="space-y-4">
							<PlanCard />
							<PromptSuggestions />
						</div>
					{:else if item.slug === 'test-results-terminal'}
						<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
							<TestResults suites={sampleTestSuites} />
							<Terminal output={sampleTerminalOutput} title="~/agents-kit-svelte · zsh" />
							<FileTree nodes={sampleFileTree} />
						</div>
					{:else if item.slug === 'voice-wave-visualizer'}
						<VoiceWaveVisualizer />
					{:else if item.slug === 'border-beam'}
						<BorderBeam />
					{/if}
				</div>
			</article>
		{/each}
	</div>
</div>
