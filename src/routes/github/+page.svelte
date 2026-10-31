<script lang="ts">
	import GitHubBentoLayout from '$lib/github/GitHubBentoLayout.svelte';
	import GitHubChecksPanel from '$lib/github/GitHubChecksPanel.svelte';
	import GitHubCommitCard from '$lib/github/GitHubCommitCard.svelte';
	import GitHubIssueCard from '$lib/github/GitHubIssueCard.svelte';
	import GitHubKanbanBoard from '$lib/github/GitHubKanbanBoard.svelte';
	import GitHubPullRequestCard from '$lib/github/GitHubPullRequestCard.svelte';
	import GitHubReviewThreadCard from '$lib/github/GitHubReviewThreadCard.svelte';
	import { SEGMENT_GROUP_CLASS, segmentClass } from '$lib/ui/styles';
	import { Columns3, LayoutGrid, SquareStack } from '@lucide/svelte';

	const VIEWS = [
		{ id: 'kanban', label: 'Kanban board', icon: Columns3 },
		{ id: 'bento', label: 'Repository pulse', icon: LayoutGrid },
		{ id: 'cards', label: 'Card primitives', icon: SquareStack }
	] as const;

	let activeView = $state<'kanban' | 'bento' | 'cards'>('kanban');
	let ready = $state(false);
	let eventLog = $state<string[]>([
		'Connected to RSynapse/trailside (read-only installation token in memory)'
	]);

	$effect(() => {
		ready = true;
	});

	/**
	 * Prepends an interaction event to the live GitHub activity log.
	 *
	 * @param entry - Human-readable event description.
	 */
	function recordEvent(entry: string): void {
		eventLog = [`[${new Date().toLocaleTimeString()}] ${entry}`, ...eventLog.slice(0, 7)];
	}
</script>

<div class="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
	<!-- Page Header -->
	<div class="flex flex-wrap items-end justify-between gap-5">
		<div class="max-w-2xl">
			<p class="text-xs font-medium text-accent-primary">GitHub suite</p>
			<h1 class="mt-2 font-display text-[2.25rem] leading-tight font-normal tracking-[-0.02em] text-fg-main">
				Issues, pull requests and checks, all in one calm board.
			</h1>
			<p class="mt-3 text-sm leading-6 text-fg-light">
				Portable Svelte 5 components for GitHub triage, worktree agent runs, referee reviews and CI
				check suites.
			</p>
		</div>

		<div role="tablist" aria-label="GitHub layout views" class={SEGMENT_GROUP_CLASS}>
			{#each VIEWS as view (view.id)}
				<button
					type="button"
					role="tab"
					disabled={!ready}
					aria-selected={activeView === view.id}
					onclick={() => (activeView = view.id)}
					class={segmentClass(activeView === view.id)}
				>
					<view.icon aria-hidden="true" />
					{view.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Live Interaction Telemetry Bar -->
	<div class="flex flex-wrap items-center justify-between gap-2 rounded-full border border-card-border bg-card-bg px-4 py-2 text-xs ak-shadow-soft-sm">
		<span class="inline-flex items-center gap-1.5 font-medium text-fg-main"><span aria-hidden="true" class="ak-breathe size-1.5 rounded-full bg-status-success"></span>Live intent stream</span>
		<span class="min-w-0 flex-1 truncate font-mono text-[11px] text-fg-light">{eventLog[0]}</span>
		<span class="text-fg-light">{eventLog.length} events</span>
	</div>

	{#if activeView === 'kanban'}
		<GitHubKanbanBoard
			onSelectIssue={(issue) => recordEvent(`Opened card inspector for Issue ${issue.number}`)}
		/>
	{:else if activeView === 'bento'}
		<GitHubBentoLayout />
	{:else}
		<div class="grid gap-6 lg:grid-cols-2">
			<div class="space-y-4">
				<h2 class="px-1 text-xs font-medium text-fg-light">
					GitHubIssueCard & GitHubPullRequestCard
				</h2>
				<GitHubIssueCard
					onDispatchRun={(n) => recordEvent(`Dispatched Claude Code worktree run on Issue ${n}`)}
					onClaimToggle={(n, c) => recordEvent(`${c ? 'Claimed' : 'Released'} Issue ${n}`)}
				/>
				<GitHubPullRequestCard
					onApproveMerge={(n) => recordEvent(`Queued PR ${n} for referee merge`)}
					onRequestChanges={(n) => recordEvent(`Sent back PR ${n} for agent revision`)}
				/>
			</div>
			<div class="space-y-4">
				<h2 class="px-1 text-xs font-medium text-fg-light">
					GitHubChecksPanel, GitHubCommitCard & GitHubReviewThreadCard
				</h2>
				<GitHubChecksPanel
					onFixWithAgent={(id) => recordEvent(`Launched Claude Code to fix check ${id}`)}
					onRerunCheck={(id) => recordEvent(`Re-running check ${id}`)}
				/>
				<GitHubCommitCard
					onRestore={(sha) => recordEvent(`Restored worktree to commit ${sha}`)}
				/>
				<GitHubReviewThreadCard
					onApplySuggestion={(id) => recordEvent(`Applied suggested patch on thread ${id}`)}
					onReply={(id, text) => recordEvent(`Replied on ${id}: "${text}"`)}
				/>
			</div>
		</div>
	{/if}
</div>
