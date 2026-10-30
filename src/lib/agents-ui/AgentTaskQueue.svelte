<script lang="ts">
	export type AgentTaskStatus =
		| 'queued'
		| 'running'
		| 'completed'
		| 'failed'
		| 'blocked'
		| 'paused';

	export type AgentTaskPriority = 'low' | 'medium' | 'high';

	export interface AgentTaskTimelineEvent {
		id: string;
		title: string;
		status: 'pending' | 'active' | 'completed';
		timestamp?: string;
	}

	export interface AgentTask {
		id: string;
		title: string;
		description?: string;
		status: AgentTaskStatus;
		progress?: number;
		priority?: AgentTaskPriority;
		updatedLabel?: string;
		estimatedDuration?: string;
		tool?: string;
		checkpoints?: AgentTaskTimelineEvent[];
		metrics?: { tokens?: number; cost?: string; confidence?: number };
	}

	interface Props {
		tasks?: AgentTask[];
		activeTaskId?: string | null;
		autoStart?: boolean;
		concurrencyLimit?: number;
		isProcessing?: boolean;
		showTimeline?: boolean;
		timestamp?: string;
		onStartTask?: (taskId: string) => void;
		onPauseTask?: (taskId: string) => void;
		onResumeTask?: (taskId: string) => void;
		onCancelTask?: (taskId: string) => void;
		onReorder?: (taskIds: string[]) => void;
		onToggleAutoStart?: (value: boolean) => void;
		onClearCompleted?: () => void;
		onAddTask?: () => void;
		class?: string;
	}

	const defaultTasks: AgentTask[] = [
		{
			id: 'task-191',
			title: 'Card 191 · Outbox Idempotency Replay Guard',
			description: 'Verify reauthorization happens prior to idempotency key lookup.',
			status: 'running',
			progress: 68,
			priority: 'high',
			tool: 'Claude Code · wt/card-191',
			updatedLabel: 'Updated 1m ago',
			estimatedDuration: '2m remaining',
			checkpoints: [
				{ id: 'cp-1', title: 'Create isolated git worktree', status: 'completed', timestamp: '14:01' },
				{ id: 'cp-2', title: 'Run domain replay unit suite', status: 'active', timestamp: '14:03' },
				{ id: 'cp-3', title: 'Export G0 JSON schemas', status: 'pending' }
			],
			metrics: { tokens: 18400, cost: '$0.06', confidence: 0.94 }
		},
		{
			id: 'task-194',
			title: 'Card 194 · SSR Interaction Readiness Audit',
			description: 'Ensure filter buttons preserve pre-hydration state across /w routes.',
			status: 'queued',
			priority: 'high',
			tool: 'Claude Code · wt/card-194',
			updatedLabel: 'Next in queue'
		},
		{
			id: 'task-198',
			title: 'Card 198 · Companion CLI Doctor Repair Check',
			description: 'Validate reversible repair checklist reporting to service.',
			status: 'paused',
			progress: 35,
			priority: 'medium',
			tool: 'Codex · wt/card-198',
			updatedLabel: 'Paused for human approval'
		},
		{
			id: 'task-185',
			title: 'Card 185 · M2-Lite Read-Only Board Sync',
			status: 'completed',
			progress: 100,
			priority: 'medium',
			tool: 'Claude Code · wt/card-185',
			updatedLabel: 'Completed 13:45'
		}
	];

	let {
		tasks = defaultTasks,
		activeTaskId = null,
		autoStart = true,
		concurrencyLimit = 2,
		isProcessing = false,
		showTimeline = true,
		timestamp = 'Updated moments ago',
		onStartTask,
		onPauseTask,
		onResumeTask,
		onCancelTask,
		onReorder,
		onToggleAutoStart,
		onClearCompleted,
		onAddTask,
		class: className = ''
	}: Props = $props();

	let localTasks = $state<AgentTask[]>([]);
	let localAutoStart = $state(true);
	let expandedTaskIds = $state<Record<string, boolean>>({ 'task-191': true });

	$effect(() => {
		localTasks = tasks.map((task) => ({ ...task }));
		localAutoStart = autoStart;
	});

	let orderedTasks = $derived(
		activeTaskId
			? [...localTasks].sort((a, b) =>
					a.id === activeTaskId ? -1 : b.id === activeTaskId ? 1 : 0
				)
			: localTasks
	);

	let runningCount = $derived(localTasks.filter((t) => t.status === 'running').length);
	let queuedCount = $derived(localTasks.filter((t) => t.status === 'queued').length);
	let completedCount = $derived(localTasks.filter((t) => t.status === 'completed').length);

	/**
	 * Maps a task status to semantic badge classes.
	 *
	 * @param status - Task queue status.
	 * @returns Tailwind class string.
	 */
	function getTaskStatusClasses(status: AgentTaskStatus): string {
		switch (status) {
			case 'running':
				return 'bg-accent-subtle text-accent-primary';
			case 'completed':
				return 'bg-status-success-subtle text-status-success';
			case 'failed':
				return 'bg-status-danger-subtle text-status-danger';
			case 'blocked':
			case 'paused':
				return 'bg-status-warning-subtle text-status-warning';
			default:
				return 'bg-canvas-secondary text-fg-light';
		}
	}

	/**
	 * Promotes a task to the top of the queue and notifies the reorder callback.
	 *
	 * @param taskId - Task identifier to promote.
	 */
	function handlePromote(taskId: string): void {
		const idx = localTasks.findIndex((t) => t.id === taskId);
		if (idx <= 0) return;
		const copy = [...localTasks];
		const [item] = copy.splice(idx, 1);
		copy.unshift(item);
		localTasks = copy;
		onReorder?.(localTasks.map((t) => t.id));
	}

	/**
	 * Updates a task's status locally and calls the appropriate handler.
	 *
	 * @param taskId - Task identifier.
	 * @param nextStatus - Target status to transition to.
	 */
	function updateTaskStatus(taskId: string, nextStatus: AgentTaskStatus): void {
		localTasks = localTasks.map((t) =>
			t.id === taskId
				? {
						...t,
						status: nextStatus,
						progress: nextStatus === 'running' ? Math.max(t.progress ?? 0, 15) : t.progress
					}
				: t
		);
		if (nextStatus === 'running') onStartTask?.(taskId);
		if (nextStatus === 'paused') onPauseTask?.(taskId);
	}

	/**
	 * Removes completed tasks from the queue.
	 */
	function handleClearCompleted(): void {
		localTasks = localTasks.filter((t) => t.status !== 'completed');
		onClearCompleted?.();
	}
