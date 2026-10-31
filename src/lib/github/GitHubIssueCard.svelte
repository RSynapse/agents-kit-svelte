<script lang="ts">
	import { buttonClass } from '../ui/styles';
	import { Check, CircleCheck, CircleDot, GitBranch, Play } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { backOut, cubicOut } from 'svelte/easing';
	import { Spring, prefersReducedMotion } from 'svelte/motion';
	import { fly, scale } from 'svelte/transition';
	import { motionDuration } from '../state/motion.svelte';
	import type { GitHubIssueData } from '../types';

	interface Props {
		issue?: GitHubIssueData;
		compact?: boolean;
		onDispatchRun?: (issueNumber: number) => void;
		onOpenChat?: (issueNumber: number) => void;
		onClaimToggle?: (issueNumber: number, claimed: boolean) => void;
		footerActions?: Snippet<[GitHubIssueData]>;
		class?: string;
	}

	const DEFAULT_ISSUE: GitHubIssueData = {
		number: 2151,
		title: 'Home: the unpicked agents, skipped gates and other small captions are too faint to read',
		repo: 'RSynapse/trailside',
		state: 'in-progress',
		author: 'grok-bot',
		createdAt: '28m ago',
		labels: [
			{ name: 'area:landing', tone: 'accent' },
			{ name: 'type:polish', tone: 'neutral' },
			{ name: 'size:s', tone: 'neutral' },
			{ name: 'tier:T1', tone: 'warning' },
			{ name: 'in-progress', tone: 'success' }
		],
		riskTier: 'T1',
		size: 'S',
		assignedAgent: 'AK-S Agent · Attempt 1',
		attemptNumber: 1,
		worktreeBranch: 'argon/2151-home-faint-captions-contrast',
		linkedPrNumber: 2153,
		criteriaCompleted: 5,
		criteriaTotal: 5,
		summary:
			'Small secondary captions and unpicked agent rows on the home page fall below 4.5:1 WCAG AA contrast across 320px–1440px viewports.'
	};

	let {
		issue = DEFAULT_ISSUE,
		compact = false,
		onDispatchRun,
		onOpenChat,
		onClaimToggle,
		footerActions,
		class: className = ''
	}: Props = $props();

	let claimed = $state(true);
	let dispatched = $state(false);
	let ready = $state(false);

	$effect(() => {
		ready = true;
	});

	$effect(() => {
		claimed = issue.state === 'in-progress';
	});

	let criteriaPercent = $derived(
		issue.criteriaTotal && issue.criteriaTotal > 0
			? Math.round(((issue.criteriaCompleted ?? 0) / issue.criteriaTotal) * 100)
			: 0
	);

	const criteriaSpring = new Spring(0, { stiffness: 0.16, damping: 0.78 });

	$effect(() => {
		void criteriaSpring.set(criteriaPercent, { instant: prefersReducedMotion.current });
	});

	/**
	 * Maps a GitHub label tone to semantic Tailwind badge classes.
	 *
	 * @param tone - Semantic tone of the label.
	 * @returns Tailwind class string.
	 */
	function labelClasses(tone: GitHubIssueData['labels'][number]['tone']): string {
		switch (tone) {
			case 'accent':
				return 'bg-accent-subtle text-accent-primary border-card-border';
			case 'success':
				return 'bg-status-success-subtle text-status-success border-card-border';
			case 'warning':
				return 'bg-status-warning-subtle text-status-warning border-card-border';
			case 'danger':
				return 'bg-status-danger-subtle text-status-danger border-card-border';
			default:
				return 'bg-canvas-secondary text-fg-light border-card-border';
		}
	}

	/**
	 * Toggles the claim state on this GitHub issue card.
	 */
	function handleClaim(): void {
		claimed = !claimed;
		onClaimToggle?.(issue.number, claimed);
	}

	/**
	 * Dispatches a new agent workflow run for this issue.
	 */
	function handleDispatch(): void {
		dispatched = true;
		onDispatchRun?.(issue.number);
	}
</script>

<article
	aria-label="GitHub Issue {issue.number}: {issue.title}"
	class="ak-micro-lift flex min-w-0 flex-col justify-between overflow-hidden rounded-card border border-card-border bg-card-bg {compact
		? 'p-3.5'
		: 'p-4'} text-sm transition-colors {className}"
