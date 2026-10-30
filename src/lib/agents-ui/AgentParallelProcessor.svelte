<script lang="ts">
	export type ParallelLaneStatus = 'waiting' | 'processing' | 'done' | 'error';

	export interface ParallelLane {
		id: string;
		label: string;
		agentName: string;
		worktree?: string;
		status: ParallelLaneStatus;
		progress: number;
		output?: string;
		tokens?: number;
	}

	interface Props {
		taskDescription?: string;
		lanes?: ParallelLane[];
		mergeStatus?: 'idle' | 'merging' | 'complete';
		mergedOutput?: string;
		totalTokens?: number;
		totalCost?: string;
		onStartAll?: () => void;
		onCancelAll?: () => void;
		onRetryFailed?: () => void;
		onRetryLane?: (laneId: string) => void;
		class?: string;
	}

	const defaultLanes: ParallelLane[] = [
		{
			id: 'lane-contracts',
			label: 'Contract Schema Export & Diff',
			agentName: 'Claude Code Worker A',
			worktree: 'wt/contracts-check',
			status: 'done',
			progress: 100,
			output: 'Exported 14 JSON schemas with zero breaking wire changes.',
			tokens: 3420
		},
		{
			id: 'lane-domain',
			label: 'Domain Idempotency Unit Suite',
			agentName: 'Claude Code Worker B',
			worktree: 'wt/domain-tests',
			status: 'processing',
			progress: 72,
			output: 'Running 48 domain replay assertions across SQLite fixture states…',
			tokens: 5180
		},
		{
			id: 'lane-companion',
			label: 'Companion Bun Daemon Probe',
			agentName: 'Codex Worker C',
			worktree: 'wt/companion-probe',
			status: 'processing',
			progress: 45,
			output: 'Verifying direct argv probe bounds and timeout enforcement.',
			tokens: 2890
		},
		{
			id: 'lane-ui-audit',
			label: 'Svelte 5 Runes & Token Audit',
			agentName: 'Gemini Flash Worker D',
			worktree: 'wt/svelte5-audit',
			status: 'waiting',
			progress: 0,
			tokens: 0
		}
	];

	let {
		taskDescription = 'Execute concurrent worktree verification lanes and merge into a unified referee report.',
		lanes = defaultLanes,
		mergeStatus = 'merging',
		mergedOutput = '1 of 4 lanes complete · Aggregating contract and domain test artifacts.',
		totalTokens,
		totalCost,
		onStartAll,
		onCancelAll,
		onRetryFailed,
		onRetryLane,
		class: className = ''
	}: Props = $props();

	let localLanes = $state<ParallelLane[]>([]);
	let openLaneIds = $state<Record<string, boolean>>({ 'lane-contracts': true });

	$effect(() => {
		localLanes = lanes.map((lane) => ({ ...lane }));
	});

	let computedTokens = $derived(
		totalTokens ?? localLanes.reduce((sum, lane) => sum + (lane.tokens ?? 0), 0)
	);

	let computedCost = $derived(totalCost ?? `$${(computedTokens * 0.000015).toFixed(2)}`);

	let failedCount = $derived(localLanes.filter((lane) => lane.status === 'error').length);

	/**
	 * Returns a human-readable label for a parallel lane status.
	 *
	 * @param status - Parallel lane status value.
	 * @returns Display status text.
	 */
	function getLaneStatusLabel(status: ParallelLaneStatus): string {
		switch (status) {
			case 'processing':
				return 'Running';
			case 'done':
				return 'Complete';
			case 'error':
				return 'Failed';
			default:
				return 'Waiting';
		}
	}

	/**
	 * Returns semantic badge classes for a parallel lane status.
	 *
	 * @param status - Parallel lane status value.
	 * @returns Tailwind class string.
	 */
	function getLaneBadgeClasses(status: ParallelLaneStatus): string {
		switch (status) {
			case 'processing':
				return 'bg-accent-subtle text-accent-primary';
			case 'done':
				return 'bg-status-success-subtle text-status-success';
			case 'error':
				return 'bg-status-danger-subtle text-status-danger';
			default:
				return 'bg-canvas-secondary text-fg-light';
		}
	}

	/**
	 * Toggles the output drawer for a specific parallel lane.
	 *
	 * @param laneId - Lane identifier to toggle.
	 */
	function toggleLaneOutput(laneId: string): void {
		openLaneIds = {
			...openLaneIds,
			[laneId]: !openLaneIds[laneId]
		};
	}

	/**
	 * Starts all waiting lanes and invokes the optional callback.
	 */
	function handleStartAll(): void {
		localLanes = localLanes.map((lane) =>
			lane.status === 'waiting'
				? { ...lane, status: 'processing', progress: Math.max(lane.progress, 20) }
				: lane
		);
		onStartAll?.();
	}

	/**
	 * Cancels active lanes back to waiting state and invokes the optional callback.
	 */
	function handleCancelAll(): void {
		localLanes = localLanes.map((lane) =>
			lane.status === 'processing' ? { ...lane, status: 'waiting' } : lane
		);
		onCancelAll?.();
	}

	/**
	 * Retries all failed lanes and invokes the optional callback.
	 */
	function handleRetryFailed(): void {
		localLanes = localLanes.map((lane) =>
			lane.status === 'error' ? { ...lane, status: 'processing', progress: 15 } : lane
		);
		onRetryFailed?.();
	}

	/**
	 * Retries a single lane by identifier.
	 *
	 * @param laneId - Identifier of the lane to retry.
	 */
	function handleRetryLane(laneId: string): void {
		localLanes = localLanes.map((lane) =>
			lane.id === laneId ? { ...lane, status: 'processing', progress: 25 } : lane
		);
		onRetryLane?.(laneId);
	}
