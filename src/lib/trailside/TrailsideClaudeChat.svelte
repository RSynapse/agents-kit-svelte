<script lang="ts">
	import { SEGMENT_GROUP_CLASS, pillClass, segmentClass } from '../ui/styles';
	import { Check, FileCode, LayoutGrid, MessageCircle, Moon, Sparkle, SquareTerminal, Sun } from '@lucide/svelte';
	import AgentActivity from '../agents/AgentActivity.svelte';
	import AgentProgress from '../agents/AgentProgress.svelte';
	import ApprovalCard from '../agents/ApprovalCard.svelte';
	import Citations from '../agents/Citations.svelte';
	import CodeBlock from '../agents/CodeBlock.svelte';
	import FileDiff from '../agents/FileDiff.svelte';
	import Message from '../agents/Message.svelte';
	import MessageScroller from '../agents/MessageScroller.svelte';
	import PromptInput from '../agents/PromptInput.svelte';
	import ReasoningText from '../agents/ReasoningText.svelte';
	import StreamingResponse from '../agents/StreamingResponse.svelte';
	import ThinkingShimmer from '../agents/ThinkingShimmer.svelte';
	import TodoList from '../agents/TodoList.svelte';
	import ToolApproval from '../agents/ToolApproval.svelte';
	import ToolResult from '../agents/ToolResult.svelte';
	import AgentCheckpoint from '../runtime/AgentCheckpoint.svelte';
	import AgentContextMeter from '../runtime/AgentContextMeter.svelte';
	import FileTree, { type WorktreeFileNode } from '../runtime/FileTree.svelte';
	import Terminal from '../runtime/Terminal.svelte';
	import TestResults, { type SuiteGroup } from '../runtime/TestResults.svelte';
	import type {
		ActivityItem,
		ApprovalCardAnswers,
		ApprovalQuestion,
		CheckpointEntry,
		CitationItem,
		ContextSourceItem,
		SupportedAgentId,
		SupportedAgentOption,
		TodoItem,
		ToolApprovalParam,
		ToolApprovalStatus
	} from '../types';

	interface ConversationEntry {
		id: string;
		role: 'user' | 'assistant';
		author: string;
		badge?: string;
		timestamp: string;
		text: string;
		activityItems?: ActivityItem[];
	}

	interface Props {
		initialDark?: boolean;
		embedded?: boolean;
		class?: string;
	}

	let { initialDark = false, embedded = false, class: className = '' }: Props = $props();

	const SUPPORTED_AGENTS: SupportedAgentOption[] = [
		{ id: 'claude-code', label: 'AK-S Agent', version: 'v0.3.0', signedIn: true },
		{ id: 'codex', label: 'Codex CLI', version: 'v0.29.0', signedIn: true },
		{ id: 'gemini', label: 'Gemini CLI', version: 'v2.4.1', signedIn: true }
	];

	const CONTEXT_SOURCES: ContextSourceItem[] = [
		{ id: 'sys', label: 'System & Trailside Brief (T2 guardrails)', tokens: 11_200, category: 'system' },
		{ id: 'wt', label: 'Worktree diff & AST symbols (4 files)', tokens: 18_400, category: 'worktree' },
		{ id: 'conv', label: 'Attempt #2 conversation log', tokens: 12_900, category: 'conversation' },
		{ id: 'tools', label: 'MCP & Companion tool schemas', tokens: 5_700, category: 'tools' }
	];

	const INITIAL_ACTIVITY: ActivityItem[] = [
		{
			id: 'act-1',
			type: 'text',
			label: 'Traced GitHub OAuth callback redirect flow and inspected returnTo sanitization.'
		},
		{
			id: 'act-2',
			type: 'tool',
			label: 'Read',
			target: 'apps/web/src/routes/auth/callback/+server.ts',
			meta: 'lines 1-64',
			status: 'complete'
		},
		{
			id: 'act-3',
			type: 'search',
			label: 'Searched',
			target: 'sanitizeReturnTo in apps/web/src/lib/server/auth',
			meta: '3 matches',
			status: 'complete'
		},
		{
			id: 'act-4',
			type: 'tool',
			label: 'Edit',
			target: 'apps/web/src/routes/auth/callback/+server.ts',
			additions: 3,
			deletions: 1,
			status: 'complete'
		}
	];

	const CALLBACK_DIFF_PATCH = [
		'@@ -18,4 +18,6 @@ export async function verifyCallback(url: URL) {',
		'   const code = url.searchParams.get("code");',
		'-  return redirect(302, "/login");',
		'+  const next = sanitizeReturnTo(url.searchParams.get("next"));',
		'+  if (!code) return redirect(303, "/login?error=missing_code");',
		'+  return redirect(303, next);',
		' }'
	].join('\n');

	const TEST_DIFF_PATCH = [
		'@@ -41,2 +41,8 @@ test("preserves deep link query across GitHub OAuth callback", async () => {',
		'   const res = await verifyCallback(new URL("https://trailside.io/auth/callback?code=ok&next=%2Fw%2Fboard%3Ffilter%3Dready"));',
		'+  expect(res.status).toBe(303);',
		'+  expect(res.headers.get("location")).toBe("/w/board?filter=ready");',
		' });'
	].join('\n');

	const TOOL_APPROVAL_PARAMS: ToolApprovalParam[] = [
		{
			label: 'Command',
			value: 'corepack pnpm --filter @trailside/web test tests/auth-callback.test.ts',
			code: true
		},
		{ label: 'Computer', value: 'studio-mac (Connected · local worktree)' },
		{ label: 'Worktree', value: 'trailside/1210-auth-redirect', code: true },
		{ label: 'Risk tier', value: 'T2 · Scoped read/test in disposable worktree' }
	];

	const APPROVAL_QUESTIONS: ApprovalQuestion[] = [
		{
			id: 'redirect-policy',
			question: 'Where should unauthenticated deep links redirect after GitHub sign-in?',
			options: [
				{
					id: 'opt-preserve',
					label: 'Preserve original path and query string',
					description: 'Sanitizes relative /w/* paths and keeps filter/card query parameters intact.'
				},
				{
					id: 'opt-board',
					label: 'Redirect to workspace Board root (/w)',
					description: 'Drops deep-link query parameters and always lands on the default Board.'
				},
				{
					id: 'opt-prompt',
					label: 'Show a confirmation interstitial before redirecting',
					description: 'Displays the target workspace route before completing navigation.'
				}
			],
			allowCustom: true,
			customPlaceholder: 'Or specify a custom redirect rule…'
		}
	];

	const CITATION_SOURCES: CitationItem[] = [
		{
			id: 'cit-1',
			title: 'M1 Hosted Foundation Design — §4.2 GitHub OAuth Callback & Session Cookie',
			domain: 'docs/superpowers/specs',
			url: '#spec-m1-oauth'
		},
		{
			id: 'cit-2',
			title: 'apps/web/src/routes/auth/callback/+server.ts',
			domain: 'worktree:trailside/1210',
			url: '#file-callback-server'
		}
	];

	const CHECKPOINT_ENTRY: CheckpointEntry = {
		id: 'cp-8f4a21c',
		title: 'Checkpoint',
		commitSha: '8f4a21c',
		description: 'Before callback redirect patch',
		worktreeBranch: 'trailside/1210-auth-redirect',
		timestamp: '2m ago',
		filesChanged: 2,
		restorable: true
	};

	const WORKTREE_FILES: WorktreeFileNode[] = [
		{
			path: 'apps/web/src/routes/auth/callback',
			name: 'apps/web/src/routes/auth/callback',
			kind: 'folder',
			children: [
				{
					path: 'apps/web/src/routes/auth/callback/+server.ts',
					name: '+server.ts',
					kind: 'file',
					additions: 3,
					deletions: 1
				}
			]
		},
		{
			path: 'tests',
			name: 'tests',
			kind: 'folder',
			children: [
				{
					path: 'tests/auth-callback.test.ts',
					name: 'auth-callback.test.ts',
					kind: 'file',
					additions: 6,
					deletions: 0
				}
			]
		}
	];

	const TEST_SUITES: SuiteGroup[] = [
		{
			id: 'suite-auth',
			name: 'tests/auth-callback.test.ts',
			status: 'passed',
			tests: [
				{
					id: 't-1',
					name: 'preserves deep link query across GitHub OAuth callback',
					status: 'passed',
					durationMs: 38
				},
				{
					id: 't-2',
					name: 'rejects external protocol-relative returnTo URLs',
					status: 'passed',
					durationMs: 19
				},
				{
					id: 't-3',
					name: 'redirects missing OAuth code to /login?error=missing_code',
					status: 'passed',
					durationMs: 24
				}
			]
		},
		{
			id: 'suite-boundaries',
			name: 'scripts/check-boundaries.ts',
			status: 'passed',
			tests: [
				{
					id: 't-4',
					name: 'verifies T2 path confinement and zero cross-service imports',
					status: 'passed',
					durationMs: 112
				}
			]
		}
	];

	const EVALUATION_MATRIX = [
		{
			family: 'AgentActivity + ActivityRow',
			upstream: 'components/beui/components/agents/agent-activity',
			sveltePort: 'src/lib/agents/AgentActivity.svelte',
			trailsideFit:
				'Replaces static status lines in TaskChat.svelte with Claude Code collapsible tool/search/thinking traces and +add/-del badges.'
		},
		{
			family: 'TodoList',
			upstream: 'components/beui/components/agents/todo-list.tsx',
			sveltePort: 'src/lib/agents/TodoList.svelte',
			trailsideFit:
				'Surfaces live Attempt step checklists inside card runs with reactive completion counters.'
		},
		{
			family: 'ToolApproval',
			upstream: 'components/beui/components/agents/tool-approval.tsx',
			sveltePort: 'src/lib/agents/ToolApproval.svelte',
			trailsideFit:
				'Upgrades ApprovalChat.svelte with structured <dl> worktree/command/risk-tier parameters and Allow once / Always allow / Deny controls.'
		},
		{
			family: 'ToolResult + Terminal',
			upstream: 'components/beui/components/agents/tool-result.tsx',
			sveltePort: 'src/lib/agents/ToolResult.svelte',
			trailsideFit:
				'Streams Companion command & test runner output with copy, duration meta, and aria-live="polite" log semantics.'
		},
		{
			family: 'FileDiff + CodeBlock',
			upstream: 'components/beui/components/agents/file-diff.tsx',
			sveltePort: 'src/lib/agents/FileDiff.svelte',
			trailsideFit:
				'Renders inline worktree patches with dual old/new line numbers and semantic diff tokens.'
		},
		{
			family: 'ApprovalCard',
			upstream: 'components/beui/components/agents/approval-card',
			sveltePort: 'src/lib/agents/ApprovalCard.svelte',
			trailsideFit:
				'Upgrades RefreshQuestionChat.svelte with multi-step radio/checkbox/custom-input clarifying questions.'
		},
		{
			family: 'PromptInput',
			upstream: 'components/beui/components/agents/prompt-input.tsx',
			sveltePort: 'src/lib/agents/PromptInput.svelte',
			trailsideFit:
				'Provides IME-safe Enter submit (isComposing / keyCode 229), Supported Agent switcher, and @worktree/@skill context pills.'
		},
		{
			family: 'AgentContextMeter + Checkpoint',
			upstream: 'components/agents-ui/application/*',
			sveltePort: 'src/lib/runtime/{AgentContextMeter,AgentCheckpoint}.svelte',
			trailsideFit:
				'Exposes token window health and one-click worktree commit restore directly in the run header and timeline.'
		}
	];

	let isDark = $state(false);
	let activeTab = $state<'chat' | 'changes' | 'checks' | 'catalog'>('chat');
	let selectedAgentId = $state<SupportedAgentId>('claude-code');
	let selectedFile = $state('apps/web/src/routes/auth/callback/+server.ts');
	let approvalStatus = $state<ToolApprovalStatus>('pending');
	let decisionSummary = $state<string | null>(null);
	let promptText = $state('');
	let isAgentWorking = $state(false);
	let usedTokens = $state(48_200);
	let terminalOutput = $state(
		[
			'$ corepack pnpm --filter @trailside/web test tests/auth-callback.test.ts',
			'✔ preserves deep link query across GitHub OAuth callback (38ms)',
			'✔ rejects external protocol-relative returnTo URLs (19ms)',
			'✔ redirects missing OAuth code to /login?error=missing_code (24ms)',
			'ℹ pass 3 · fail 0 · duration 193ms'
		].join('\n')
	);

	let todoItems = $state<TodoItem[]>([
		{
			id: 'todo-1',
			label: 'Inspect OAuth callback route and session redirect cookies',
			status: 'completed'
		},
		{
			id: 'todo-2',
			label: 'Patch sanitizeReturnTo in apps/web/src/routes/auth/callback/+server.ts',
			status: 'completed'
		},
		{
			id: 'todo-3',
			label: 'Confirm deep-link fallback policy and run verification suite',
			detail: 'Waiting on tool approval & redirect policy confirmation',
			status: 'in-progress'
		},
		{
			id: 'todo-4',
			label: 'Run check-boundaries gate and prepare PR receipt',
			status: 'pending'
		}
	]);

	let extraMessages = $state<ConversationEntry[]>([]);

	$effect(() => {
		isDark = initialDark;
	});

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', isDark);
			document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
		}
	});

	let activeAgent = $derived(
		SUPPORTED_AGENTS.find((item) => item.id === selectedAgentId) ?? SUPPORTED_AGENTS[0]
	);

	let railItems = $derived([
		{ id: 'msg-user-1', label: 'Investigate OAuth redirect loop', role: 'user' as const },
		{ id: 'msg-agent-1', label: 'Claude Code trace & diff patch', role: 'assistant' as const },
		...extraMessages.map((msg) => ({
			id: msg.id,
			label: msg.text.slice(0, 36),
			role: msg.role
		}))
	]);

	/**
	 * Marks the pending tool approval as approved and updates the Todo checklist.
	 */
	function handleToolApprove(): void {
		approvalStatus = 'approved';
		todoItems = todoItems.map((item) =>
			item.id === 'todo-3'
				? { ...item, status: 'completed', detail: 'Suite passed (3/3 assertions green)' }
				: item.id === 'todo-4'
					? { ...item, status: 'in-progress' }
					: item
		);
	}

	/**
	 * Records the user's answer to the multi-step ApprovalCard question.
	 *
	 * @param answers - Map of question IDs to selected option labels.
	 */
	function handleDecisionSubmit(answers: ApprovalCardAnswers): void {
		const summary = Object.values(answers).flat().join(' · ');
		decisionSummary = summary;
		todoItems = todoItems.map((item) => ({ ...item, status: 'completed' }));
	}

	/**
	 * Appends a new user prompt to the conversation stream and generates a simulated Claude Code response.
	 *
	 * @param submittedPrompt - Non-empty prompt text from `PromptInput`.
	 */
	function handlePromptSubmit(submittedPrompt: string): void {
		const userMsgId = `msg-user-${Date.now()}`;
		const assistantMsgId = `msg-agent-${Date.now() + 1}`;

		extraMessages = [
			...extraMessages,
			{
				id: userMsgId,
				role: 'user',
				author: 'You',
				badge: 'Admin',
				timestamp: 'Just now',
				text: submittedPrompt
			},
			{
				id: assistantMsgId,
				role: 'assistant',
				author: activeAgent.label,
				badge: `${activeAgent.version} · studio-mac`,
				timestamp: 'Just now',
				text: `Executed "${submittedPrompt}" in worktree trailside/1210-auth-redirect. All 4 boundary and OAuth callback assertions passed with zero warnings.`,
				activityItems: [
					{
						id: `act-dyn-${Date.now()}`,
						type: 'tool',
						label: 'Bash',
						target: 'corepack pnpm test:affected',
						meta: '4 passed (1.42s)',
						status: 'complete'
					}
				]
			}
		];
		usedTokens = Math.min(200_000, usedTokens + 2_400);
	}
