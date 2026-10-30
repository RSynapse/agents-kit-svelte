<script lang="ts">
	export type InsightKind = 'compare' | 'anomaly' | 'allocation';

	export interface InsightCard {
		id: string;
		title: string;
		description: string;
		value?: string;
		delta?: string;
		kind: InsightKind;
		series?: number[];
	}

	interface Props {
		insights?: InsightCard[];
		onSelect?: (id: string) => void;
		class?: string;
	}

	const DEFAULT_INSIGHTS: InsightCard[] = [
		{
			id: 'ins-pass-rate',
			title: 'First-pass Referee Acceptance',
			value: '94.2%',
			delta: '+6.4%',
			kind: 'compare',
			description: 'T2 worktree runs passing automated checks without human send-back.',
			series: [78, 82, 85, 89, 91, 94]
		},
		{
			id: 'ins-latency',
			title: 'Worktree Cold-start Spike',
			value: '1.8s',
			delta: 'Anomaly',
			kind: 'anomaly',
			description: 'Peak worktree checkout latency observed during concurrent contract regeneration.',
			series: [12, 14, 13, 42, 15, 14]
		},
		{
			id: 'ins-tokens',
			title: 'Context Window Allocation',
			value: '68.4k',
			delta: '34% used',
			kind: 'allocation',
			description: 'Distribution across system prompt, repository diff, and tool transcripts.',
			series: [22, 48, 30]
		}
	];

	let {
		insights = DEFAULT_INSIGHTS,
		onSelect,
		class: className = ''
	}: Props = $props();

	let selectedId = $state<string | null>(null);

	/**
	 * Converts a numeric series into normalized bar height percentages (15%..100%).
	 *
	 * @param series - Raw numeric values.
	 * @returns Array of normalized percentages.
	 */
	function normalizeBars(series: number[] = []): number[] {
		if (series.length === 0) return [];
		const max = Math.max(...series);
		const min = Math.min(...series);
		const range = max - min || 1;
		return series.map((val) => Math.round(18 + ((val - min) / range) * 82));
	}

	/**
	 * Computes proportional width percentages for an allocation bar.
	 *
	 * @param series - Raw allocation segments.
	 * @returns Array of percentage widths summing to 100.
	 */
	function normalizeAllocation(series: number[] = []): number[] {
		const total = series.reduce((sum, v) => sum + Math.max(0, v), 0) || 1;
		return series.map((v) => Math.round((Math.max(0, v) / total) * 100));
	}

	/**
	 * Selects an insight card and notifies the parent callback.
	 *
	 * @param id - Insight card identifier.
	 */
	function handleSelect(id: string): void {
		selectedId = id;
		onSelect?.(id);
	}
</script>

<div class="grid gap-3 md:grid-cols-3 {className}">
	{#each insights as item (item.id)}
		{@const isSelected = selectedId === item.id}
		{@const bars = normalizeBars(item.series)}
		{@const allocations = normalizeAllocation(item.series)}
		{@const maxIndex = item.series ? item.series.indexOf(Math.max(...item.series)) : -1}
		<button
			type="button"
			onclick={() => handleSelect(item.id)}
			class="flex flex-col justify-between rounded-xl border p-4 text-left transition-colors {isSelected
				? 'border-accent-primary bg-accent-subtle'
				: 'border-card-border bg-card-bg hover:bg-canvas-secondary'}"
		>
			<div>
				<div class="flex items-center justify-between gap-2">
					<span class="font-mono text-[10px] font-semibold tracking-wider text-fg-light uppercase">
						{item.kind}
					</span>
					{#if item.delta}
						<span
							class="rounded-full px-2 py-0.5 font-mono text-[10px] font-medium {item.kind ===
							'anomaly'
								? 'bg-status-danger-subtle text-status-danger'
								: 'bg-status-success-subtle text-status-success'}"
						>
							{item.delta}
						</span>
					{/if}
				</div>

				<h3 class="mt-1.5 text-xs font-semibold text-fg-main">{item.title}</h3>

				{#if item.value}
					<p class="mt-2 font-mono text-2xl font-bold text-fg-main tabular-nums">
						{item.value}
					</p>
				{/if}

				<p class="mt-1.5 text-xs leading-5 text-fg-light">{item.description}</p>
			</div>

			{#if item.kind === 'allocation' && allocations.length > 0}
				<div class="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-canvas-secondary">
					{#each allocations as widthPct, idx (idx)}
						<span
							style="width: {widthPct}%"
							class="h-full {idx === 0
								? 'bg-accent-primary'
								: idx === 1
									? 'bg-status-success'
									: 'bg-status-warning'}"
						></span>
					{/each}
				</div>
			{:else if bars.length > 0}
				<div class="mt-4 flex h-10 items-end gap-1.5 pt-2" aria-hidden="true">
					{#each bars as heightPct, idx (idx)}
						<span
							style="height: {heightPct}%"
							class="flex-1 rounded-t-xs transition-all {item.kind === 'anomaly' && idx === maxIndex
								? 'bg-status-danger'
								: 'bg-accent-primary opacity-75'}"
						></span>
					{/each}
				</div>
			{/if}
		</button>
	{/each}
</div>