</script>

<section
	aria-label="Parallel worker pool monitor"
	class="w-full overflow-hidden rounded-xl border border-card-border bg-card-bg text-sm {className}"
>
	<header
		class="flex flex-col gap-3 border-b border-canvas-border p-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<p class="font-mono text-xs font-medium text-fg-light">Parallel Worker Pool</p>
			<h2 class="mt-0.5 text-base font-semibold text-fg-main">Concurrent Worktree Lanes</h2>
			<p class="mt-0.5 max-w-2xl text-xs text-fg-light">{taskDescription}</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={handleStartAll}
				class="rounded-lg bg-accent-primary px-3 py-1.5 text-xs font-medium text-fg-inverse transition-opacity hover:opacity-90"
			>
				▶ Start all
			</button>
			<button
				type="button"
				onclick={handleCancelAll}
				class="rounded-lg border border-card-border bg-canvas-primary px-3 py-1.5 text-xs font-medium text-fg-main transition-colors hover:bg-canvas-secondary"
			>
				✕ Cancel
			</button>
			{#if failedCount > 0}
				<button
					type="button"
					onclick={handleRetryFailed}
					class="rounded-lg bg-status-danger-subtle px-3 py-1.5 text-xs font-medium text-status-danger"
				>
					↻ Retry failed ({failedCount})
				</button>
			{/if}
		</div>
	</header>

	<ol class="divide-y divide-canvas-border">
		{#each localLanes as lane, index (lane.id)}
			{@const isOutputOpen = Boolean(openLaneIds[lane.id])}
			<li class="px-4 py-3">
				<div class="flex items-start gap-3">
					<span class="w-6 pt-0.5 font-mono text-xs tabular-nums text-fg-light">
						{String(index + 1).padStart(2, '0')}
					</span>

					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-2">
							<h3 class="font-medium text-fg-main">{lane.label}</h3>
							<span class="text-xs text-fg-light">· {lane.agentName}</span>
							{#if lane.worktree}
								<code
									class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px] text-fg-main"
								>
									{lane.worktree}
								</code>
							{/if}
							<span
								class="rounded-full px-2 py-0.5 text-[11px] font-medium {getLaneBadgeClasses(
									lane.status
								)}"
							>
								{getLaneStatusLabel(lane.status)}
							</span>
						</div>

						<div class="mt-2 flex items-center gap-3">
							<div
								role="progressbar"
								aria-label="{lane.label} progress"
								aria-valuenow={lane.progress}
								aria-valuemin={0}
								aria-valuemax={100}
								class="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas-secondary"
							>
								<span
									class="block h-full rounded-full transition-all {lane.status === 'done'
										? 'bg-status-success'
										: lane.status === 'error'
											? 'bg-status-danger'
											: 'bg-accent-primary'}"
									style="width: {lane.progress}%;"
								></span>
							</div>
							<span class="font-mono text-xs tabular-nums text-fg-light">{lane.progress}%</span>
							{#if lane.tokens !== undefined}
								<span class="font-mono text-xs tabular-nums text-fg-light">
									{lane.tokens.toLocaleString()} tokens
								</span>
							{/if}
						</div>

						{#if lane.output}
							<div class="mt-2">
								<button
									type="button"
									aria-expanded={isOutputOpen}
									onclick={() => toggleLaneOutput(lane.id)}
									class="flex items-center gap-1 text-xs text-fg-light hover:text-fg-main"
								>
									<span>{isOutputOpen ? '▾' : '▸'}</span>
									<span>Lane output</span>
								</button>
								{#if isOutputOpen}
									<p
										class="mt-1.5 rounded-lg border border-canvas-border bg-canvas-primary p-2.5 font-mono text-xs text-fg-light"
									>
										{lane.output}
									</p>
								{/if}
							</div>
						{/if}
					</div>

					{#if lane.status === 'error'}
						<button
							type="button"
							onclick={() => handleRetryLane(lane.id)}
							class="rounded-lg border border-card-border bg-canvas-primary px-2.5 py-1 text-xs font-medium text-fg-main hover:bg-canvas-secondary"
						>
							↻ Retry
						</button>
					{/if}
				</div>
			</li>
		{/each}
	</ol>

	<footer class="border-t border-canvas-border p-4">
		<div class="rounded-lg border border-canvas-border bg-canvas-primary p-3">
			<div class="flex items-center justify-between gap-2 text-xs">
				<span class="font-semibold text-fg-main">Fan-in Merge Collector</span>
				<span
					class="rounded-full px-2 py-0.5 text-[11px] font-medium {mergeStatus === 'complete'
						? 'bg-status-success-subtle text-status-success'
						: mergeStatus === 'merging'
							? 'bg-accent-subtle text-accent-primary'
							: 'bg-canvas-secondary text-fg-light'}"
				>
					{mergeStatus === 'complete'
						? 'Ready'
						: mergeStatus === 'merging'
							? 'Merging lanes'
							: 'Waiting'}
				</span>
			</div>
			{#if mergedOutput}
				<p class="mt-1.5 text-xs text-fg-light">{mergedOutput}</p>
			{/if}
		</div>

		<div class="mt-3 flex flex-wrap items-center gap-4 font-mono text-xs text-fg-light">
			<span>{localLanes.length} parallel lanes</span>
			<span>{computedTokens.toLocaleString()} tokens</span>
			<span>{computedCost}</span>
		</div>
	</footer>
</section>