</script>

<div
	class="flex {embedded
		? 'h-[720px]'
		: 'h-[calc(100vh-3.5rem)] min-h-[560px]'} flex-col overflow-hidden bg-chat-surface text-fg-main {className}"
>
	<!-- Top Application Bar -->
	<header
		class="flex flex-wrap items-center justify-between gap-3 border-b border-chat-border/70 bg-chat-surface px-4 py-3 sm:px-6"
	>
		<div class="flex min-w-0 items-center gap-3">
			<span
				class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-chat-accent-subtle text-chat-accent"
			>
				<Sparkle class="size-4 fill-current" />
			</span>
			<div class="min-w-0">
				<div class="flex flex-wrap items-center gap-2">
					<span class="text-xs text-fg-light">Card 1210</span>
					<h1 class="truncate text-sm font-semibold text-fg-main sm:text-[15px]">
						Fix OAuth callback redirect loop on deep links
					</h1>
					<span
						class="rounded-full bg-status-success-subtle px-2.5 py-0.5 text-[11px] font-medium text-status-success"
					>
						Attempt #2 · Active
					</span>
				</div>
				<div class="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-light">
					<span class="inline-flex items-center gap-1">
						<span class="inline-block size-1.5 rounded-full bg-status-success"></span>
						<strong class="font-medium text-fg-main">studio-mac</strong> · Connected
					</span>
					<span>·</span>
					<code class="rounded-full bg-chat-user px-2 py-px font-mono text-[11px] text-fg-main">
						trailside/1210-auth-redirect
					</code>
					<span>·</span>
					<span class="rounded-full bg-status-warning-subtle px-2 py-px text-[11px] font-medium text-status-warning">
						Risk Tier T2
					</span>
				</div>
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<AgentContextMeter {usedTokens} maxTokens={200_000} sources={CONTEXT_SOURCES} />

			<button
				type="button"
				aria-label="Toggle color theme"
				onclick={() => (isDark = !isDark)}
				class={pillClass('secondary', 'sm')}
			>
				{#if isDark}
					<Sun aria-hidden="true" class="size-3.5 text-fg-light" />
					<span>Light</span>
				{:else}
					<Moon aria-hidden="true" class="size-3.5 text-fg-light" />
					<span>Dark</span>
				{/if}
			</button>
		</div>
	</header>

	<!-- Workspace Navigation Tabs -->
	<div
		role="tablist"
		aria-label="Trailside workspace views"
		class="{SEGMENT_GROUP_CLASS} mx-4 my-2 flex-wrap sm:mx-6"
	>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'chat'}
			onclick={() => (activeTab = 'chat')}
			class="{segmentClass(activeTab === 'chat')}"
		>
			<MessageCircle aria-hidden="true" class="size-3.5" />
			<span>AK-S Chat</span>
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'changes'}
			onclick={() => (activeTab = 'changes')}
			class="{segmentClass(activeTab === 'changes')}"
		>
			<FileCode aria-hidden="true" class="size-3.5" />
			<span>Changes (2)</span>
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'checks'}
			onclick={() => (activeTab = 'checks')}
			class="{segmentClass(activeTab === 'checks')}"
		>
			<SquareTerminal aria-hidden="true" class="size-3.5" />
			<span>Checks & Terminal</span>
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'catalog'}
			onclick={() => (activeTab = 'catalog')}
			class="{segmentClass(activeTab === 'catalog')}"
		>
			<LayoutGrid aria-hidden="true" class="size-3.5" />
			<span>Component Catalog & Evaluation</span>
		</button>
	</div>

	<!-- Workspace Body -->
	<div class="flex min-h-0 flex-1 overflow-hidden">
		<!-- Left Sidebar (Card Runs & Worktree Files) -->
		<aside
			aria-label="Worktree and Run sidebar"
			class="hidden min-h-0 w-64 shrink-0 flex-col justify-between gap-4 overflow-y-auto border-r border-chat-border/70 bg-chat-user/35 p-3.5 md:flex"
		>
			<div class="space-y-4">
				<div>
					<h2 class="px-1 text-[11px] font-medium capitalize text-fg-light">
						Active Card Runs
					</h2>
					<ul class="mt-1.5 space-y-1 text-xs">
						<li>
							<button
								type="button"
								onclick={() => (activeTab = 'chat')}
								class="flex w-full items-center justify-between gap-2 rounded-xl bg-card-bg px-3 py-2 text-left font-medium text-fg-main ak-shadow-soft-sm"
							>
								<span class="truncate">Card 1210 · OAuth redirect loop</span>
								<span class="inline-flex items-center gap-1 text-[11px] text-status-success"><span aria-hidden="true" class="ak-breathe size-1.5 rounded-full bg-current"></span>Live</span>
							</button>
						</li>
						<li>
							<button
								type="button"
								onclick={() => (activeTab = 'chat')}
								class="flex w-full items-center justify-between gap-2 rounded-[10px] px-2.5 py-1.5 text-left text-fg-light transition-colors hover:bg-card-bg hover:text-fg-main"
							>
								<span class="truncate">Card 1198 · Pairing token expiry</span>
								<span class="text-[11px]">Merged</span>
							</button>
						</li>
						<li>
							<button
								type="button"
								onclick={() => (activeTab = 'chat')}
								class="flex w-full items-center justify-between gap-2 rounded-[10px] px-2.5 py-1.5 text-left text-fg-light transition-colors hover:bg-card-bg hover:text-fg-main"
							>
								<span class="truncate">Card 1204 · Board column focus</span>
								<span class="text-[11px]">Pass</span>
							</button>
						</li>
					</ul>
				</div>

				<div>
					<h2 class="px-1 text-[11px] font-medium capitalize text-fg-light">
						Worktree Files (2)
					</h2>
					<FileTree
						nodes={WORKTREE_FILES}
						selectedPath={selectedFile}
						onSelect={(path) => {
							selectedFile = path;
							activeTab = 'changes';
						}}
						class="mt-1.5"
					/>
				</div>
			</div>

			<div class="rounded-soft border border-chat-border bg-card-bg ak-shadow-soft-sm p-3 text-xs">
				<div class="flex items-center justify-between text-xs text-fg-light">
					<span>Companion Runtime</span>
					<span class="inline-flex items-center gap-1 text-status-success"><span aria-hidden="true" class="size-1.5 rounded-full bg-current"></span>Ready</span>
				</div>
				<p class="mt-1 font-medium text-fg-main">{activeAgent.label} ({activeAgent.version})</p>
				<p class="mt-0.5 text-[11px] text-fg-light">
					Local consent active · Dispatched in isolated git worktree
				</p>
			</div>
		</aside>

		<!-- Main Active Tab Panel -->
		<main class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-chat-surface">
			{#if activeTab === 'chat'}
				<MessageScroller items={railItems} streaming={isAgentWorking}>
					<!-- User Initial Prompt -->
					<Message
						id="msg-user-1"
						role="user"
						author="Greg"
						badge="Admin"
						timestamp="20:54"
					>
						<p>
							Investigate why deep links to <code class="font-mono">/w/rsynapse/trailside/board</code>
							lose their return path after GitHub OAuth sign-in, and patch the callback handler.
						</p>
					</Message>

					<!-- Assistant Claude Code Stream -->
					<Message
						id="msg-agent-1"
						role="assistant"
						author={activeAgent.label}
						badge="{activeAgent.version} · studio-mac"
						timestamp="20:55"
					>
						<!-- 1. Collapsible AgentActivity Trace -->
						<AgentActivity
							items={INITIAL_ACTIVITY}
							status="complete"
							durationSeconds={6}
						/>

						<!-- 2. Collapsible TodoList Plan -->
						<TodoList title="Implementation plan" items={todoItems} />

						<!-- 3. Inline Unified FileDiff -->
						<FileDiff
							filename="apps/web/src/routes/auth/callback/+server.ts"
							patch={CALLBACK_DIFF_PATCH}
						/>

						<!-- 4. Worktree Checkpoint -->
						<AgentCheckpoint checkpoint={CHECKPOINT_ENTRY} />

						<!-- 5. Interactive ToolApproval -->
						<ToolApproval
							tool="Bash"
							summary="corepack pnpm --filter @trailside/web test tests/auth-callback.test.ts"
							params={TOOL_APPROVAL_PARAMS}
							status={approvalStatus}
							onApprove={handleToolApprove}
							onAlwaysApprove={handleToolApprove}
							onDeny={() => (approvalStatus = 'denied')}
						/>

						<!-- 6. Live ToolResult Output (shown when approved or by default below) -->
						{#if approvalStatus === 'approved'}
							<ToolResult
								tool="Bash"
								summary="tests/auth-callback.test.ts"
								output={terminalOutput}
								status="success"
								meta="193ms"
							/>
						{/if}

						<!-- 7. Interactive Multi-Step ApprovalCard Question -->
						<ApprovalCard
							title="Confirm deep-link redirect fallback policy"
							description="The callback route now sanitizes relative return paths. Choose how query strings should be handled."
							questions={APPROVAL_QUESTIONS}
							onSubmit={handleDecisionSubmit}
						/>

						<!-- 8. StreamingResponse with Citations -->
						<StreamingResponse
							status="complete"
							copyText="Patched verifyCallback in apps/web/src/routes/auth/callback/+server.ts to preserve sanitized relative returnTo paths."
							sources={CITATION_SOURCES}
						>
							<p>
								I traced the redirect regression to <code class="font-mono">verifyCallback</code> in
								<code class="font-mono">apps/web/src/routes/auth/callback/+server.ts</code>, which
								was unconditionally redirecting to <code class="font-mono">/login</code> instead of
								reading the sanitized <code class="font-mono">next</code> parameter.
							</p>
							{#if decisionSummary}
								<p class="font-medium text-status-success">
									<Check aria-hidden="true" />
									Applied policy: {decisionSummary}
								</p>
							{/if}
						</StreamingResponse>
					</Message>

					<!-- Dynamic User & Assistant Messages appended via PromptInput -->
					{#each extraMessages as msg (msg.id)}
						<Message
							id={msg.id}
							role={msg.role}
							author={msg.author}
							badge={msg.badge}
							timestamp={msg.timestamp}
						>
							{#if msg.activityItems}
								<AgentActivity items={msg.activityItems} status="complete" />
							{/if}
							<p>{msg.text}</p>
						</Message>
					{/each}
				</MessageScroller>

				<!-- Bottom Composer -->
				<div class="relative px-4 pt-1 pb-4 sm:px-8">
					<div aria-hidden="true" class="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-chat-surface to-transparent"></div>
					<PromptInput
						class="mx-auto max-w-3xl"
						bind:value={promptText}
						busy={isAgentWorking}
						agents={SUPPORTED_AGENTS}
						{selectedAgentId}
						onAgentChange={(id) => (selectedAgentId = id)}
						onSubmit={handlePromptSubmit}
						onStop={() => (isAgentWorking = false)}
					/>
				</div>
			{:else if activeTab === 'changes'}
				<div class="grid flex-1 gap-4 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
					<div class="space-y-3">
						<h2 class="text-sm font-semibold text-fg-main">Changed Files in Worktree</h2>
						<FileTree
							nodes={WORKTREE_FILES}
							selectedPath={selectedFile}
							onSelect={(path) => (selectedFile = path)}
						/>
					</div>
					<div class="space-y-4">
						<FileDiff
							filename={selectedFile}
							patch={selectedFile.includes('test') ? TEST_DIFF_PATCH : CALLBACK_DIFF_PATCH}
						/>
						<CodeBlock
							filename="apps/web/src/routes/auth/callback/+server.ts"
							language="typescript"
							highlightLines={[4, 5, 6]}
							code={[
								'import { redirect } from "@sveltejs/kit";',
								'import { sanitizeReturnTo } from "$lib/server/auth/return-to";',
								'',
								'export async function verifyCallback(url: URL) {',
								'  const code = url.searchParams.get("code");',
								'  const next = sanitizeReturnTo(url.searchParams.get("next"));',
								'  if (!code) return redirect(303, "/login?error=missing_code");',
								'  return redirect(303, next);',
								'}'
							].join('\n')}
						/>
					</div>
				</div>
			{:else if activeTab === 'checks'}
				<div class="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
					<TestResults suites={TEST_SUITES} durationMs={193} />
					<Terminal
						output={terminalOutput}
						onClear={() => (terminalOutput = '$ # Terminal cleared')}
					/>
				</div>
			{:else if activeTab === 'catalog'}
				<div class="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
					<div>
						<h2 class="text-lg font-bold text-fg-main">
							agents-kit to Svelte 5 Port & Evaluation
						</h2>
						<p class="mt-1 text-xs text-fg-light">
							Side-by-side mapping of <code class="font-mono">agents-ui/agents-kit</code> React
							primitives to Svelte 5 Runes (<code class="font-mono">$props()</code>,
							<code class="font-mono">$state()</code>, <code class="font-mono">$derived()</code>,
							<code class="font-mono">$effect()</code>) and Trailside's domain.
						</p>
					</div>

					<!-- Live Loading & Shimmer Primitives Showcase -->
					<div class="grid gap-3 rounded-soft border border-chat-border bg-card-bg ak-shadow-soft-sm p-4 sm:grid-cols-3">
						<div>
							<p class="text-[11px] capitalize text-fg-light font-medium">ThinkingShimmer</p>
							<div class="mt-2">
								<ThinkingShimmer label="Analyzing worktree diff…" spark />
							</div>
						</div>
						<div>
							<p class="text-[11px] capitalize text-fg-light font-medium">AgentProgress</p>
							<div class="mt-2">
								<AgentProgress label="Running checks" initialSeconds={4.2} />
							</div>
						</div>
						<div>
							<p class="text-[11px] capitalize text-fg-light font-medium">ReasoningText</p>
							<div class="mt-2">
								<ReasoningText />
							</div>
						</div>
					</div>

					<!-- Evaluation Table -->
					<div class="overflow-x-auto rounded-soft border border-chat-border bg-card-bg ak-shadow-soft-sm">
						<table class="w-full border-collapse text-left text-xs">
							<thead>
								<tr class="border-b border-chat-border/70 bg-chat-surface text-fg-light">
									<th class="px-3 py-2.5 font-semibold">Primitive Family</th>
									<th class="px-3 py-2.5 font-semibold">Upstream React Source</th>
									<th class="px-3 py-2.5 font-semibold">Svelte 5 Port</th>
									<th class="px-3 py-2.5 font-semibold">Trailside Integration Fit</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-chat-border/70">
								{#each EVALUATION_MATRIX as row (row.family)}
									<tr>
										<td class="px-3 py-2.5 font-semibold text-fg-main">{row.family}</td>
										<td class="px-3 py-2.5 font-mono text-[11px] text-fg-light">{row.upstream}</td>
										<td class="px-3 py-2.5 font-mono text-[11px] text-accent-primary">
											{row.sveltePort}
										</td>
										<td class="px-3 py-2.5 text-fg-main">{row.trailsideFit}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<Citations citations={CITATION_SOURCES} defaultOpen={true} />
				</div>
			{/if}
		</main>
	</div>
</div>
