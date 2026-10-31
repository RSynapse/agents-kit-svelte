<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import GitHubChecksPanel from './GitHubChecksPanel.svelte';
	import GitHubCommitCard from './GitHubCommitCard.svelte';
	import GitHubIssueCard from './GitHubIssueCard.svelte';
	import GitHubPullRequestCard from './GitHubPullRequestCard.svelte';
	import GitHubReviewThreadCard from './GitHubReviewThreadCard.svelte';
	import type {
		GitHubBentoStat,
		GitHubCheckItem,
		GitHubCommitData,
		GitHubIssueData,
		GitHubPullRequestData,
		GitHubReviewThreadData
	} from '../types';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'repoName' | 'repoDetail' | 'defaultBranch' | 'branchDetail' | 'stats' | 'pullRequest' | 'checks' | 'issue' | 'commit' | 'thread'> {
		repoName: string;
		/** Line under the repository name. */
		repoDetail?: string;
		defaultBranch?: string;
		/** Line under the default branch. */
		branchDetail?: string;
		/** Extra tiles after the repository and branch tiles. */
		stats?: GitHubBentoStat[];
		pullRequest?: GitHubPullRequestData;
		checks?: GitHubCheckItem[];
		issue?: GitHubIssueData;
		commit?: GitHubCommitData;
		thread?: GitHubReviewThreadData;
		class?: string;
	}

	let {
		repoName,
		repoDetail,
		defaultBranch = 'main',
		branchDetail,
		stats = [],
		pullRequest,
		checks,
		issue,
		commit,
		thread,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<section {...rest} aria-label="GitHub Repository Bento Dashboard" class="@container space-y-4 {className}">
	<!-- Top Repository Status Strip -->
	<div class="grid gap-3 @sm:grid-cols-2 @3xl:grid-cols-4">
		<div class="rounded-card border border-card-border bg-card-bg p-3.5">
			<span class="text-[11px] capitalize text-fg-light font-medium">Linked Repository</span>
			<p class="mt-1 truncate font-mono text-sm font-bold text-fg-main">{repoName}</p>
			{#if repoDetail}<p class="mt-0.5 inline-flex items-center gap-1.5 text-xs text-fg-light"><span aria-hidden="true" class="size-1.5 rounded-full bg-status-success"></span>{repoDetail}</p>{/if}
		</div>
		{#each stats as stat (stat.label)}
			<div class="rounded-card border border-card-border bg-card-bg p-3.5">
				<span class="text-[11px] capitalize text-fg-light font-medium">{stat.label}</span>
				<p
					class="mt-1 font-mono text-lg font-bold tabular-nums {stat.tone === 'success'
						? 'text-status-success'
						: 'text-fg-main'}"
				>
					{stat.value}
				</p>
				{#if stat.detail}<p class="mt-0.5 text-xs text-fg-light">{stat.detail}</p>{/if}
			</div>
		{/each}
		<div class="rounded-card border border-card-border bg-card-bg p-3.5">
			<span class="text-[11px] capitalize text-fg-light font-medium">Default Branch</span>
			<p class="mt-1 font-mono text-sm font-bold text-fg-main">{defaultBranch}</p>
			{#if branchDetail}<p class="mt-0.5 text-xs text-fg-light">{branchDetail}</p>{/if}
		</div>
	</div>

	<!-- Bento Grid of GitHub Cards -->
	<div class="grid gap-4 @3xl:grid-cols-12">
		<div class="min-w-0 space-y-4 @3xl:col-span-7">
			{#if pullRequest}<GitHubPullRequestCard pr={pullRequest} />{/if}
			{#if checks}<GitHubChecksPanel {checks} />{/if}
		</div>
		<div class="min-w-0 space-y-4 @3xl:col-span-5">
			{#if issue}<GitHubIssueCard {issue} />{/if}
			{#if commit}<GitHubCommitCard {commit} />{/if}
			{#if thread}<GitHubReviewThreadCard {thread} />{/if}
		</div>
	</div>
</section>
