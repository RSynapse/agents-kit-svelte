<script lang="ts">
	import { Activity, Check, GitCommitHorizontal, RotateCcw, Siren } from '@lucide/svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { motionDuration, rise } from '../state/motion.svelte';
	import { badgeClass, buttonClass, type UiTone } from '../ui/styles';
	import type { GitHubIncidentData, GitHubIncidentStatus } from '../types';
	import { LiveLoop } from './live-loop.svelte';

	interface Props {
		incident?: GitHubIncidentData;
		/** Plays the alert firing, the suspect deploy being found and reverted, then loops. */
		live?: boolean;
		onRevert?: (prNumber: number, sha: string) => void;
		class?: string;
	}

	const DEFAULT_INCIDENT: GitHubIncidentData = {
		id: 'INC-418',
		title: 'Export API returning 500s',
		severity: 'SEV2',
		service: 'export-api',
		metricLabel: 'Error rate (%)',
		series: [0.4, 0.5, 0.4, 0.6, 0.5, 0.4, 4.2, 6.8, 7.4, 7.1, 1.2, 0.6, 0.5, 0.4],
		threshold: 2,
		suspect: {
			sha: '9b07d3e',
			message: 'fix(export): quote CSV fields per RFC 4180',
			pr: 2210,
			deployedAt: '09:44'
		},
		steps: [
			{ status: 'investigating', label: 'Alert fired', detail: 'Error rate crossed 2% for 2 minutes · paged ops-oncall' },
			{ status: 'identified', label: 'Suspect found', detail: 'Errors started 40s after deploy 9b07d3e · stack points at quoteField()' },
			{ status: 'mitigated', label: 'Reverted', detail: 'Revert PR 2219 merged and deployed · error rate falling' },
			{ status: 'resolved', label: 'Resolved', detail: 'Healthy for 10 minutes · follow-up issue 2220 opened with a failing test' }
		]
	};

	const STATUS_TONE: Record<GitHubIncidentStatus, UiTone> = {
		investigating: 'danger',
		identified: 'warning',
		mitigated: 'accent',
		resolved: 'success'
	};

	const WIDTH = 280;
	const HEIGHT = 64;
	const FIRST_VISIBLE = 4;

	let { incident = DEFAULT_INCIDENT, live = true, onRevert, class: className = '' }: Props = $props();

	const loop = new LiveLoop(() => incident.series.length - FIRST_VISIBLE, 5);
	const readout = new Tween(0, { duration: 300, easing: cubicOut });

	$effect(() => {
		if (!live) return;
		return loop.start(800);
	});

	const visible = $derived(live ? FIRST_VISIBLE + loop.step : incident.series.length);
	const points = $derived(incident.series.slice(0, visible));
	const breach = $derived(incident.series.findIndex((v) => v > incident.threshold));
	const recover = $derived(incident.series.findIndex((v, i) => i > breach && v < incident.threshold));
	const last = $derived(visible - 1);

	/** How far through the incident's steps we are: -1 while healthy, up to 3 when resolved. */
	const level = $derived.by(() => {
		if (breach < 0 || last < breach) return -1;
		if (last < breach + 2) return 0;
		if (recover < 0 || last < recover) return 1;
		if (last < incident.series.length - 1) return 2;
		return 3;
	});

	const currentStep = $derived(level >= 0 ? incident.steps[level] : null);
	const max = $derived(Math.max(...incident.series, incident.threshold) * 1.15);

	$effect(() => {
		void readout.set(points.at(-1) ?? 0, { duration: motionDuration(300) });
	});

	/** Maps a series index and value to SVG coordinates. */
	function xy(i: number, v: number): string {
		const x = (i / (incident.series.length - 1)) * WIDTH;
		const y = HEIGHT - (v / max) * HEIGHT;
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	}

	const path = $derived(points.map((v, i) => `${i === 0 ? 'M' : 'L'}${xy(i, v)}`).join(' '));
	const thresholdY = $derived(HEIGHT - (incident.threshold / max) * HEIGHT);

	/** Opens and ships the revert, jumping the demo to recovery. */
	function revert(): void {
		loop.seek(recover - FIRST_VISIBLE + 1);
		onRevert?.(incident.suspect.pr, incident.suspect.sha);
	}
