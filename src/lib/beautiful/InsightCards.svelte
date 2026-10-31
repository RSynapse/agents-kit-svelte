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
	 * Builds an SVG polyline and area polygon coordinate string from a numeric series.
	 *
	 * @param series - Raw numeric values.
	 * @returns SVG polyline points, area points, and peak point coordinates.
	 */
	function buildSparkline(series: number[] = []): {
		linePoints: string;
		areaPoints: string;
		peakX: number;
		peakY: number;
	} {
		if (series.length === 0) {
			return { linePoints: '', areaPoints: '', peakX: 0, peakY: 0 };
		}
		const width = 220;
		const height = 44;
		const max = Math.max(...series);
		const min = Math.min(...series);
		const range = max - min || 1;
		let peakX = 0;
		let peakY = height;

		const coords = series.map((val, idx) => {
			const x = series.length === 1 ? width / 2 : (idx / (series.length - 1)) * (width - 8) + 4;
			const y = height - 6 - ((val - min) / range) * (height - 14);
			if (val === max) {
				peakX = x;
				peakY = y;
			}
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		});

		const linePoints = coords.join(' ');
		const areaPoints = `4,${height} ${linePoints} ${width - 4},${height}`;
		return { linePoints, areaPoints, peakX, peakY };
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
		{@const spark = buildSparkline(item.series)}
		{@const allocations = normalizeAllocation(item.series)}
		<button
			type="button"
			onclick={() => handleSelect(item.id)}
			class="flex flex-col justify-between overflow-hidden rounded-xl border bg-card-bg p-4 text-left transition-colors {isSelected
				? 'border-accent-primary'
				: 'border-card-border hover:bg-canvas-secondary/40'}"
		>
			<div>
				<div class="flex items-center justify-between gap-2">
					<span class="text-[11px] font-medium text-fg-light capitalize">
						{item.kind}
					</span>
					{#if item.delta}
						<span
							class="rounded-chip px-1.5 py-px font-mono text-[11px] font-medium tabular-nums {item.kind ===
							'anomaly'
								? 'bg-status-danger-subtle text-status-danger'
								: 'bg-status-success-subtle text-status-success'}"
						>
							{item.delta}
						</span>
					{/if}
				</div>

				<h3 class="mt-1.5 text-[13px] font-medium text-fg-main">{item.title}</h3>

				{#if item.value}
					<p class="mt-1.5 text-2xl font-semibold tracking-tight text-fg-main tabular-nums">
						{item.value}
					</p>
				{/if}

				<p class="mt-1 text-xs leading-relaxed text-fg-light">{item.description}</p>
			</div>

			{#if item.kind === 'allocation' && allocations.length > 0}
				<div class="mt-4 space-y-2">
					<div class="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-canvas-secondary">
						{#each allocations as widthPct, idx (idx)}
							<span
								style="width: {widthPct}%"
								class="h-full first:rounded-l-full last:rounded-r-full {idx === 0
									? 'bg-accent-primary'
									: idx === 1
										? 'bg-status-success'
										: 'bg-status-warning'}"
							></span>
						{/each}
					</div>
					<div class="flex items-center justify-between font-mono text-[10px] text-fg-light tabular-nums">
						<span class="inline-flex items-center gap-1">
							<span class="size-1.5 rounded-full bg-accent-primary"></span>
							System {allocations[0] ?? 0}%
						</span>
						<span class="inline-flex items-center gap-1">
							<span class="size-1.5 rounded-full bg-status-success"></span>
							Diff {allocations[1] ?? 0}%
						</span>
						<span class="inline-flex items-center gap-1">
							<span class="size-1.5 rounded-full bg-status-warning"></span>
							Tools {allocations[2] ?? 0}%
						</span>
					</div>
				</div>
			{:else if spark.linePoints}
				<div class="mt-4 rounded-lg bg-canvas-secondary/60 px-2 pt-2 pb-1" aria-hidden="true">
					<svg viewBox="0 0 220 44" class="h-11 w-full overflow-visible">
						<polygon
							points={spark.areaPoints}
							class={item.kind === 'anomaly'
								? 'fill-status-danger/12'
								: 'fill-accent-primary/12'}
						/>
						<polyline
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							points={spark.linePoints}
							class={item.kind === 'anomaly' ? 'text-status-danger' : 'text-accent-primary'}
						/>
						<circle
							cx={spark.peakX}
							cy={spark.peakY}
							r="3.2"
							class={item.kind === 'anomaly' ? 'fill-status-danger' : 'fill-accent-primary'}
						/>
					</svg>
				</div>
			{/if}
		</button>
	{/each}
</div>
