<script lang="ts">
	import GitHubChecksPanel from './GitHubChecksPanel.svelte';
	import GitHubCommitCard from './GitHubCommitCard.svelte';
	import GitHubIssueCard from './GitHubIssueCard.svelte';
	import GitHubPullRequestCard from './GitHubPullRequestCard.svelte';
	import GitHubReviewThreadCard from './GitHubReviewThreadCard.svelte';

	interface Props {
		repoName?: string;
		defaultBranch?: string;
		class?: string;
	}

	let {
		repoName = 'RSynapse/trailside',
		defaultBranch = 'main',
		class: className = ''
	}: Props = $props();
</script>

<section aria-label="GitHub Repository Bento Dashboard" class="space-y-4 {className}">
	<!-- Top Repository Status Strip -->
	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-xl border border-card-border bg-card-bg p-3.5">
			<span class="font-mono text-[11px] uppercase text-fg-light">Linked Repository</span>
			<p class="mt-1 font-mono text-sm font-bold text-fg-main">{repoName}</p>
			<p class="mt-0.5 text-xs text-status-success">● GitHub App Installation Active</p>
		</div>
		<div class="rounded-xl border border-card-border bg-card-bg p-3.5">
			<span class="font-mono text-[11px] uppercase text-fg-light">Open Agent PRs</span>
			<p class="mt-1 font-mono text-lg font-bold tabular-nums text-fg-main">3 / 3</p>
			<p class="mt-0.5 text-xs text-fg-light">PR 2136, PR 2150, PR 2153 (All PASS)</p>
		</div>
		<div class="rounded-xl border border-card-border bg-card-bg p-3.5">
			<span class="font-mono text-[11px] uppercase text-fg-light">Check Gates</span>
			<p class="mt-1 font-mono text-lg font-bold tabular-nums text-status-success">98.4%</p>
			<p class="mt-0.5 text-xs text-fg-light">427 unit assertions · 5 viewports</p>
		</div>
		<div class="rounded-xl border border-card-border bg-card-bg p-3.5">
			<span class="font-mono text-[11px] uppercase text-fg-light">Default Branch</span>
			<p class="mt-1 font-mono text-sm font-bold text-fg-main">{defaultBranch}</p>
			<p class="mt-0.5 text-xs text-fg-light">Protected · Referee merge queue</p>
		</div>
	</div>

	<!-- Bento Grid of GitHub Cards -->
	<div class="grid gap-4 lg:grid-cols-12">
		<div class="space-y-4 lg:col-span-7">
			<GitHubPullRequestCard />
			<GitHubChecksPanel />
		</div>
		<div class="space-y-4 lg:col-span-5">
			<GitHubIssueCard />
			<GitHubCommitCard />
			<GitHubReviewThreadCard />
		</div>
	</div>
</section>
