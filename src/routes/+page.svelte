<script lang="ts">
	import { base } from '$app/paths';
	import {
		AISidebar,
		AgentActivity,
		AgentArtifact,
		AgentCheckpoint,
		AgentContextMeter,
		AgentDisclosure,
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
		Message,
		MessageBubble,
		MessageScroller,
		PackageInfo,
		PlanCard,
		PromptInput,
		PromptSuggestions,
		ReasoningText,
		RecommendationCard,
		RecordsTable,
		ResultActions,
		SchemaDisplay,
		SearchList,
		SelectionActions,
		StackTrace,
		StreamingResponse,
		Svelte5MotionLab,
		Terminal,
		TestResults,
		ThinkingShimmer,
		TodoList,
		ToolApproval,
		ToolChips,
		ToolResult,
		TrailsideClaudeChat,
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
		ResultActionState,
		SupportedAgentId,
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

	type CardTabMode = 'preview' | 'usage' | 'source';

	interface Props {
		data?: {
			componentSources?: Record<string, string>;
		};
	}

	let { data = {} }: Props = $props();

	let selectedCategory = $state<'All' | CatalogCategory>('All');
	let searchQuery = $state('');
	let cardTabs = $state<Record<string, CardTabMode>>({});
	let copiedSlug = $state<string | null>(null);
	let selectedRecordIds = $state<string[]>(['rec-1', 'rec-2']);
	let disclosureDemoOpen = $state(true);
	let resultActionMode = $state<ResultActionState>('view');
	let resultSaved = $state(false);
	let heroPromptValue = $state('');
	let heroAgentId = $state<SupportedAgentId>('claude-code');
	let heroNotice = $state('');
	let ready = $state(false);

	interface ScrollerTurn {
		id: string;
		from: 'user' | 'assistant';
		author: string;
		timestamp: string;
		content: string;
		streaming?: boolean;
	}

	let scrollerTurns = $state<ScrollerTurn[]>([
		{
			id: 'scope-question',
			from: 'user',
			author: 'You',
			timestamp: '20:41',
			content: 'What should the first field study include?'
		},
		{
			id: 'scope-answer',
			from: 'assistant',
			author: 'AK-S Agent',
			timestamp: '20:41',
			content: 'Start with eight rider interviews and two station walkthroughs across peak hours.'
		},
		{
			id: 'states-question',
			from: 'user',
			author: 'You',
			timestamp: '20:42',
			content: 'Include wheelchair users and people traveling with luggage.'
		},
		{
			id: 'states-answer',
			from: 'assistant',
			author: 'AK-S Agent',
			timestamp: '20:42',
			content: 'Yes. Both groups encounter the same lift bottlenecks and platform wayfinding gaps.'
		},
		{
			id: 'evidence-question',
			from: 'user',
			author: 'You',
			timestamp: '20:44',
			content: 'How should we present the synthesis findings?'
		},
		{
			id: 'evidence-answer',
			from: 'assistant',
			author: 'AK-S Agent',
			timestamp: '20:44',
			content:
				'Keep each finding beside the verbatim interview quote or field note that supports it.'
		},
		{
			id: 'approval-question',
			from: 'user',
			author: 'You',
			timestamp: '20:46',
			content: 'What needs confirmation before the field study begins?'
		},
		{
			id: 'approval-answer',
			from: 'assistant',
			author: 'AK-S Agent',
			timestamp: '20:46',
			content:
				'Confirm participant consent language, audio recording scope, and how station coordinates may be shared.'
		},
		{
			id: 'summary-question',
			from: 'user',
			author: 'You',
			timestamp: '20:48',
			content: 'Can the transcript stay easy to navigate as turns grow?'
		},
		{
			id: 'summary-answer',
			from: 'assistant',
			author: 'AK-S Agent',
			timestamp: '20:48',
			content:
				'Hover the right-hand preview rail to inspect any turn and click a tick to jump smoothly without losing your place.'
		}
	]);
	let scrollerInput = $state('');
	let scrollerStreaming = $state(false);

	/**
	 * Appends a user turn to the MessageScroller showcase and streams a simulated assistant reply.
	 *
	 * @param rawPrompt - User prompt submitted from the showcase composer.
	 */
	function submitScrollerTurn(rawPrompt: string): void {
		const trimmed = rawPrompt.trim();
		if (!trimmed || scrollerStreaming) return;

		const turnNum = scrollerTurns.length + 1;
		const userId = `scroller-user-${turnNum}`;
		const assistantId = `scroller-assistant-${turnNum + 1}`;
		const fullReply =
			"I'll prepare the interview guide, flag unresolved consent questions, and keep every synthesis claim linked to its source.";

		scrollerTurns = [
			...scrollerTurns,
			{
				id: userId,
				from: 'user',
				author: 'You',
				timestamp: 'Now',
				content: trimmed
			},
			{
				id: assistantId,
				from: 'assistant',
				author: 'AK-S Agent',
				timestamp: 'Streaming',
				content: '',
				streaming: true
			}
		];
		scrollerInput = '';
		scrollerStreaming = true;

		let charIdx = 0;
		const timer = setInterval(() => {
			charIdx = Math.min(fullReply.length, charIdx + 6);
			const nextSlice = fullReply.slice(0, charIdx);
			const done = charIdx >= fullReply.length;
			scrollerTurns = scrollerTurns.map((t) =>
				t.id === assistantId
					? {
							...t,
							content: nextSlice,
							timestamp: done ? 'Now' : 'Streaming',
							streaming: !done
						}
					: t
			);
			if (done) {
				clearInterval(timer);
				scrollerStreaming = false;
			}
		}, 35);
	}

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
					item.upstreamSource.toLowerCase().includes(q) ||
					item.sveltePath.toLowerCase().includes(q))
			);
		});
	});

	// Sample fixtures for live component previews
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
		{ id: 'claude-code', label: 'AK-S Agent', version: '0.3.0', signedIn: true },
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
			title: 'Agents Kit Design & Component Architecture',
			url: 'https://agents-ui.github.io/agents-kit/',
			domain: 'agents-ui.github.io'
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
		assignedAgent: 'AK-S Agent 0.3',
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
		checks: sampleChecks
	};

	const sampleCommit: GitHubCommitData = {
		sha: '9f8e7d6c5b4a3210fedcba9876543210abcdef12',
		message: 'feat(agents-kit): port 68 agent & GitHub UI components to Svelte 5 Runes',
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
		title: 'Verified 68 Svelte 5 components + unit suite',
		description: 'All static and unit checks green',
		commitSha: '456f3b4',
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
					name: 'all 68 Svelte components comply with Svelte 5 Runes and semantic tokens',
					status: 'passed' as const,
					durationMs: 6
				}
			]
		}
	];

	const sampleTerminalOutput = `$ corepack pnpm check && corepack pnpm test
svelte-check found 0 errors and 0 warnings
✔ all 68 Svelte components pass audit (105ms)`;

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
				{ path: 'src/lib/ai-elements', name: 'ai-elements/ & runtime/ (14 components)', kind: 'file' as const, additions: 14 }
			]
		}
	];

	/**
	 * Returns the active tab mode for a component card.
	 */
	function getTabMode(slug: string): CardTabMode {
		return cardTabs[slug] ?? 'preview';
	}

	/**
	 * Sets the active tab mode (`preview`, `usage`, or `source`) for a component card.
	 */
	function setTabMode(slug: string, mode: CardTabMode): void {
		cardTabs = {
			...cardTabs,
			[slug]: mode
		};
	}

	/**
	 * Copies the active code snippet (Usage Code or full Component Source) for a catalog item.
	 */
	function copySnippet(slug: string, usageSnippet: string): void {
		const mode = getTabMode(slug);
		const textToCopy =
			mode === 'source' && data.componentSources?.[slug]
				? data.componentSources[slug]
				: usageSnippet;
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(textToCopy).catch(() => {});
		}
		copiedSlug = slug;
		window.setTimeout(() => {
			if (copiedSlug === slug) copiedSlug = null;
		}, 1500);
	}
