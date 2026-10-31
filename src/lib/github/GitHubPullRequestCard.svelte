<script lang="ts">
	import { buttonClass } from '../ui/styles';
	import { Check, ChevronDown, GitPullRequest, ShieldCheck } from '@lucide/svelte';
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';
	import type { GitHubPullRequestData } from '../types';

	interface Props {
		pr?: GitHubPullRequestData;
		defaultChecksOpen?: boolean;
		onApproveMerge?: (prNumber: number) => void;
		onRequestChanges?: (prNumber: number) => void;
		class?: string;
	}

	const DEFAULT_PR: GitHubPullRequestData = {
		number: 2153,
		title: 'fix(home): raise contrast of unpicked agents, skipped gates and secondary captions',
		repo: 'RSynapse/trailside',
		state: 'open',
		author: 'argon-agent',
		headBranch: 'argon/2151-home-faint-captions-contrast',
		baseBranch: 'main',
		additions: 68,
		deletions: 14,
		changedFilesCount: 3,
		riskTier: 'T1',
		refereeStatus: 'pass',
		refereeSummary: 'Referee review (T1, one lens): PASS. Verified 4.5:1 contrast across all 5 viewports. Queued to merge.',
		updatedAt: '4m ago',
		linkedIssueNumber: 2151,
		checks: [
			{
				id: 'chk-1',
				name: 'check-and-test (Node 24.11.1)',
				workflow: 'CI',
				status: 'passed',
				duration: '1m 42s',
				summary: 'svelte-check 0 errors · 39 affected suites passed'
			},
			{
				id: 'chk-2',
				name: 'Playwright 5-viewport contrast verification',
				workflow: 'Browser Verification',
				status: 'passed',
				duration: '32.0s',
				summary: '320px, 390px, 768px, 1024px, 1440px all >= 4.5:1'
			},
			{
				id: 'chk-3',
				name: 'check-boundaries & protected-paths guard',
				workflow: 'Policy Gate',
				status: 'passed',
				duration: '4.1s',
				summary: 'T1 UI paths only · css-ratchet within baseline'
			}
		]
	};

	let {
		pr = DEFAULT_PR,
		defaultChecksOpen = true,
		onApproveMerge,
		onRequestChanges,
		class: className = ''
	}: Props = $props();

	let checksOpen = $state(true);
	let mergeQueued = $state(false);
	let changesRequested = $state(false);
	let ready = $state(false);

	$effect(() => {
		ready = true;
	});

	$effect(() => {
		checksOpen = defaultChecksOpen;
	});

	let passedCount = $derived(pr.checks.filter((c) => c.status === 'passed').length);
	let panelId = $derived(`gh-pr-checks-${pr.number}`);
</script>

<article
	aria-label="GitHub Pull Request {pr.number}: {pr.title}"
	class="rounded-xl border border-card-border bg-card-bg p-4 text-sm {className}"
