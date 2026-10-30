<script lang="ts">
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

	interface Props {
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

	const defaultMetrics: OpsServiceMetric[] = [
		{
			label: 'P95 Stream Latency',
			value: '340 ms',
			threshold: '< 550 ms',
			trend: 'down'
		},
		{
			label: 'Token Throughput',
			value: '148 tok/s',
			threshold: '> 90 tok/s',
			trend: 'up'
		},
		{
			label: 'Tool Success Rate',
			value: '99.4%',
			threshold: '> 98.5%',
			trend: 'stable'
		},
		{
			label: 'Companion Heartbeat',
			value: '12 ms RTT',
			threshold: 'Bun 1.4.2',
			trend: 'stable'
		}
	];

	const defaultSignals: OpsSignal[] = [
		{
			id: 'sig-daemon',
			title: 'Companion Daemon · MacBook-Pro-M3',
			status: 'healthy',
			detail: 'Local WebSocket tunnel healthy; 2 isolated worktrees mounted under Connect consent.',
			owner: 'trailside up',
			lastUpdated: 'Just now'
		},
		{
			id: 'sig-context',
			title: 'Worktree B Context Window Pressure',
			status: 'warning',
			detail: 'Card 191 attempt 1 reached 78% of 200k context window during contract schema diff.',
			owner: 'Claude Code 1.0',
			lastUpdated: '2 min ago'
		},
		{
			id: 'sig-probe',
			title: 'Agent CLI Metadata Probe Gate',
			status: 'healthy',
			detail: 'Direct argv probe completed in 84 ms with zero credential reads.',
			owner: 'agents/probe.ts',
			lastUpdated: '5 min ago'
		}
	];

	const defaultIncidents: IncidentEvent[] = [
		{
			id: 'inc-1',
			timestamp: '13:58',
			summary: 'Auto-compacted conversation transcript on Card 188 worktree',
			actionNeeded: 'Resolved'
		},
		{
			id: 'inc-2',
			timestamp: '14:04',
			summary: 'Rate-limit backoff (1.2s) on secondary search subagent',
			actionNeeded: 'Monitoring'
		}
	];

	let {
		environment = 'Companion + Service Telemetry',
		daemonStatus = 'Connected',
		uptime = '99.98%',
		signals = defaultSignals,
		metrics = defaultMetrics,
		incidents = defaultIncidents,
		onAcknowledge,
		onEscalate,
		onExportReport,
		class: className = ''
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

<section
	aria-label="Operations and Companion daemon monitor"
	class="w-full overflow-hidden rounded-xl border border-card-border bg-card-bg text-sm {className}"
>
	<header
		class="flex flex-col gap-3 border-b border-canvas-border p-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<div class="flex flex-wrap items-center gap-2">
				<span class="font-mono text-xs text-fg-light">{environment}</span>
				<span
					class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {daemonStatus ===
					'Connected'
						? 'bg-status-success-subtle text-status-success'
						: daemonStatus === 'Degraded'
							? 'bg-status-warning-subtle text-status-warning'
							: 'bg-status-danger-subtle text-status-danger'}"
				>
					● Companion {daemonStatus}
				</span>
			</div>
			<h2 class="mt-1 text-base font-semibold text-fg-main">Live Agent & Daemon Health</h2>
			<p class="mt-0.5 text-xs text-fg-light">
				Uptime {uptime} · {localSignals.length} active telemetry signals
			</p>
		</div>

		<button
			type="button"
			onclick={() => onExportReport?.()}
			class="self-start rounded-lg border border-card-border bg-canvas-primary px-3 py-1.5 text-xs font-medium text-fg-main transition-colors hover:bg-canvas-secondary"
		>
			↓ Export Snapshot
		</button>
	</header>

	<div class="grid grid-cols-2 gap-3 border-b border-canvas-border bg-canvas-primary p-4 sm:grid-cols-4">
		{#each metrics as metric (metric.label)}
			<div class="rounded-lg border border-canvas-border bg-card-bg p-3">
				<p class="text-[11px] text-fg-light">{metric.label}</p>
				<p class="mt-1 font-mono text-base font-semibold tabular-nums text-fg-main">
					{metric.value}
				</p>
				<p class="mt-1 font-mono text-[11px] text-fg-light">
					Target {metric.threshold} · {metric.trend === 'up'
						? '↑'
						: metric.trend === 'down'
							? '↓'
							: '→'}
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
							class="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize {getSignalBadgeClasses(
								signal.status
							)}"
						>
							{signal.status}
						</span>
						{#if signal.acknowledged}
							<span class="font-mono text-[11px] text-status-success">✓ Acknowledged</span>
						{/if}
					</div>
					<p class="mt-1 text-xs text-fg-light">{signal.detail}</p>
					<div class="mt-1.5 flex flex-wrap gap-3 font-mono text-[11px] text-fg-light">
						<span>Source: {signal.owner ?? 'Unassigned'}</span>
						<span>{signal.lastUpdated ?? 'Just now'}</span>
					</div>
				</div>

				<div class="flex shrink-0 items-center gap-2">
					<button
						type="button"
						disabled={signal.acknowledged}
						onclick={() => handleAcknowledge(signal)}
						class="rounded-lg border border-card-border bg-canvas-primary px-2.5 py-1 text-xs font-medium text-fg-main hover:bg-canvas-secondary disabled:opacity-40"
					>
						✓ Ack
					</button>
					{#if signal.status !== 'healthy'}
						<button
							type="button"
							onclick={() => onEscalate?.(signal)}
							class="rounded-lg bg-status-danger-subtle px-2.5 py-1 text-xs font-medium text-status-danger"
						>
							⚠ Escalate
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
			class="flex items-center gap-1.5 text-xs font-medium text-fg-light hover:text-fg-main"
		>
			<span>{showEvents ? '▾' : '▸'}</span>
			<span>Recent Daemon & Journal Events ({incidents.length})</span>
		</button>

		{#if showEvents}
			<div
				class="mt-2 divide-y divide-canvas-border rounded-lg border border-canvas-border bg-canvas-primary px-3"
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