</script>

<section
	aria-label="Prioritized agent task queue"
	class="w-full overflow-hidden rounded-xl border border-card-border bg-card-bg text-sm {className}"
>
	<header
		class="flex flex-col gap-3 border-b border-canvas-border p-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<p class="font-mono text-xs font-medium text-fg-light">Execution Queue</p>
			<h2 class="mt-0.5 text-base font-semibold text-fg-main">Prioritized Worktree Runs</h2>
			<p class="mt-0.5 text-xs text-fg-light">
				Pause, resume, promote, or cancel queued agent runs across connected computers.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={() =>
					onReorder?.(
						localTasks.filter((t) => t.status === 'queued').map((t) => t.id)
					)}
				class="rounded-lg border border-card-border bg-canvas-primary px-3 py-1.5 text-xs font-medium text-fg-main hover:bg-canvas-secondary"
			>
				⇅ Optimize Priority
			</button>
			<button
				type="button"
				onclick={() => onAddTask?.()}
				class="rounded-lg bg-accent-primary px-3 py-1.5 text-xs font-medium text-fg-inverse hover:opacity-90"
			>
				+ Enqueue Run
			</button>
		</div>
	</header>

	<div
		class="flex flex-wrap items-center gap-4 border-b border-canvas-border bg-canvas-primary px-4 py-2.5 font-mono text-xs text-fg-light"
	>
		<span><strong class="text-fg-main">{runningCount}</strong> running</span>
		<span><strong class="text-fg-main">{queuedCount}</strong> queued</span>
		<span><strong class="text-fg-main">{completedCount}</strong> complete</span>
		<span>Concurrency limit: {concurrencyLimit}</span>

		<label class="ml-auto inline-flex cursor-pointer items-center gap-2">
			<input
				type="checkbox"
				checked={localAutoStart}
				onchange={() => {
					localAutoStart = !localAutoStart;
					onToggleAutoStart?.(localAutoStart);
				}}
				class="accent-current text-accent-primary"
			/>
			<span class="text-fg-main">Auto-start next</span>
		</label>
	</div>

	<div class="divide-y divide-canvas-border">
		{#each orderedTasks as task (task.id)}
			{@const isExpanded = Boolean(expandedTaskIds[task.id])}
			<article class="px-4 py-3">
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-2">
							<h3 class="font-medium text-fg-main">{task.title}</h3>
							{#if task.priority}
								<span
									class="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase {task.priority ===
									'high'
										? 'bg-status-danger-subtle text-status-danger'
										: task.priority === 'medium'
											? 'bg-status-warning-subtle text-status-warning'
											: 'bg-canvas-secondary text-fg-light'}"
								>
									{task.priority}
								</span>
							{/if}
							<span
								class="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize {getTaskStatusClasses(
									task.status
								)}"
							>
								{task.status}
							</span>
						</div>

						{#if task.description}
							<p class="mt-1 text-xs text-fg-light">{task.description}</p>
						{/if}

						<div class="mt-1.5 flex flex-wrap gap-3 font-mono text-[11px] text-fg-light">
							{#if task.tool}
								<span>{task.tool}</span>
							{/if}
							{#if task.updatedLabel}
								<span>· {task.updatedLabel}</span>
							{/if}
							{#if task.estimatedDuration}
								<span>· {task.estimatedDuration}</span>
							{/if}
						</div>

						{#if typeof task.progress === 'number'}
							<div class="mt-2.5 flex items-center gap-3">
								<div
									role="progressbar"
									aria-label="{task.title} progress"
									aria-valuemin={0}
									aria-valuemax={100}
									aria-valuenow={task.progress}
									class="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas-secondary"
								>
									<span
										class="block h-full rounded-full {task.status === 'completed'
											? 'bg-status-success'
											: 'bg-accent-primary'}"
										style="width: {Math.max(0, Math.min(100, task.progress))}%;"
									></span>
								</div>
								<span class="font-mono text-xs tabular-nums text-fg-light">{task.progress}%</span>
							</div>
						{/if}
					</div>

					<div class="flex shrink-0 flex-wrap items-center gap-1.5">
						{#if task.status === 'queued'}
							<button
								type="button"
								onclick={() => handlePromote(task.id)}
								class="rounded-lg border border-card-border bg-canvas-primary px-2 py-1 text-xs text-fg-light hover:bg-canvas-secondary hover:text-fg-main"
							>
								↑ Promote
							</button>
							<button
								type="button"
								disabled={isProcessing}
								onclick={() => updateTaskStatus(task.id, 'running')}
								class="rounded-lg border border-card-border bg-canvas-primary px-2.5 py-1 text-xs font-medium text-fg-main hover:bg-canvas-secondary"
							>
								▶ Start
							</button>
						{:else if task.status === 'running'}
							<button
								type="button"
								disabled={isProcessing}
								onclick={() => updateTaskStatus(task.id, 'paused')}
								class="rounded-lg border border-card-border bg-canvas-primary px-2.5 py-1 text-xs font-medium text-fg-main hover:bg-canvas-secondary"
							>
								⏸ Pause
							</button>
						{:else if task.status === 'paused'}
							<button
								type="button"
								disabled={isProcessing}
								onclick={() => {
									updateTaskStatus(task.id, 'running');
									onResumeTask?.(task.id);
								}}
								class="rounded-lg border border-card-border bg-canvas-primary px-2.5 py-1 text-xs font-medium text-fg-main hover:bg-canvas-secondary"
							>
								▶ Resume
							</button>
						{/if}

						{#if task.status !== 'completed'}
							<button
								type="button"
								onclick={() => onCancelTask?.(task.id)}
								class="rounded-lg border border-card-border bg-canvas-primary px-2 py-1 text-xs text-fg-light hover:bg-status-danger-subtle hover:text-status-danger"
							>
								✕
							</button>
						{/if}
					</div>
				</div>

				{#if showTimeline && (task.checkpoints?.length || task.metrics)}
					<div class="mt-2">
						<button
							type="button"
							aria-expanded={isExpanded}
							onclick={() =>
								(expandedTaskIds = {
									...expandedTaskIds,
									[task.id]: !isExpanded
								})}
							class="text-xs text-fg-light hover:text-fg-main"
						>
							{isExpanded ? '▾' : '▸'} Checkpoints & telemetry
						</button>

						{#if isExpanded}
							<div
								class="mt-2 grid gap-3 rounded-lg border border-canvas-border bg-canvas-primary p-3 text-xs sm:grid-cols-2"
							>
								{#if task.checkpoints}
									<ol class="space-y-1.5">
										{#each task.checkpoints as cp (cp.id)}
											<li class="flex items-center justify-between gap-2">
												<span class="text-fg-main">
													{cp.status === 'completed'
														? '✓'
														: cp.status === 'active'
															? '◎'
															: '○'}
													{cp.title}
												</span>
												<span class="font-mono text-[11px] text-fg-light">
													{cp.timestamp ?? cp.status}
												</span>
											</li>
										{/each}
									</ol>
								{/if}
								{#if task.metrics}
									<div class="space-y-1 font-mono text-[11px] text-fg-light">
										{#if task.metrics.tokens !== undefined}
											<p>Tokens: {task.metrics.tokens.toLocaleString()}</p>
										{/if}
										{#if task.metrics.cost}
											<p>Estimated cost: {task.metrics.cost}</p>
										{/if}
										{#if task.metrics.confidence !== undefined}
											<p>Confidence: {Math.round(task.metrics.confidence * 100)}%</p>
										{/if}
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</article>
		{/each}
	</div>

	<footer
		class="flex flex-wrap items-center justify-between gap-3 border-t border-canvas-border bg-canvas-primary px-4 py-3 font-mono text-xs text-fg-light"
	>
		<span>{timestamp} · {localTasks.length} total runs</span>
		{#if completedCount > 0}
			<button
				type="button"
				onclick={handleClearCompleted}
				class="font-sans text-xs font-medium text-accent-primary hover:underline"
			>
				Clear completed ({completedCount})
			</button>
		{/if}
	</footer>
</section>
