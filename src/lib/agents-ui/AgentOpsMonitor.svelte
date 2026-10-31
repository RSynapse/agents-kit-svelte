<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Check, ChevronRight, Download, MoveRight, TrendingDown, TrendingUp, TriangleAlert } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	export interface OpsSignal {
		id: string;
		title: string;
		status: 'healthy' | 'warning' | 'critical';
		detail: string;
		owner?: string;
		lastUpdated?: string;
		acknowledged?: boolean;
	}

	export interface OpsServiceMetric {
		label: string;
		value: string;
		threshold: string;
		trend: 'up' | 'down' | 'stable';
	}

	export interface IncidentEvent {
		id: string;
		timestamp: string;
		summary: string;
		actionNeeded?: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'environment' | 'daemonStatus' | 'uptime' | 'signals' | 'metrics' | 'incidents' | 'onAcknowledge' | 'onEscalate' | 'onExportReport'> {
		environment?: string;
		daemonStatus?: 'Connected' | 'Degraded' | 'Offline';
		uptime?: string;
		signals?: OpsSignal[];
		metrics?: OpsServiceMetric[];
		incidents?: IncidentEvent[];
		onAcknowledge?: (signal: OpsSignal) => void;
		onEscalate?: (signal: OpsSignal) => void;
		onExportReport?: () => void;
		class?: string;
	}

	let {
		environment,
		daemonStatus = 'Connected',
		uptime,
		signals = [],
		metrics = [],
		incidents = [],
		onAcknowledge,
		onEscalate,
		onExportReport,
		class: className = '',
		...rest
	}: Props = $props();

	let localSignals = $state<OpsSignal[]>([]);
	let showEvents = $state(true);

	$effect(() => {
		localSignals = signals.map((item) => ({ ...item }));
	});

	/**
	 * Maps an operational signal status to semantic badge classes.
	 *
	 * @param status - Signal health status.
	 * @returns Semantic Tailwind classes.
	 */
	function getSignalBadgeClasses(status: OpsSignal['status']): string {
		switch (status) {
			case 'healthy':
				return 'bg-status-success-subtle text-status-success';
			case 'warning':
				return 'bg-status-warning-subtle text-status-warning';
			case 'critical':
				return 'bg-status-danger-subtle text-status-danger';
		}
	}

	/**
	 * Marks a signal as acknowledged and notifies the optional callback.
	 *
	 * @param signal - Operational signal to acknowledge.
	 */
	function handleAcknowledge(signal: OpsSignal): void {
		localSignals = localSignals.map((item) =>
			item.id === signal.id ? { ...item, acknowledged: true } : item
		);
		onAcknowledge?.(signal);
	}
</script>

<section {...rest}
	aria-label="Operations and Companion daemon monitor"
	class={cn('w-full overflow-hidden rounded-card border border-card-border bg-card-bg text-sm', className)}
>
	<header
		class="flex flex-col gap-3 border-b border-canvas-border p-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<div class="flex flex-wrap items-center gap-2">
				{#if environment}<span class="font-mono text-xs text-fg-light">{environment}</span>{/if}
				<span
					class="inline-flex items-center gap-1 rounded-chip px-1.5 py-px text-[11px] font-medium {daemonStatus ===
					'Connected'
						? 'bg-status-success-subtle text-status-success'
						: daemonStatus === 'Degraded'
							? 'bg-status-warning-subtle text-status-warning'
							: 'bg-status-danger-subtle text-status-danger'}"
				>
					<span aria-hidden="true" class="size-1.5 rounded-full bg-current"></span>
					Companion {daemonStatus}
				</span>
			</div>
			<h2 class="mt-1 text-base font-semibold text-fg-main">Live Agent & Daemon Health</h2>
			<p class="mt-0.5 text-xs text-fg-light">
				{#if uptime}Uptime {uptime}{' · '}{/if}{localSignals.length} active telemetry signals
			</p>
		</div>

		<button
			type="button"
			onclick={() => onExportReport?.()}
			class={buttonClass('secondary', 'md', 'self-start')}
		>
			<Download aria-hidden="true" />
			Export
		</button>
	</header>

	<div class="grid grid-cols-2 gap-3 border-b border-canvas-border p-4 sm:grid-cols-4">
		{#each metrics as metric (metric.label)}
			<div class="rounded-control bg-canvas-secondary/70 p-3">
				<p class="text-[11px] text-fg-light">{metric.label}</p>
				<p class="mt-1 font-mono text-base font-semibold tabular-nums text-fg-main">
					{metric.value}
				</p>
				<p class="mt-1 inline-flex items-center gap-1 text-[11px] text-fg-light">
					Target {metric.threshold}
					{#if metric.trend === 'up'}
						<TrendingUp aria-label="Trending up" class="size-3" />
					{:else if metric.trend === 'down'}
						<TrendingDown aria-label="Trending down" class="size-3" />
					{:else}
						<MoveRight aria-label="Flat" class="size-3" />
					{/if}
				</p>
			</div>
		{/each}
	</div>

	<div class="divide-y divide-canvas-border">
		{#each localSignals as signal (signal.id)}
			<article class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-2">
						<h3 class="font-medium text-fg-main">{signal.title}</h3>
						<span
							class="rounded-chip px-1.5 py-px text-[11px] font-medium capitalize {getSignalBadgeClasses(
								signal.status
							)}"
						>
							{signal.status}
						</span>
						{#if signal.acknowledged}
							<span class="inline-flex items-center gap-1 text-xs text-status-success"><Check aria-hidden="true" class="size-3.5" />Acknowledged</span>
						{/if}
					</div>
					<p class="mt-1 text-xs text-fg-light">{signal.detail}</p>
					<div class="mt-1.5 flex flex-wrap gap-3 text-xs text-fg-light">
						<span>Source: {signal.owner ?? 'Unassigned'}</span>
						<span>{signal.lastUpdated ?? 'Just now'}</span>
					</div>
				</div>

				<div class="flex shrink-0 items-center gap-2">
					<button
						type="button"
						disabled={signal.acknowledged}
						onclick={() => handleAcknowledge(signal)}
						class={buttonClass('secondary', 'sm')}
					>
						<Check aria-hidden="true" />
						Ack
					</button>
					{#if signal.status !== 'healthy'}
						<button
							type="button"
							onclick={() => onEscalate?.(signal)}
							class={buttonClass('danger', 'sm')}
						>
							<TriangleAlert aria-hidden="true" />
							Escalate
						</button>
					{/if}
				</div>
			</article>
		{/each}
	</div>

	<div class="border-t border-canvas-border p-4">
		<button
			type="button"
			aria-expanded={showEvents}
			onclick={() => (showEvents = !showEvents)}
			class={buttonClass('ghost', 'sm')}
		>
			<ChevronRight aria-hidden="true" class="size-3.5 transition-transform duration-200 {showEvents ? 'rotate-90' : ''}" />
			<span>Recent Daemon & Journal Events ({incidents.length})</span>
		</button>

		{#if showEvents}
			<div
				class="mt-2 divide-y divide-canvas-border rounded-control bg-canvas-secondary/70 px-3"
			>
				{#each incidents as incident (incident.id)}
					<div class="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 py-2 text-xs">
						<time class="font-mono text-fg-light">{incident.timestamp}</time>
						<span class="text-fg-main">{incident.summary}</span>
						{#if incident.actionNeeded}
							<span class="font-mono text-[11px] text-fg-light">{incident.actionNeeded}</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
