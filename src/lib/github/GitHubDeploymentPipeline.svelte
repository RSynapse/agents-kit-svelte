<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Check, Clock, ExternalLink, Hourglass, RefreshCw, Rocket, RotateCcw, ShieldAlert, X } from '@lucide/svelte';
	import { slide } from 'svelte/transition';
	import { motionDuration } from '../state/motion.svelte';
	import { badgeClass, buttonClass, PROGRESS_TRACK_CLASS, progressFillClass, type UiTone } from '../ui/styles';
	import type { GitHubDeploymentEnvironment, GitHubDeploymentStatus } from '../types';
	import { LiveLoop } from './live-loop.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'sha' | 'ref' | 'environments' | 'live' | 'onApprove' | 'onRollback'> {
		sha?: string;
		ref?: string;
		environments?: GitHubDeploymentEnvironment[];
		/** Demo mode: plays the rollout through each environment, including the approval gate, then loops. Off by default. */
		live?: boolean;
		onApprove?: (environmentId: string) => void;
		onRollback?: (environmentId: string) => void;
		class?: string;
	}

	// Each environment takes two ticks to deploy; gated ones wait two ticks for a reviewer,
	// and the last environment rolls out in quarters.
	const DEPLOY_TICKS = 2;
	const APPROVAL_TICKS = 2;
	const ROLLOUT_STEPS = [25, 50, 75, 100];

	let {
		sha,
		ref = 'main',
		environments = [],
		live = false,
		onApprove,
		onRollback,
		class: className = '',
		...rest
	}: Props = $props();

	interface EnvPlan {
		start: number;
		gateEnd: number;
		end: number;
		rollout: boolean;
	}

	const plan = $derived.by(() => {
		let t = 0;
		return environments.map((env, i): EnvPlan => {
			const start = t;
			const gateEnd = start + (env.requiresApproval ? APPROVAL_TICKS : 0);
			const rollout = i === environments.length - 1;
			const end = gateEnd + (rollout ? ROLLOUT_STEPS.length : DEPLOY_TICKS);
			t = end;
			return { start, gateEnd, end, rollout };
		});
	});

	const loop = new LiveLoop(() => plan.at(-1)?.end ?? 0, 5);
	let rolledBack = $state<string | null>(null);

	$effect(() => {
		if (!live) return;
		return loop.start(900);
	});

	const step = $derived(live ? loop.step : loop.total);

	/** Derives an environment's status and progress from the demo clock. */
	function stateOf(i: number): { status: GitHubDeploymentStatus; percent: number } {
		const p = plan[i];
		const env = environments[i];
		if (rolledBack === env.id) return { status: 'failed', percent: 0 };
		if (step < p.start) return { status: 'queued', percent: 0 };
		if (step < p.gateEnd) return { status: 'awaiting-approval', percent: 0 };
		if (step >= p.end) return { status: 'active', percent: 100 };
		const into = step - p.gateEnd;
		const percent = p.rollout ? (ROLLOUT_STEPS[into - 1] ?? 5) : Math.round(((into + 0.5) / DEPLOY_TICKS) * 100);
		return { status: 'in-progress', percent };
	}

	const STATUS_META: Record<GitHubDeploymentStatus, { label: string; tone: UiTone }> = {
		queued: { label: 'Queued', tone: 'neutral' },
		'in-progress': { label: 'Deploying', tone: 'accent' },
		'awaiting-approval': { label: 'Waiting for review', tone: 'warning' },
		active: { label: 'Active', tone: 'success' },
		failed: { label: 'Rolled back', tone: 'danger' }
	};

	/** Approves a gated environment and continues the rollout from there. */
	function approve(i: number): void {
		loop.seek(plan[i].gateEnd);
		onApprove?.(environments[i].id);
	}

	/** Rolls an environment back to the previous deployment. */
	function rollback(id: string): void {
		loop.pause();
		rolledBack = id;
		onRollback?.(id);
	}
</script>