>
	<!-- Header Row -->
	<div class="flex flex-wrap items-center justify-between gap-2 text-xs">
		<div class="flex flex-wrap items-center gap-2">
			<span
				class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium {pr.state ===
				'merged'
					? 'bg-accent-subtle text-accent-primary'
					: pr.state === 'draft'
						? 'bg-canvas-secondary text-fg-light'
						: 'bg-status-success-subtle text-status-success'}"
			>
				<GitPullRequest aria-hidden="true" class="size-3" />
				<span>{pr.state === 'merged' ? 'Merged' : pr.state === 'draft' ? 'Draft' : 'Open PR'}</span>
			</span>
			<span class="font-mono font-medium text-fg-main">PR #{pr.number}</span>
			{#if pr.linkedIssueNumber}
				<span class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px] text-fg-light">
					Fixes #{pr.linkedIssueNumber}
				</span>
			{/if}
		</div>

		<div class="flex items-center gap-2 text-xs tabular-nums">
			<span class="font-medium text-diff-add-fg">+{pr.additions}</span>
			<span class="font-medium text-diff-del-fg">−{pr.deletions}</span>
			<span class="font-mono text-fg-light">({pr.changedFilesCount} files)</span>
			<span class="rounded border border-card-border bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px] text-fg-main">
				{pr.riskTier}
			</span>
		</div>
	</div>

	<!-- Title & Branch Pill -->
	<h3 class="mt-2 font-medium leading-snug text-fg-main">{pr.title}</h3>

	<div class="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-xs text-fg-light">
		<code class="rounded bg-canvas-secondary px-2 py-0.5 text-[11px] text-fg-main">
			{pr.headBranch}
		</code>
		<span>→</span>
		<code class="rounded bg-canvas-secondary px-2 py-0.5 text-[11px] text-fg-main">
			{pr.baseBranch}
		</code>
		<span class="ml-auto text-[11px]">by {pr.author} · {pr.updatedAt}</span>
	</div>

	<!-- Referee Verdict Banner -->
	{#if pr.refereeSummary}
		<div
			class="mt-3 flex items-start gap-2.5 rounded-lg border border-card-border px-3 py-2 text-xs {pr.refereeStatus ===
			'pass'
				? 'bg-status-success-subtle text-status-success'
				: pr.refereeStatus === 'send-back'
					? 'bg-status-danger-subtle text-status-danger'
					: 'bg-status-warning-subtle text-status-warning'}"
		>
			<ShieldCheck aria-hidden="true" class="mt-0.5 size-3.5 shrink-0" />
			<p class="leading-relaxed font-medium">{pr.refereeSummary}</p>
		</div>
	{/if}

	<!-- Collapsible CI Checks Rollup -->
	<div class="mt-3 overflow-hidden rounded-lg border border-card-border bg-canvas-secondary/30">
		<button
			type="button"
			aria-expanded={checksOpen}
			aria-controls={panelId}
			onclick={() => (checksOpen = !checksOpen)}
			class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-fg-main transition-colors hover:bg-canvas-secondary"
		>
			<span class="flex items-center gap-2">
				<Check aria-hidden="true" class="size-3.5 text-status-success" />
				<span>CI Checks & Verification Gates ({passedCount}/{pr.checks.length} passed)</span>
			</span>
			<ChevronDown aria-hidden="true" class="size-3.5 text-fg-light transition-transform duration-150 {checksOpen
					? 'rotate-180'
					: ''}" />
		</button>

		<AgentDisclosure id={panelId} open={checksOpen}>
			<ul class="divide-y divide-canvas-border border-t border-canvas-border bg-card-bg text-xs">
				{#each pr.checks as check (check.id)}
					<li class="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
						<div class="min-w-0">
							<div class="flex items-center gap-2">
								<span
									class="inline-flex size-3.5 items-center justify-center {check.status === 'passed'
										? 'text-status-success'
										: check.status === 'failed'
											? 'text-status-danger'
											: 'text-accent-primary'}"
								>
									{#if check.status === 'passed'}
										<Check aria-hidden="true" class="size-3.5" />
									{:else}
										<span class="size-2 rounded-full bg-current"></span>
									{/if}
								</span>
								<span class="font-medium text-fg-main">{check.name}</span>
								<span class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
									{check.workflow}
								</span>
							</div>
							{#if check.summary}
								<p class="mt-0.5 pl-5.5 text-[11px] text-fg-light">{check.summary}</p>
							{/if}
						</div>
						<span class="font-mono text-[11px] tabular-nums text-fg-light">{check.duration}</span>
					</li>
				{/each}
			</ul>
		</AgentDisclosure>
	</div>

	<!-- Actions -->
	<div class="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-canvas-border pt-2.5 text-xs">
		<span class="font-mono text-[11px] text-fg-light">
			{mergeQueued
				? 'Queued in referee merge train'
				: changesRequested
					? 'Send-back recorded for agent revision'
					: 'Ready for referee merge'}
		</span>

		<div class="flex items-center gap-1.5">
			<button
				type="button"
				disabled={!ready}
				onclick={() => {
					changesRequested = true;
					mergeQueued = false;
					onRequestChanges?.(pr.number);
				}}
				class={buttonClass('secondary', 'sm')}
			>
				Send back
			</button>
			<button
				type="button"
				disabled={!ready}
				onclick={() => {
					mergeQueued = true;
					changesRequested = false;
					onApproveMerge?.(pr.number);
				}}
				class={buttonClass('primary', 'sm')}
			>
				{mergeQueued ? 'Merge Queued' : 'Approve & Queue Merge'}
			</button>
		</div>
	</div>
</article>
