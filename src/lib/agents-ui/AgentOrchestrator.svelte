<script lang="ts">
	import { Check, ChevronDown, ChevronRight, LoaderCircle, Pause, Play, RefreshCw } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	import { formatCompactTokens } from '../state/chat-helpers';

	export type SubAgentStatus = 'idle' | 'running' | 'completed' | 'failed';

	export interface SubAgentMetrics {
		tokens?: number;
		budgetTokens?: number;
		cost?: string;
		latency?: string;
	}

	export interface SubAgent {
		id: string;
		name: string;
		role: string;
		model?: string;
		status: SubAgentStatus;
		task: string;
		progress: number;
		metrics?: SubAgentMetrics;
		logs?: string[];
	}

	export interface CommLogEntry {
		id: string;
		timestamp: string;
		from: string;
		to: string;
		message: string;
	}

	interface Props {
		orchestratorName?: string;
		supervisorModel?: string;
		description?: string;
		subAgents?: SubAgent[];
		communicationLog?: CommLogEntry[];
		aggregatedResult?: string;
		isProcessing?: boolean;
		timestamp?: string;
		onStart?: () => void;
		onPauseAll?: () => void;
		onRedistribute?: () => void;
		onRetryAgent?: (agentId: string) => void;
		class?: string;
	}

	const defaultSubAgents: SubAgent[] = [
		{
			id: 'researcher',
			name: 'Repo Explorer',
			role: 'Codebase & Contract Discovery',
			model: 'Claude Code 1.0',
			status: 'completed',
			task: 'Inspect G0 schema definitions and locate outbox transaction boundaries',
			progress: 100,
			metrics: { tokens: 14200, budgetTokens: 20000, cost: '$0.04', latency: '9.4s' },
			logs: [
				'Scanned contracts/g0/src/index.ts and verified envelope versions.',
				'Mapped atomic outbox writer in apps/service/src/db/outbox.ts.',
				'Returned 4 contract invariants to Supervisor.'
			]
		},
		{
			id: 'implementer',
			name: 'Worktree Builder',
			role: 'TDD Patch Implementation',
			model: 'Claude Code 1.0',
			status: 'running',
			task: 'Implement idempotent retry handler before revision check in worktree',
			progress: 68,
			metrics: { tokens: 24800, budgetTokens: 40000, cost: '$0.08', latency: '18.2s' },
			logs: [
				'Created isolated branch trailside/card-191-attempt-1.',
				'Added failing unit test for duplicate idempotency key replay.',
				'Updating domain handler to reauthorize prior to lookup…'
			]
		},
		{
			id: 'verifier',
			name: 'Referee & Verifier',
			role: 'Independent Gate Evaluation',
			model: 'Codex 0.42',
			status: 'idle',
			task: 'Run contract export check and independent acceptance suite',
			progress: 0,
			metrics: { tokens: 0, budgetTokens: 15000, cost: '$0.00', latency: '—' },
			logs: ['Waiting for Worktree Builder handoff before starting referee checks.']
		}
	];

	const defaultCommLog: CommLogEntry[] = [
		{
			id: 'log-1',
			timestamp: '14:02:11',
			from: 'Supervisor',
			to: 'Repo Explorer',
			message: 'Locate all idempotency lookup call sites and verify revision ordering.'
		},
		{
			id: 'log-2',
			timestamp: '14:02:20',
			from: 'Repo Explorer',
			to: 'Supervisor',
			message: 'Found 3 call sites; domain spec requires reauthorization before lookup.'
		},
		{
			id: 'log-3',
			timestamp: '14:02:22',
			from: 'Supervisor',
			to: 'Worktree Builder',
			message: 'Apply TDD patch on branch trailside/card-191-attempt-1 with 40k token budget.'
		}
	];

	let {
		orchestratorName = 'Supervisor Delegation Graph · Card 191',
		supervisorModel = 'Claude Opus 4 Supervisor',
		description = 'Coordinates repository discovery, isolated worktree implementation, and referee verification as one accountable run.',
		subAgents = defaultSubAgents,
		communicationLog = defaultCommLog,
		aggregatedResult = 'Discovery complete. Worktree Builder is validating idempotency replay semantics before Referee verification.',
		isProcessing = true,
		timestamp = 'Updated moments ago',
		onStart,
		onPauseAll,
		onRedistribute,
		onRetryAgent,
		class: className = ''
	}: Props = $props();

	let localAgents = $state<SubAgent[]>([]);
	let localProcessing = $state(true);
	let expandedAgentIds = $state<Record<string, boolean>>({ implementer: true });
	let showCommLog = $state(true);

	$effect(() => {
		localAgents = subAgents.map((agent) => ({ ...agent }));
		localProcessing = isProcessing;
	});

	let overallProgress = $derived(
		localAgents.length > 0
			? Math.round(
					localAgents.reduce((sum, agent) => sum + agent.progress, 0) / localAgents.length
				)
			: 0
	);

	let completedCount = $derived(
		localAgents.filter((agent) => agent.status === 'completed').length
	);

	let totalTokens = $derived(
		localAgents.reduce((sum, agent) => sum + (agent.metrics?.tokens ?? 0), 0)
	);

	let totalBudgetTokens = $derived(
		localAgents.reduce((sum, agent) => sum + (agent.metrics?.budgetTokens ?? 0), 0)
	);

	/**
	 * Maps a subagent execution status to a human-readable label.
	 *
	 * @param status - Current status of the subagent.
	 * @returns Display label string.
	 */
	function getStatusLabel(status: SubAgentStatus): string {
		switch (status) {
			case 'running':
				return 'Running';
			case 'completed':
				return 'Completed';
			case 'failed':
				return 'Failed';
			default:
				return 'Queued';
		}
	}

	/**
	 * Maps a subagent execution status to semantic badge classes.
	 *
	 * @param status - Current status of the subagent.
	 * @returns Semantic Tailwind classes for the badge.
	 */
	function getStatusBadgeClasses(status: SubAgentStatus): string {
		switch (status) {
			case 'running':
				return 'bg-accent-subtle text-accent-primary';
			case 'completed':
				return 'bg-status-success-subtle text-status-success';
			case 'failed':
				return 'bg-status-danger-subtle text-status-danger';
			default:
				return 'bg-canvas-secondary text-fg-light';
		}
	}

	/**
	 * Toggles the expandable subagent log drawer for a specific worker.
	 *
	 * @param agentId - Subagent identifier to toggle.
	 */
	function toggleAgentLogs(agentId: string): void {
		expandedAgentIds = {
			...expandedAgentIds,
			[agentId]: !expandedAgentIds[agentId]
		};
	}

	/**
	 * Starts or resumes the supervisor run and invokes the optional callback.
	 */
	function handleStart(): void {
		localProcessing = true;
		onStart?.();
	}

	/**
	 * Pauses active subagents and invokes the optional callback.
	 */
	function handlePauseAll(): void {
		localProcessing = false;
		onPauseAll?.();
	}

	/**
	 * Rebalances subagent token budgets and invokes the optional callback.
	 */
	function handleRedistribute(): void {
		localAgents = localAgents.map((agent) =>
			agent.status === 'idle'
				? { ...agent, status: 'running', progress: Math.max(agent.progress, 15) }
				: agent
		);
		onRedistribute?.();
	}

	/**
	 * Retries a failed subagent and invokes the optional callback.
	 *
	 * @param agentId - Identifier of the subagent to retry.
	 */
	function handleRetry(agentId: string): void {
		localAgents = localAgents.map((agent) =>
			agent.id === agentId ? { ...agent, status: 'running', progress: 25 } : agent
		);
		onRetryAgent?.(agentId);
	}