<section {...rest} aria-label={sha ? `Deployments for ${sha}` : 'Deployments'} class={cn('overflow-hidden rounded-card border border-card-border bg-card-bg text-sm', className)}>
	<header class="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border px-4 py-3">
		<div class="flex items-center gap-2">
			<Rocket aria-hidden="true" class="size-4 text-fg-light" />
			<div>
				<h3 class="font-semibold text-fg-main">Deployments</h3>
				<p class="text-xs text-fg-light">
					<code class="font-mono">{ref}</code>{#if sha}{' @ '}<code class="font-mono">{sha}</code>{/if} · environments promote in order
				</p>
			</div>
		</div>
		{#if rolledBack}
			<span class={badgeClass('danger')}>Rolled back</span>
		{:else if step >= loop.total}
			<span class={badgeClass('success')}><Check aria-hidden="true" />Live everywhere</span>
		{/if}
	</header>

	<ol class="divide-y divide-canvas-border">
		{#each environments as env, i (env.id)}
			{@const s = stateOf(i)}
			{@const meta = STATUS_META[s.status]}
			<li class="px-4 py-3">
				<div class="flex flex-wrap items-center gap-2.5">
					<span
						class="inline-flex size-7 shrink-0 items-center justify-center rounded-full {s.status === 'active'
							? 'bg-status-success-subtle text-status-success'
							: s.status === 'in-progress'
								? 'bg-accent-subtle text-accent-primary'
								: s.status === 'awaiting-approval'
									? 'bg-status-warning-subtle text-status-warning'
									: s.status === 'failed'
										? 'bg-status-danger-subtle text-status-danger'
										: 'bg-canvas-secondary text-fg-light'}"
					>
						{#if s.status === 'active'}<Check aria-hidden="true" class="size-3.5" strokeWidth={3} />
						{:else if s.status === 'in-progress'}<RefreshCw aria-hidden="true" class="size-3.5 animate-spin" />
						{:else if s.status === 'awaiting-approval'}<Hourglass aria-hidden="true" class="size-3.5" />
						{:else if s.status === 'failed'}<X aria-hidden="true" class="size-3.5" strokeWidth={3} />
						{:else}<Clock aria-hidden="true" class="size-3.5" />{/if}
					</span>
					<div class="min-w-0 flex-1">
						<p class="flex flex-wrap items-center gap-2 text-xs">
							<span class="font-semibold text-fg-main">{env.name}</span>
							<span class={badgeClass(meta.tone)}>{meta.label}</span>
							{#if env.requiresApproval}
								<span class="inline-flex items-center gap-1 text-[11px] text-fg-light"><ShieldAlert aria-hidden="true" class="size-3" />Protected</span>
							{/if}
						</p>
						<p class="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-fg-light">
							{env.url}{#if s.status === 'active'}<ExternalLink aria-hidden="true" class="size-3" />{/if}
						</p>
					</div>

					{#if s.status === 'awaiting-approval'}
						<button type="button" class={buttonClass('primary', 'sm')} onclick={() => approve(i)}>
							<Check aria-hidden="true" />Approve and deploy
						</button>
					{:else if s.status === 'active' && plan[i].rollout}
						<button type="button" class={buttonClass('danger', 'sm')} onclick={() => rollback(env.id)}>
							<RotateCcw aria-hidden="true" />Roll back
						</button>
					{/if}
				</div>

				{#if s.status === 'awaiting-approval' && env.reviewers?.length}
					<p transition:slide={{ duration: motionDuration(160) }} class="mt-2 ml-9.5 text-[11px] text-fg-light">
						Needs one of <strong class="font-medium text-fg-main">{env.reviewers.join(', ')}</strong> to approve.
					</p>
				{/if}
				{#if s.status === 'in-progress' || (s.status === 'active' && plan[i].rollout)}
					<div class="mt-2 ml-9.5 flex items-center gap-2">
						<span class="{PROGRESS_TRACK_CLASS} flex-1">
							<span class={progressFillClass(s.status === 'active' ? 'success' : 'accent')} style="width: {s.percent}%"></span>
						</span>
						<span class="w-24 shrink-0 text-right font-mono text-[10px] whitespace-nowrap text-fg-light tabular-nums">
							{plan[i].rollout ? `${s.percent}% of traffic` : `${s.percent}%`}
						</span>
					</div>
				{/if}
			</li>
		{/each}
	</ol>
</section>
