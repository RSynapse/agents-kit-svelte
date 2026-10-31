<script lang="ts">
	import GitHubBentoLayout from '$lib/github/GitHubBentoLayout.svelte';
	import GitHubChecksPanel from '$lib/github/GitHubChecksPanel.svelte';
	import GitHubCommitCard from '$lib/github/GitHubCommitCard.svelte';
	import GitHubIssueCard from '$lib/github/GitHubIssueCard.svelte';
	import GitHubKanbanBoard from '$lib/github/GitHubKanbanBoard.svelte';
	import GitHubPullRequestCard from '$lib/github/GitHubPullRequestCard.svelte';
	import GitHubReviewThreadCard from '$lib/github/GitHubReviewThreadCard.svelte';

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

<div class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
	<!-- Page Header -->
	<div class="flex flex-wrap items-end justify-between gap-4 border-b border-canvas-border pb-4">
		<div>
			<span class="font-mono text-xs font-semibold uppercase tracking-wider text-accent-primary">
				GitHub Card Features & Layouts
			</span>
			<h1 class="mt-1 text-2xl font-bold text-fg-main">
				GitHub Issues, Pull Requests, Checks & Reactive Board Layouts
			</h1>
			<p class="mt-1 text-xs text-fg-light">
				Portable Svelte 5 components for GitHub triage, worktree agent runs, referee reviews, and CI check suites.
			</p>
		</div>

		<div
			role="tablist"
			aria-label="GitHub layout views"
			class="flex rounded-xl border border-card-border bg-canvas-secondary p-1 text-xs"
		>
			<button
				type="button"
				role="tab"
				disabled={!ready}
				aria-selected={activeView === 'kanban'}
				onclick={() => (activeView = 'kanban')}
				class="rounded-lg px-3 py-1.5 font-semibold transition-colors {activeView === 'kanban'
					? 'bg-card-bg text-fg-main shadow-xs'
					: 'text-fg-light hover:text-fg-main'}"
			>
				Reactive Kanban Board
			</button>
			<button
				type="button"
				role="tab"
				disabled={!ready}
				aria-selected={activeView === 'bento'}
				onclick={() => (activeView = 'bento')}
				class="rounded-lg px-3 py-1.5 font-semibold transition-colors {activeView === 'bento'
					? 'bg-card-bg text-fg-main shadow-xs'
					: 'text-fg-light hover:text-fg-main'}"
			>
				Repository Bento Pulse
			</button>
			<button
				type="button"
				role="tab"
				disabled={!ready}
				aria-selected={activeView === 'cards'}
				onclick={() => (activeView = 'cards')}
				class="rounded-lg px-3 py-1.5 font-semibold transition-colors {activeView === 'cards'
					? 'bg-card-bg text-fg-main shadow-xs'
					: 'text-fg-light hover:text-fg-main'}"
			>
				Individual Card Primitives
			</button>
		</div>
	</div>

	<!-- Live Interaction Telemetry Bar -->
	<div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-card-border bg-card-bg px-4 py-2.5 font-mono text-xs">
		<span class="inline-flex items-center gap-1.5 font-medium text-fg-main"><span aria-hidden="true" class="ak-breathe size-1.5 rounded-full bg-status-success"></span>Live intent stream:</span>
		<span class="truncate text-fg-main">{eventLog[0]}</span>
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
				<h2 class="text-sm font-bold uppercase tracking-wider text-fg-light">
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
				<h2 class="text-sm font-bold uppercase tracking-wider text-fg-light">
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