>
	<div class="min-w-0">
		<!-- Top Meta Row -->
		<div class="flex flex-wrap items-center justify-between gap-1.5 text-xs">
			<div class="flex min-w-0 items-center gap-1.5">
				{#key issue.state}
					<span
						in:scale={{ start: 0.85, duration: motionDuration(180), easing: backOut }}
						class="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-chip px-1.5 py-px text-[11px] font-medium {issue.state ===
						'closed'
							? 'bg-canvas-secondary text-fg-light'
							: issue.state === 'ready-for-human'
								? 'bg-status-warning-subtle text-status-warning'
								: 'bg-status-success-subtle text-status-success'}"
					>
						{#if issue.state === 'closed'}
							<CircleCheck aria-hidden="true" class="size-3 shrink-0" />
							<span>Closed</span>
						{:else}
							<CircleDot aria-hidden="true" class="size-3 shrink-0" />
							<span>
								{issue.state === 'in-progress'
									? 'In Progress'
									: issue.state === 'ready-for-human'
										? 'Ready for Review'
										: 'Open'}
							</span>
						{/if}
					</span>
				{/key}

				{#if compact}
					<span class="shrink-0 whitespace-nowrap font-mono text-xs font-medium text-fg-light">
						#{issue.number}
					</span>
				{:else}
					<span class="min-w-0 truncate font-mono text-xs text-fg-light">
						{issue.repo} · #{issue.number}
					</span>
				{/if}
			</div>

			<div class="flex shrink-0 items-center gap-1 text-xs text-fg-light">
				{#if issue.riskTier}
					<span class="whitespace-nowrap rounded border border-card-border bg-canvas-secondary px-1.5 py-0.5 text-fg-main">
						{issue.riskTier}
					</span>
				{/if}
				{#if issue.size && !compact}
					<span class="whitespace-nowrap rounded border border-card-border bg-canvas-secondary px-1.5 py-0.5">
						Size {issue.size}
					</span>
				{/if}
			</div>
		</div>

		<!-- Title & Summary -->
		<h3 class="mt-2 font-medium leading-snug text-fg-main">
			{issue.title}
		</h3>

		{#if issue.summary && !compact}
			<p class="mt-1.5 text-xs leading-relaxed text-fg-light">
				{issue.summary}
			</p>
		{/if}

		<!-- Labels -->
		<div class="mt-2.5 flex flex-wrap gap-1">
			{#each issue.labels as label (label.name)}
				<span
					class="whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium {labelClasses(
						label.tone
					)}"
				>
					{label.name}
				</span>
			{/each}
		</div>

		<!-- Active Worktree & Agent Run Strip -->
		{#if (issue.assignedAgent || issue.worktreeBranch) && !compact}
			<div
				in:fly={{ y: 6, duration: motionDuration(180), easing: cubicOut }}
				class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-card-border bg-canvas-secondary/60 px-3 py-2 text-xs"
			>
				<div class="flex items-center gap-2">
					<span class="inline-block size-2 rounded-full bg-accent-primary"></span>
					<span class="font-medium text-fg-main">{issue.assignedAgent ?? 'Unassigned'}</span>
				</div>
				{#if issue.worktreeBranch}
					<code class="inline-flex min-w-0 items-center gap-1 truncate rounded bg-card-bg px-1.5 py-0.5 text-xs text-fg-light">
						<GitBranch aria-hidden="true" class="size-3 shrink-0" />
						<span class="truncate">{issue.worktreeBranch}</span>
					</code>
				{/if}
			</div>
		{/if}

		<!-- Acceptance Criteria Progress Bar (Svelte 5 Spring) -->
		{#if issue.criteriaTotal && issue.criteriaTotal > 0}
			<div class="mt-3 space-y-1">
				<div class="flex items-center justify-between gap-2 text-xs text-fg-light">
					<span class="whitespace-nowrap">{compact ? 'Criteria' : 'Acceptance criteria'}</span>
					<span class="whitespace-nowrap tabular-nums text-fg-main">
						{issue.criteriaCompleted ?? 0}/{issue.criteriaTotal} ({Math.round(criteriaSpring.current)}%)
					</span>
				</div>
				<div class="h-1 w-full overflow-hidden rounded-full bg-canvas-secondary">
					<div
						class="h-full rounded-full bg-status-success"
						style="width: {Math.max(0, Math.min(100, criteriaSpring.current))}%;"
					></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Card Footer Actions -->
	<div
		class="mt-3 border-t border-canvas-border pt-2.5 text-xs {compact
			? 'space-y-2'
			: 'flex flex-wrap items-center justify-between gap-2'}"
	>
		<div class="flex flex-wrap items-center justify-between gap-1 text-xs text-fg-light">
			<span class="truncate">
				{compact ? issue.author : `Filed by ${issue.author}`} · {issue.createdAt}
			</span>
			{#if issue.linkedPrNumber}
				<strong class="shrink-0 whitespace-nowrap font-medium text-accent-primary">
					PR #{issue.linkedPrNumber}
				</strong>
			{/if}
		</div>

		{#if footerActions}
			{@render footerActions(issue)}
		{:else}
			<div class="flex flex-wrap items-center gap-1.5">
				<button
					type="button"
					disabled={!ready}
					onclick={handleClaim}
					class={buttonClass('secondary', 'sm')}
				>
					{#if claimed}
						<Check aria-hidden="true" class="size-3 shrink-0 text-status-success" />
						<span>Claimed</span>
					{:else}
						<span>{compact ? 'Claim' : 'Claim issue'}</span>
					{/if}
				</button>
				<button
					type="button"
					disabled={!ready}
					onclick={handleDispatch}
					class={buttonClass('primary', 'sm')}
				>
					<Play aria-hidden="true" class="size-2.5 shrink-0" />
					<span>
						{dispatched
							? compact
								? 'Dispatched'
								: 'Run Dispatched'
							: compact
								? 'Dispatch'
								: 'Dispatch Agent'}
					</span>
				</button>
				{#if onOpenChat}
					<button
						type="button"
						disabled={!ready}
						onclick={() => onOpenChat(issue.number)}
						class={buttonClass('secondary', 'sm')}
					>
						Chat
					</button>
				{/if}
			</div>
		{/if}
	</div>
</article>