</script>

<svelte:head>
	<title>Agents Kit Svelte · 68 Svelte 5 Agent, GitHub & Intelligent UI Components</title>
</svelte:head>

<main>
	<!-- 1. Upstream Agents-Kit Hero Section + Interactive HomeChatPreview -->
	<section class="mx-auto max-w-[860px] px-5 pt-14 pb-12 text-center sm:pt-20">
		<a
			href="#components"
			class="inline-flex items-center gap-2 text-xs text-fg-light no-underline transition-colors hover:text-fg-main"
		>
			<span>New in v0.3 · 68 Svelte 5 Runes Components, AK-S Chat &amp; GitHub Suite</span>
			<span aria-hidden="true">→</span>
		</a>

		<h1 class="mt-5 text-4xl leading-[1.08] font-semibold tracking-tight text-fg-main sm:text-6xl">
			Build better
			<br />
			agent interfaces.
		</h1>

		<p class="mx-auto mt-5 max-w-xl text-base leading-7 text-fg-light">
			agents-kit-svelte: Dynamic Agentic, GitHub &amp; Intelligent UI Kit. Chat, voice, tools,
			approvals, and results people can work with. Built in Svelte 5 Runes. Yours to copy and
			change.
		</p>

		<!-- Interactive HomeChatPreview (matching upstream HomeChatPreview) -->
		<div class="mx-auto mt-8 w-full max-w-[600px] text-left">
			<div class="rounded-2xl border border-accent-primary/40 bg-card-bg p-1.5 shadow-xs">
				<PromptInput
					bind:value={heroPromptValue}
					agents={sampleAgents}
					selectedAgentId={heroAgentId}
					onAgentChange={(id) => (heroAgentId = id)}
					onSubmit={(submitted) => {
						const agentLabel =
							sampleAgents.find((a) => a.id === heroAgentId)?.label ?? heroAgentId;
						heroNotice = `Prompt "${submitted}" previewed with ${agentLabel}. No model was contacted.`;
					}}
				/>
			</div>
			<p class="mt-2.5 text-center font-mono text-[11px] text-fg-light" role="status">
				{heroNotice || 'PromptInput + BorderBeam · Interactive Svelte 5 preview'}
			</p>
		</div>

		<div class="mt-7 flex flex-wrap justify-center gap-3">
			<a
				href="#components"
				class="inline-flex h-9 items-center gap-2 rounded-lg bg-fg-main px-4 text-sm font-medium text-fg-inverse no-underline transition-opacity hover:opacity-90"
			>
				<span>Browse 68 components</span>
				<span aria-hidden="true">→</span>
			</a>
			<a
				href="{base}/claude-code/"
				class="inline-flex h-9 items-center gap-2 rounded-lg border border-card-border bg-card-bg px-4 text-sm font-medium text-fg-main no-underline transition-colors hover:bg-canvas-secondary"
			>
				Open AK-S Chat
			</a>
			<a
				href="{base}/github/"
				class="inline-flex h-9 items-center gap-2 rounded-lg border border-card-border bg-card-bg px-4 text-sm font-medium text-fg-main no-underline transition-colors hover:bg-canvas-secondary"
			>
				Explore GitHub Suite
			</a>
			<a
				href="{base}/intelligent-ui/"
				class="inline-flex h-9 items-center gap-2 rounded-lg border border-card-border bg-card-bg px-4 text-sm font-medium text-fg-main no-underline transition-colors hover:bg-canvas-secondary"
			>
				Intelligent UI Playground
			</a>
		</div>
	</section>

	<!-- 2. Upstream "Build with the kit · Start with a complete app" Section -->
	<section
		id="app-examples"
		class="mx-auto max-w-[1160px] border-t border-canvas-border px-5 py-10 sm:px-8"
	>
		<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
			<div>
				<p class="text-xs text-fg-light">Build with the kit</p>
				<h2 class="mt-1.5 text-xl font-medium tracking-tight text-fg-main">
					Start with a complete app.
				</h2>
			</div>
			<a
				href="{base}/claude-code/"
				class="text-sm text-fg-light no-underline transition-colors hover:text-fg-main"
			>
				Explore interactive workbenches →
			</a>
		</div>

		<div class="grid gap-4 sm:grid-cols-3">
			<a
				href="{base}/claude-code/"
				class="group flex flex-col justify-between rounded-[10px] border border-canvas-border bg-card-bg p-4 no-underline transition-colors hover:bg-canvas-secondary"
			>
				<div>
					<p class="font-mono text-xs text-fg-light">01 · Agentic Coding Workbench</p>
					<h3 class="mt-1.5 text-sm font-medium text-fg-main">AK-S Chat Workbench</h3>
					<p class="mt-2 text-[13px] leading-6 text-fg-light">
						Multi-turn agent session with collapsible tool traces, inline unified diffs, bash permissions, and worktree context meter.
					</p>
				</div>
				<span class="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-fg-main">
					<span>Try AK-S Chat</span>
					<span aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">→</span>
				</span>
			</a>

			<a
				href="{base}/github/"
				class="group flex flex-col justify-between rounded-[10px] border border-canvas-border bg-card-bg p-4 no-underline transition-colors hover:bg-canvas-secondary"
			>
				<div>
					<p class="font-mono text-xs text-fg-light">02 · Repository &amp; Board Suite</p>
					<h3 class="mt-1.5 text-sm font-medium text-fg-main">GitHub Cards, Bento &amp; Kanban</h3>
					<p class="mt-2 text-[13px] leading-6 text-fg-light">
						Reactive 4-column crossfade board, issue run dispatch cards, PR referee cards, CI check suites, and review threads.
					</p>
				</div>
				<span class="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-fg-main">
					<span>Try GitHub Suite</span>
					<span aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">→</span>
				</span>
			</a>

			<a
				href="{base}/intelligent-ui/"
				class="group flex flex-col justify-between rounded-[10px] border border-canvas-border bg-card-bg p-4 no-underline transition-colors hover:bg-canvas-secondary"
			>
				<div>
					<p class="font-mono text-xs text-fg-light">03 · Generative Surfaces</p>
					<h3 class="mt-1.5 text-sm font-medium text-fg-main">Dynamic Intelligent UI Engine</h3>
					<p class="mt-2 text-[13px] leading-6 text-fg-light">
						Declarative JSON-schema to Svelte 5 renderer plus polymorphic generative surfaces with inline Edit, Compare, and export.
					</p>
				</div>
				<span class="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-fg-main">
					<span>Try Intelligent UI</span>
					<span aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">→</span>
				</span>
			</a>
		</div>
	</section>

	<!-- 3. Upstream Two-Column Sticky Sidebar + Main Component Catalogue -->
	<div
		id="components"
		class="mx-auto grid max-w-7xl scroll-mt-16 border-t border-canvas-border lg:grid-cols-[224px_minmax(0,1fr)]"
	>
		<!-- Left Sticky Sidebar (matches components/gallery/catalogue.tsx) -->
		<aside
			aria-label="Catalogue filter and component index"
			class="border-b border-canvas-border p-4 lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:overflow-auto lg:border-r lg:border-b-0"
		>
			<label
				class="flex h-9 items-center gap-2 rounded-lg border border-card-border bg-canvas-secondary px-3 focus-within:border-accent-primary"
			>
				<span class="font-mono text-xs text-fg-light" aria-hidden="true">⌕</span>
				<input
					type="search"
					aria-label="Search components"
					placeholder="Search 68 components"
					bind:value={searchQuery}
					class="min-w-0 flex-1 bg-transparent text-xs text-fg-main outline-none"
				/>
			</label>

			<div class="mt-4">
				<label for="collection-source" class="text-xs text-fg-light">Collection</label>
				<select
					id="collection-source"
					value={selectedCategory}
					onchange={(e) =>
						(selectedCategory = (e.currentTarget as HTMLSelectElement).value as
							| 'All'
							| CatalogCategory)}
					class="mt-1.5 h-9 w-full rounded-lg border border-card-border bg-card-bg px-2 text-xs text-fg-main"
				>
					{#each CATEGORIES as cat (cat)}
						{@const count =
							cat === 'All'
								? CATALOG_ITEMS.length
								: CATALOG_ITEMS.filter((i) => i.category === cat).length}
						<option value={cat}>
							{cat === 'All' ? `All collections (${count})` : `${cat} (${count})`}
						</option>
					{/each}
				</select>
			</div>

			<nav class="mt-6 hidden lg:block" aria-label="Component families">
				<p class="mb-2 px-2 font-mono text-[11px] tracking-wider text-fg-light uppercase">
					Components ({filteredCatalog.length})
				</p>
				<div class="space-y-0.5">
					{#each filteredCatalog as item (item.slug)}
						<a
							href="#{item.slug}"
							class="block truncate rounded-lg px-2 py-1.5 text-xs text-fg-light no-underline transition-colors hover:bg-canvas-secondary hover:text-fg-main"
						>
							{item.name}
						</a>
					{/each}
				</div>
			</nav>
		</aside>

		<!-- Right Main Catalogue Column -->
		<div class="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
			<header class="mb-6 max-w-2xl">
				<p class="text-xs text-fg-light">Components</p>
				<h2 class="mt-1.5 text-2xl font-semibold tracking-tight text-fg-main">
					An interface for every part of agent work.
				</h2>
				<p class="mt-2.5 text-sm leading-6 text-fg-light">
					From the first prompt to the final result. Explore thinking, tools, decisions, GitHub
					workflows, and generated interfaces in one consistent Svelte 5 collection.
				</p>
				<p class="mt-2.5 font-mono text-xs text-fg-light">
					{CATALOG_ITEMS.length} Svelte 5 components · Live Preview, Usage Code &amp; Component Source
					tabs
				</p>
			</header>

			<!-- Category Tab Strip (accessible tablist for quick one-click filtering) -->
			<div
				class="mb-6 flex flex-wrap items-center gap-1.5 border-b border-canvas-border pb-4"
				role="tablist"
				aria-label="Component category filter"
			>
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
						class="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors {selectedCategory ===
						category
							? 'bg-fg-main text-fg-inverse'
							: 'bg-canvas-secondary text-fg-light hover:text-fg-main'}"
					>
						{category}
						<span class="ml-1 font-mono text-[11px] opacity-75">({count})</span>
					</button>
				{/each}
			</div>

			<!-- 68 Component Sections (upstream dashed-border FamilyPreview layout) -->
			<div class="space-y-8">
				{#each filteredCatalog as item (item.slug)}
					{@const tabMode = getTabMode(item.slug)}
					{@const showCode = tabMode !== 'preview'}
					<article
						id={item.slug}
						data-component-slug={item.slug}
						class="scroll-mt-24 border-b border-dashed border-canvas-border pb-7"
					>
						<!-- Upstream FamilyPreview Header -->
						<header class="mb-3 flex flex-wrap items-end justify-between gap-3">
							<div class="max-w-2xl">
								<div class="flex flex-wrap items-center gap-2">
									<h3 class="text-[14px] font-semibold tracking-tight text-fg-main">
										{item.name}
									</h3>
									<span
										class="rounded-md bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] text-fg-light"
									>
										{item.category}
									</span>
								</div>
								<p class="mt-0.5 font-mono text-[11px] text-fg-light">
									{item.upstreamSource} · {item.sveltePath}
								</p>
								<p class="mt-1 text-xs text-fg-light">{item.description}</p>
							</div>

							<!-- Preview | Svelte 5 Code (Usage) | Component Source (.svelte) + Copy -->
							<div class="flex flex-wrap items-center gap-1.5">
								{#if showCode}
									<button
										type="button"
										disabled={!ready}
										onclick={() => setTabMode(item.slug, 'preview')}
										class="rounded-lg border border-card-border bg-card-bg px-2.5 py-1.5 font-mono text-xs font-medium text-fg-main transition-colors hover:bg-canvas-secondary"
									>
										◀ Live Preview
									</button>
								{:else}
									<button
										type="button"
										disabled={!ready}
										onclick={() => setTabMode(item.slug, 'usage')}
										class="rounded-lg border border-card-border bg-card-bg px-2.5 py-1.5 font-mono text-xs font-medium text-fg-main transition-colors hover:bg-canvas-secondary"
									>
										&lt;/&gt; Svelte 5 Code
									</button>
								{/if}

								<button
									type="button"
									disabled={!ready}
									aria-pressed={tabMode === 'usage'}
									onclick={() => setTabMode(item.slug, tabMode === 'usage' ? 'preview' : 'usage')}
									class="rounded-lg px-2.5 py-1.5 font-mono text-xs transition-colors {tabMode ===
									'usage'
										? 'bg-fg-main font-medium text-fg-inverse'
										: 'text-fg-light hover:bg-canvas-secondary hover:text-fg-main'}"
								>
									Usage Snippet
								</button>

								<button
									type="button"
									disabled={!ready}
									aria-pressed={tabMode === 'source'}
									onclick={() =>
										setTabMode(item.slug, tabMode === 'source' ? 'preview' : 'source')}
									class="rounded-lg px-2.5 py-1.5 font-mono text-xs transition-colors {tabMode ===
									'source'
										? 'bg-fg-main font-medium text-fg-inverse'
										: 'text-fg-light hover:bg-canvas-secondary hover:text-fg-main'}"
								>
									Full Source
								</button>

								<button
									type="button"
									disabled={!ready}
									onclick={() => copySnippet(item.slug, item.usageSnippet)}
									class="rounded-lg border border-card-border bg-card-bg px-2.5 py-1.5 font-mono text-xs font-medium text-fg-light transition-colors hover:text-fg-main"
								>
									{copiedSlug === item.slug ? '✓ Copied' : 'Copy snippet'}
								</button>
							</div>
						</header>

						<!-- Upstream rounded-[14px] Stage -->
						<div
							class="relative isolate overflow-x-auto rounded-[14px] border border-canvas-border bg-canvas-secondary p-3 sm:p-4"
						>
							{#if tabMode === 'usage'}
								<CodeBlock
									filename="{item.slug}-example.svelte"
									language="svelte"
									code={item.usageSnippet}
								/>
							{:else if tabMode === 'source'}
								<CodeBlock
									filename={item.sveltePath}
									language="svelte"
									code={data.componentSources?.[item.slug] ?? item.usageSnippet}
								/>
							{:else if item.slug === 'trailside-claude-chat'}
								<TrailsideClaudeChat
									embedded={true}
									class="rounded-xl border border-card-border"
								/>
							{:else if item.slug === 'agent-activity'}
								<AgentActivity
									items={sampleActivity}
									status="complete"
									durationSeconds={6}
									defaultOpen={true}
								/>
							{:else if item.slug === 'agent-disclosure'}
								<div class="space-y-2">
									<button
										type="button"
										disabled={!ready}
										onclick={() => (disclosureDemoOpen = !disclosureDemoOpen)}
										class="rounded-lg border border-card-border bg-card-bg px-3 py-1.5 font-mono text-xs font-medium text-fg-main transition-colors hover:bg-canvas-primary"
									>
										{disclosureDemoOpen ? '▼ Collapse Disclosure' : '▶ Expand Disclosure'}
									</button>
									<AgentDisclosure open={disclosureDemoOpen}>
										<div
											class="rounded-xl border border-card-border bg-card-bg p-3 font-mono text-xs text-fg-main"
										>
											Accessible Svelte 5 slide+fade disclosure panel with
											<code class="text-accent-primary">inert</code> hidden state.
										</div>
									</AgentDisclosure>
								</div>
							{:else if item.slug === 'todo-list'}
								<TodoList
									title="Svelte 5 Port & Verification Plan"
									items={sampleTodos}
									defaultOpen={true}
								/>
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
									meta="96ms · 9 passed"
									output="✔ all 68 Svelte components in src/ comply with Svelte 5 Runes, Props typing, and semantic token rules"
									defaultOpen={true}
								/>
							{:else if item.slug === 'file-diff'}
								<FileDiff filename="src/lib/agents/AgentActivity.svelte" patch={sampleDiff} />
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
								<PromptInput agents={sampleAgents} selectedAgentId="claude-code" />
							{:else if item.slug === 'message'}
								<Message
									role="assistant"
									author="AK-S Agent"
									badge="Connected Computer"
									timestamp="21:18"
								>
									<p class="text-sm text-fg-main">
										Verified worktree
										<code class="rounded bg-card-bg px-1.5 py-0.5 font-mono text-xs"
											>trailside/2151-drawer-hydration</code
										>
										with zero TypeScript diagnostics.
									</p>
								</Message>
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
										author="AK-S Agent"
										timestamp="21:16"
										collapsible={true}
										text="All 68 Svelte 5 components are live with strict TypeScript Props, OKLCH dark/light tokens, and interactive showcases."
									/>
								</div>
							{:else if item.slug === 'message-scroller'}
								<div
									class="mx-auto flex h-[440px] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-card-border bg-card-bg shadow-[var(--shadow-card)]"
								>
									<MessageScroller
										navigation="rail"
										streaming={scrollerStreaming}
										busy={scrollerStreaming}
										class="min-h-0 flex-1"
									>
										{#each scrollerTurns as turn (turn.id)}
											<MessageBubble
												id={turn.id}
												variant={turn.from === 'user' ? 'solid' : 'soft'}
												align={turn.from === 'user' ? 'end' : 'start'}
												author={turn.author}
												avatar={turn.from === 'user' ? 'YO' : 'AK'}
												timestamp={turn.timestamp}
												status={turn.streaming ? 'streaming' : 'delivered'}
												collapsible={false}
												text={turn.content || 'Preparing response…'}
											/>
										{/each}
									</MessageScroller>

									<form
										onsubmit={(event) => {
											event.preventDefault();
											submitScrollerTurn(
												scrollerInput || 'Draft the synthesis checklist for station interviews.'
											);
										}}
										class="flex shrink-0 items-center gap-2 border-t border-card-border bg-canvas-secondary px-3 py-2.5"
									>
										<input
											type="text"
											bind:value={scrollerInput}
											aria-label="Send a message to test MessageScroller auto-follow"
											placeholder="Ask about the study or click Stream turn to test auto-follow…"
											class="h-8 min-w-0 flex-1 rounded-lg border border-card-border bg-card-bg px-3 text-xs text-fg-main outline-none focus:border-accent-primary"
										/>
										<button
											type="submit"
											disabled={scrollerStreaming}
											class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-fg-main px-3 text-xs font-medium text-fg-inverse transition-opacity hover:opacity-90 disabled:opacity-50"
										>
											<span>{scrollerStreaming ? 'Streaming…' : 'Stream turn'}</span>
										</button>
									</form>
								</div>
							{:else if item.slug === 'streaming-response'}
								<StreamingResponse
									status="complete"
									copyText="All 68 Svelte 5 components verified with 0 errors and 0 warnings."
									sources={sampleCitations}
								>
									<p class="text-sm text-fg-main">
										All 68 Svelte 5 components verified with
										<code class="rounded bg-card-bg px-1.5 py-0.5 font-mono text-xs"
											>svelte-check</code
										>
										(0 errors, 0 warnings) and interactive action bar.
									</p>
								</StreamingResponse>
							{:else if item.slug === 'citations'}
								<Citations citations={sampleCitations} defaultOpen={true} />
							{:else if item.slug === 'image-generation'}
								<ImageGeneration />
							{:else if item.slug === 'ai-sidebar'}
								<AISidebar />
							{:else if item.slug === 'thinking-shimmer'}
								<ThinkingShimmer label="Analyzing repository structure..." />
							{:else if item.slug === 'agent-progress'}
								<AgentProgress label="Running Playwright suite" elapsedSeconds={14} />
							{:else if item.slug === 'reasoning-text'}
								<ReasoningText />
							{:else if item.slug === 'tool-chips'}
								<ToolChips />
							{:else if item.slug === 'recommendation-card'}
								<RecommendationCard />
							{:else if item.slug === 'context-cards'}
								<ContextCards />
							{:else if item.slug === 'diff-table'}
								<DiffTable />
							{:else if item.slug === 'records-table'}
								<RecordsTable
									selectedIds={selectedRecordIds}
									onSelectionChange={(ids) => (selectedRecordIds = ids)}
								/>
							{:else if item.slug === 'selection-actions'}
								<SelectionActions
									selectedCount={selectedRecordIds.length || 2}
									onClear={() => (selectedRecordIds = [])}
								/>
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
							{:else if item.slug === 'result-actions'}
								<ResultActions
									state={resultActionMode}
									saved={resultSaved}
									onExpand={() =>
										(resultActionMode = resultActionMode === 'expanded' ? 'view' : 'expanded')}
									onEdit={() =>
										(resultActionMode = resultActionMode === 'editing' ? 'view' : 'editing')}
									onCompare={() =>
										(resultActionMode = resultActionMode === 'comparing' ? 'view' : 'comparing')}
									onSave={() => (resultSaved = !resultSaved)}
								/>
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
								<AgentContextMeter usedTokens={64200} maxTokens={200000} />
							{:else if item.slug === 'agent-checkpoint'}
								<AgentCheckpoint checkpoint={sampleCheckpoint} />
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
								<PlanCard />
							{:else if item.slug === 'prompt-suggestions'}
								<PromptSuggestions />
							{:else if item.slug === 'test-results'}
								<TestResults suites={sampleTestSuites} />
							{:else if item.slug === 'terminal'}
								<Terminal output={sampleTerminalOutput} title="~/agents-kit-svelte · zsh" />
							{:else if item.slug === 'file-tree'}
								<FileTree nodes={sampleFileTree} />
							{:else if item.slug === 'voice-wave-visualizer'}
								<VoiceWaveVisualizer />
							{:else if item.slug === 'border-beam'}
								<BorderBeam />
							{:else if item.slug === 'svelte5-motion-lab'}
								<Svelte5MotionLab />
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</div>
	</div>
</main>