</script>

<section
	aria-label="Agent orchestrator"
	class="w-full overflow-hidden rounded-xl border border-card-border bg-card-bg text-sm {className}"
>
	<header
		class="flex flex-col gap-3 border-b border-canvas-border p-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<div class="flex flex-wrap items-center gap-2">
				<span
					class="rounded bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] font-medium text-fg-light"
				>
					{supervisorModel}
				</span>
				<span
					class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {localProcessing
						? 'bg-accent-subtle text-accent-primary'
						: 'bg-status-success-subtle text-status-success'}"
				>
					{#if localProcessing}<LoaderCircle aria-hidden="true" class="animate-spin" />Delegation active{:else}<Check aria-hidden="true" />Run paused / complete{/if}
				</span>
			</div>
			<h2 class="mt-1.5 text-base font-semibold text-fg-main">{orchestratorName}</h2>
			<p class="mt-0.5 max-w-2xl text-xs leading-relaxed text-fg-light">{description}</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				disabled={localProcessing}
				onclick={handleStart}
				class={buttonClass('primary', 'md')}
			>
				<Play aria-hidden="true" />
				Start
			</button>
			<button
				type="button"
				onclick={handlePauseAll}
				class={buttonClass('secondary', 'md')}
			>
				<Pause aria-hidden="true" />
				Pause all
			</button>
			<button
				type="button"
				onclick={handleRedistribute}
				class={buttonClass('secondary', 'md')}
			>
				<RefreshCw aria-hidden="true" />
				Rebalance
			</button>
		</div>
	</header>

	<div class="border-b border-canvas-border bg-canvas-primary px-4 py-3">
		<div class="flex flex-wrap items-center justify-between gap-2 text-xs text-fg-light">
			<span>
				<strong class="font-medium text-fg-main">{completedCount}</strong> of {localAgents.length} subagents
				complete
			</span>
			<span class="font-mono tabular-nums">
				Token budget: {formatCompactTokens(totalTokens)}
				{#if totalBudgetTokens > 0}
					/ {formatCompactTokens(totalBudgetTokens)}
				{/if}
				· {overallProgress}%
			</span>
		</div>
		<div
			role="progressbar"
			aria-label="Overall orchestration progress"
			aria-valuenow={overallProgress}
			aria-valuemin={0}
			aria-valuemax={100}
			class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas-secondary"
		>
			<span
				class="block h-full rounded-full bg-accent-primary transition-all duration-300"
				style="width: {overallProgress}%;"
			></span>
		</div>
	</div>

	<div class="divide-y divide-canvas-border">
		{#each localAgents as worker, index (worker.id)}
			{@const isExpanded = Boolean(expandedAgentIds[worker.id])}
			<article class="px-4 py-3">
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-2">
							<span
								class="inline-flex size-5 items-center justify-center rounded-full bg-canvas-secondary font-mono text-[11px] font-semibold text-fg-main"
							>
								{index + 1}
							</span>
							<h3 class="font-medium text-fg-main">{worker.name}</h3>
							<span class="text-xs text-fg-light">· {worker.role}</span>
							{#if worker.model}
								<span
									class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px] text-fg-light"
								>
									{worker.model}
								</span>
							{/if}
							<span
								class="rounded-full px-2 py-0.5 text-[11px] font-medium {getStatusBadgeClasses(
									worker.status
								)}"
							>
								{getStatusLabel(worker.status)}
							</span>
						</div>

						<p class="mt-1 text-xs text-fg-light">{worker.task}</p>

						<div class="mt-2.5 flex items-center gap-3">
							<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas-secondary">
								<span
									class="block h-full rounded-full transition-all {worker.status === 'completed'
										? 'bg-status-success'
										: worker.status === 'failed'
											? 'bg-status-danger'
											: 'bg-accent-primary'}"
									style="width: {worker.progress}%;"
								></span>
							</div>
							<span class="font-mono text-xs tabular-nums text-fg-light">{worker.progress}%</span>
						</div>

						{#if worker.metrics}
							<div class="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] text-fg-light">
								{#if worker.metrics.tokens !== undefined}
									<span>
										{worker.metrics.tokens.toLocaleString()}
										{#if worker.metrics.budgetTokens}
											/ {worker.metrics.budgetTokens.toLocaleString()}
										{/if}
										tokens
									</span>
								{/if}
								{#if worker.metrics.cost}
									<span>{worker.metrics.cost}</span>
								{/if}
								{#if worker.metrics.latency}
									<span>Latency {worker.metrics.latency}</span>
								{/if}
							</div>
						{/if}
					</div>

					<div class="flex shrink-0 items-center gap-2">
						{#if worker.status === 'failed'}
							<button
								type="button"
								onclick={() => handleRetry(worker.id)}
								class={buttonClass('secondary', 'sm')}
							>
								<RefreshCw aria-hidden="true" />
								Retry
							</button>
						{/if}
						{#if worker.logs && worker.logs.length > 0}
							<button
								type="button"
								aria-expanded={isExpanded}
								onclick={() => toggleAgentLogs(worker.id)}
								class={buttonClass('secondary', 'sm')}
							>
								Logs ({worker.logs.length}) <ChevronDown aria-hidden="true" class="size-3.5 transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}" />
							</button>
						{/if}
					</div>
				</div>

				{#if isExpanded && worker.logs && worker.logs.length > 0}
					<ul
						class="mt-2.5 space-y-1 rounded-lg border border-canvas-border bg-canvas-primary p-2.5 font-mono text-xs text-fg-light"
					>
						{#each worker.logs as logLine, logIdx (`${worker.id}-log-${logIdx}`)}
							<li class="flex items-start gap-2">
								<span class="text-accent-primary">›</span>
								<span>{logLine}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</article>
		{/each}
	</div>

	<div class="border-t border-canvas-border p-4">
		<div class="rounded-lg border border-canvas-border bg-canvas-primary p-3">
			<p class="text-xs font-semibold text-fg-main">Supervisor Synthesis</p>
			<p class="mt-1 text-xs leading-relaxed text-fg-light">{aggregatedResult}</p>
		</div>

		<div class="mt-3">
			<button
				type="button"
				aria-expanded={showCommLog}
				onclick={() => (showCommLog = !showCommLog)}
				class={buttonClass('ghost', 'sm')}
			>
				<ChevronRight aria-hidden="true" class="size-3.5 transition-transform duration-200 {showCommLog ? 'rotate-90' : ''}" />
				<span>Handoff communication log ({communicationLog.length})</span>
			</button>

			{#if showCommLog}
				<ol
					class="mt-2 divide-y divide-canvas-border rounded-lg border border-canvas-border bg-canvas-primary px-3"
				>
					{#each communicationLog as entry (entry.id)}
						<li class="grid gap-1 py-2 text-xs sm:grid-cols-[4.5rem_11rem_1fr]">
							<time class="font-mono text-fg-light">{entry.timestamp}</time>
							<span class="font-medium text-fg-main">
								{entry.from} → {entry.to}
							</span>
							<span class="text-fg-light">{entry.message}</span>
						</li>
					{/each}
				</ol>
			{/if}
		</div>

		<footer
			class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-canvas-border pt-3 font-mono text-xs text-fg-light"
		>
			<span>{localAgents.length} subagents · {totalTokens.toLocaleString()} total tokens</span>
			<span>{timestamp}</span>
		</footer>
	</div>
</section>