</script>

<article class="overflow-hidden rounded-card border border-card-border bg-card-bg text-sm {className}">
	<header class="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border px-4 py-3">
		<div class="flex min-w-0 items-center gap-2">
			<span class="inline-flex size-7 shrink-0 items-center justify-center rounded-full {level === -1 || level === 3 ? 'bg-canvas-secondary text-fg-light' : 'bg-status-danger-subtle text-status-danger'}">
				{#if level === -1}<Activity aria-hidden="true" class="size-3.5" />{:else}<Siren aria-hidden="true" class="size-3.5" />{/if}
			</span>
			<div class="min-w-0">
				<h3 class="truncate font-semibold text-fg-main">
					{level === -1 ? `${incident.service} · watching` : incident.title}
				</h3>
				<p class="font-mono text-[11px] text-fg-light">{incident.id} · {incident.service}</p>
			</div>
		</div>
		<span class="flex items-center gap-1.5">
			{#if level >= 0}<span class={badgeClass('danger')}>{incident.severity}</span>{/if}
			{#if currentStep}
				{#key currentStep.status}
					<span in:rise class={badgeClass(STATUS_TONE[currentStep.status], 'capitalize')}>{currentStep.status}</span>
				{/key}
			{:else}
				<span class={badgeClass('success')}>Healthy</span>
			{/if}
		</span>
	</header>

	<div class="px-4 pt-3">
		<div class="flex items-baseline justify-between text-xs">
			<span class="text-fg-light">{incident.metricLabel}</span>
			<span class="font-mono text-base font-semibold tabular-nums {readout.current > incident.threshold ? 'text-status-danger' : 'text-fg-main'}">
				{readout.current.toFixed(1)}%
			</span>
		</div>
		<svg viewBox="0 0 {WIDTH} {HEIGHT}" class="mt-1 h-16 w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label="{incident.metricLabel} over the last {incident.series.length} minutes">
			<line x1="0" x2={WIDTH} y1={thresholdY} y2={thresholdY} class="stroke-status-danger/50" stroke-dasharray="3 3" stroke-width="1" vector-effect="non-scaling-stroke" />
			<path d={path} fill="none" class={level === 3 || level === -1 ? 'stroke-status-success' : 'stroke-status-danger'} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
		</svg>
	</div>

	{#if level >= 1}
		<div in:rise class="mx-4 mt-3 flex flex-wrap items-center gap-2 rounded-control bg-canvas-secondary px-3 py-2 text-xs">
			<GitCommitHorizontal aria-hidden="true" class="size-3.5 shrink-0 text-fg-light" />
			<span class="min-w-0 flex-1 text-fg-main">
				Suspect <code class="font-mono">{incident.suspect.sha}</code> {incident.suspect.message}
				<span class="text-fg-light">· PR {incident.suspect.pr}, deployed {incident.suspect.deployedAt}</span>
			</span>
			{#if level === 1}
				<button type="button" class={buttonClass('danger', 'xs')} onclick={revert}>
					<RotateCcw aria-hidden="true" />Revert PR {incident.suspect.pr}
				</button>
			{/if}
		</div>
	{/if}

	<ol class="space-y-2 px-4 py-3">
		{#each incident.steps as s, i (s.status)}
			{#if i <= level}
				<li class="flex gap-2.5 text-xs" in:rise>
					<span class="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full {i < level || level === 3 ? 'bg-status-success-subtle text-status-success' : 'bg-accent-subtle text-accent-primary'}">
						{#if i < level || level === 3}<Check aria-hidden="true" class="size-2.5" strokeWidth={3} />{:else}<span class="ak-breathe size-1.5 rounded-full bg-accent-primary"></span>{/if}
					</span>
					<span>
						<strong class="font-medium text-fg-main">{s.label}</strong>
						<span class="text-fg-light"> · {s.detail}</span>
					</span>
				</li>
			{/if}
		{:else}
			<li class="text-xs text-fg-light">No incident steps recorded.</li>
		{/each}
		{#if level === -1}
			<li class="text-xs text-fg-light">All signals inside their thresholds.</li>
		{/if}
	</ol>
</article>
