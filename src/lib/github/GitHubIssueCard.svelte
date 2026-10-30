<script lang="ts">
	import type { Snippet } from 'svelte';
	import { backOut, cubicOut } from 'svelte/easing';
	import { Spring, prefersReducedMotion } from 'svelte/motion';
	import { fly, scale } from 'svelte/transition';
	import { magneticHover, motionDuration, pressScale } from '../state/motion.svelte';
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
		assignedAgent: 'Claude Code · Attempt 1',
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
	use:magneticHover={1.5}
	aria-label="GitHub Issue {issue.number}: {issue.title}"
	class="ak-micro-lift flex flex-col justify-between rounded-xl border border-card-border bg-card-bg p-4 text-sm shadow-xs transition-colors hover:border-canvas-border {className}"
>
	<div>
		<!-- Top Meta Row -->
		<div class="flex flex-wrap items-center justify-between gap-2 text-xs">
			<div class="flex items-center gap-2">
				{#key issue.state}
					<span
						in:scale={{ start: 0.85, duration: motionDuration(180), easing: backOut }}
						class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold {issue.state ===
						'closed'
							? 'bg-canvas-secondary text-fg-light'
							: issue.state === 'ready-for-human'
								? 'bg-status-warning-subtle text-status-warning'
								: 'bg-status-success-subtle text-status-success'}"
					>
						{issue.state === 'closed'
							? '✓ Closed'
							: issue.state === 'in-progress'
								? '◎ In Progress'
								: issue.state === 'ready-for-human'
									? '⚑ Ready for Human'
									: '○ Open'}
					</span>
				{/key}
				<span class="font-mono text-xs font-semibold text-fg-light">
					{issue.repo} · Issue {issue.number}
				</span>
			</div>

			<div class="flex items-center gap-1.5 font-mono text-[11px] text-fg-light">
				{#if issue.riskTier}
					<span class="rounded border border-card-border bg-canvas-secondary px-1.5 py-0.5 text-fg-main">
						{issue.riskTier}
					</span>
				{/if}
				{#if issue.size}
					<span class="rounded border border-card-border bg-canvas-secondary px-1.5 py-0.5">
						Size {issue.size}
					</span>
				{/if}
			</div>
		</div>

		<!-- Title & Summary -->
		<h3 class="mt-2 font-semibold leading-snug text-fg-main">
			{issue.title}
		</h3>

		{#if issue.summary && !compact}
			<p class="mt-1.5 text-xs leading-relaxed text-fg-light">
				{issue.summary}
			</p>
		{/if}

		<!-- Labels -->
		<div class="mt-2.5 flex flex-wrap gap-1.5">
			{#each issue.labels as label (label.name)}
				<span
					class="rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium {labelClasses(
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
				class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-card-border bg-canvas-secondary px-3 py-2 text-xs"
			>
				<div class="flex items-center gap-2">
					<span class="inline-block size-2 rounded-full bg-accent-primary"></span>
					<span class="font-medium text-fg-main">{issue.assignedAgent ?? 'Unassigned'}</span>
				</div>
				{#if issue.worktreeBranch}
					<code class="truncate rounded bg-card-bg px-1.5 py-0.5 font-mono text-[11px] text-fg-light">
						{issue.worktreeBranch}
					</code>
				{/if}
			</div>
		{/if}

		<!-- Acceptance Criteria Progress Bar (Svelte 5 Spring) -->
		{#if issue.criteriaTotal && issue.criteriaTotal > 0}
			<div class="mt-3 space-y-1">
				<div class="flex items-center justify-between font-mono text-[11px] text-fg-light">
					<span>Acceptance criteria</span>
					<span class="tabular-nums text-fg-main">
						{issue.criteriaCompleted ?? 0}/{issue.criteriaTotal} ({Math.round(criteriaSpring.current)}%)
					</span>
				</div>
				<div class="h-1.5 w-full overflow-hidden rounded-full bg-canvas-secondary">
					<div
						class="h-full rounded-full bg-status-success"
						style="width: {Math.max(0, Math.min(100, criteriaSpring.current))}%;"
					></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Card Footer Actions -->
	<div class="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-canvas-border pt-2.5 text-xs">
		<span class="font-mono text-[11px] text-fg-light">
			Filed by {issue.author} · {issue.createdAt}
			{#if issue.linkedPrNumber}
				· <strong class="text-accent-primary">PR {issue.linkedPrNumber}</strong>
			{/if}
		</span>

		{#if footerActions}
			{@render footerActions(issue)}
		{:else}
			<div class="flex items-center gap-1.5">
				<button
					type="button"
					use:pressScale
					disabled={!ready}
					onclick={handleClaim}
					class="rounded-md border border-card-border bg-canvas-secondary px-2.5 py-1 font-medium text-fg-main transition-colors hover:bg-canvas-primary disabled:opacity-50"
				>
					{claimed ? '✓ Claimed' : 'Claim issue'}
				</button>
				<button
					type="button"
					use:pressScale
					disabled={!ready}
					onclick={handleDispatch}
					class="rounded-md bg-fg-main px-2.5 py-1 font-medium text-fg-inverse transition-opacity hover:opacity-90 disabled:opacity-50"
				>
					{dispatched ? '↻ Run Dispatched' : '▶ Dispatch Agent'}
				</button>
				{#if onOpenChat}
					<button
						type="button"
						use:pressScale
						disabled={!ready}
						onclick={() => onOpenChat(issue.number)}
						class="rounded-md border border-card-border bg-card-bg px-2 py-1 font-mono text-[11px] text-accent-primary hover:bg-accent-subtle"
					>
						Chat →
					</button>
				{/if}
			</div>
		{/if}
	</div>
</article>
