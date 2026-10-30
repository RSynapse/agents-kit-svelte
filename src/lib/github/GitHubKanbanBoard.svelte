<script lang="ts">
	import GitHubIssueCard from './GitHubIssueCard.svelte';
	import type { GitHubIssueData, GitHubIssueState } from '../types';

	interface Props {
		issues?: GitHubIssueData[];
		onSelectIssue?: (issue: GitHubIssueData) => void;
		class?: string;
	}

	const DEFAULT_BOARD_ISSUES: GitHubIssueData[] = [
		{
			number: 2177,
			title: 'Skills: filter pill bar overflows horizontally at 320px without scroll cue',
			repo: 'RSynapse/trailside',
			state: 'open',
			author: 'grok-bot',
			createdAt: '14m ago',
			labels: [
				{ name: 'triage', tone: 'warning' },
				{ name: 'area:app', tone: 'accent' },
				{ name: 'size:s', tone: 'neutral' }
			],
			riskTier: 'T1',
			size: 'S',
			criteriaCompleted: 0,
			criteriaTotal: 3
		},
		{
			number: 2152,
			title: 'Landing: pricing comparison cards misalign CTA baseline at 768px tablet breakpoint',
			repo: 'RSynapse/trailside',
			state: 'open',
			author: 'grok-bot',
			createdAt: '41m ago',
			labels: [
				{ name: 'ready', tone: 'success' },
				{ name: 'area:landing', tone: 'accent' },
				{ name: 'tier:T1', tone: 'warning' }
			],
			riskTier: 'T1',
			size: 'S',
			criteriaCompleted: 1,
			criteriaTotal: 4
		},
		{
			number: 2151,
			title: 'Home: the unpicked agents, skipped gates and other small captions are too faint to read',
			repo: 'RSynapse/trailside',
			state: 'in-progress',
			author: 'grok-bot',
			createdAt: '1h ago',
			labels: [
				{ name: 'in-progress', tone: 'success' },
				{ name: 'area:landing', tone: 'accent' }
			],
			riskTier: 'T1',
			size: 'S',
			assignedAgent: 'Claude Code · Attempt 1',
			worktreeBranch: 'argon/2151-home-faint-captions-contrast',
			linkedPrNumber: 2153,
			criteriaCompleted: 5,
			criteriaTotal: 5
		},
		{
			number: 2148,
			title: 'Board: Ready for you disclosure chevron lacks aria-expanded state',
			repo: 'RSynapse/trailside',
			state: 'ready-for-human',
			author: 'grok-bot',
			createdAt: '2h ago',
			labels: [
				{ name: 'ready-for-human', tone: 'warning' },
				{ name: 'area:app', tone: 'accent' }
			],
			riskTier: 'T1',
			size: 'S',
			assignedAgent: 'Claude Code · PR 2150',
			linkedPrNumber: 2150,
			criteriaCompleted: 4,
			criteriaTotal: 4
		},
		{
			number: 2128,
			title: 'Project Planning: clarify read-only notice when no computer is connected',
			repo: 'RSynapse/trailside',
			state: 'closed',
			author: 'grok-bot',
			createdAt: '3h ago',
			labels: [
				{ name: 'area:app', tone: 'accent' },
				{ name: 'tier:T1', tone: 'neutral' }
			],
			riskTier: 'T1',
			size: 'S',
			linkedPrNumber: 2136,
			criteriaCompleted: 3,
			criteriaTotal: 3
		}
	];

	const COLUMNS: { id: GitHubIssueState; label: string; description: string }[] = [
		{ id: 'open', label: 'Triage & Ready', description: 'Eligible issues awaiting agent claim' },
		{ id: 'in-progress', label: 'In Progress (Runs)', description: 'Active worktree agent runs' },
		{
			id: 'ready-for-human',
			label: 'Ready for You',
			description: 'CI green & awaiting referee/human review'
		},
		{ id: 'closed', label: 'Merged & Verified', description: 'Landed on main & verified live' }
	];

	let { issues = DEFAULT_BOARD_ISSUES, onSelectIssue, class: className = '' }: Props = $props();

	let dispatchedOverrides = $state<Record<number, Partial<GitHubIssueData>>>({});
	let searchQuery = $state('');
	let selectedArea = $state<'all' | 'area:landing' | 'area:app'>('all');
	let activeDrawerIssue = $state<GitHubIssueData | null>(null);

	let boardItems = $derived(
		issues.map((item) => ({
			...item,
			...(dispatchedOverrides[item.number] ?? {})
		}))
	);

	let filteredIssues = $derived(
		boardItems.filter((item) => {
			const matchesQuery =
				!searchQuery.trim() ||
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				String(item.number).includes(searchQuery);
			const matchesArea =
				selectedArea === 'all' || item.labels.some((lbl) => lbl.name === selectedArea);
			return matchesQuery && matchesArea;
		})
	);

	/**
	 * Moves an issue card to the `in-progress` column when dispatched.
	 *
	 * @param issueNumber - GitHub issue number.
	 */
	function handleDispatch(issueNumber: number): void {
		dispatchedOverrides = {
			...dispatchedOverrides,
			[issueNumber]: {
				state: 'in-progress',
				assignedAgent: 'Claude Code · Attempt 1 (Dispatched)',
				worktreeBranch: `trailside/${issueNumber}-auto-run`
			}
		};
	}
</script>

<section
	aria-label="GitHub Reactive Board Layout"
	class="space-y-4 rounded-2xl border border-card-border bg-canvas-secondary p-4 sm:p-5 {className}"
>
	<!-- Board Toolbar -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<div class="flex items-center gap-2">
				<h2 class="text-base font-bold text-fg-main">RSynapse/trailside · Reactive Board</h2>
				<span
					class="rounded-full bg-status-success-subtle px-2 py-0.5 font-mono text-[11px] font-medium text-status-success"
				>
					GitHub App Read-Only Sync
				</span>
			</div>
			<p class="text-xs text-fg-light">
				What's in motion across Triage, Active Worktree Runs, Referee Review, and Merged cards
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<input
				type="search"
				placeholder="Filter cards by title or number…"
				bind:value={searchQuery}
				aria-label="Filter board cards"
				class="rounded-lg border border-card-border bg-card-bg px-3 py-1.5 text-xs text-fg-main placeholder:text-fg-light focus:border-accent-primary focus:outline-none"
			/>

			<div role="group" aria-label="Filter by area" class="flex rounded-lg border border-card-border bg-card-bg p-0.5 text-xs">
				<button
					type="button"
					onclick={() => (selectedArea = 'all')}
					class="rounded-md px-2.5 py-1 font-medium {selectedArea === 'all'
						? 'bg-canvas-secondary text-fg-main'
						: 'text-fg-light hover:text-fg-main'}"
				>
					All ({boardItems.length})
				</button>
				<button
					type="button"
					onclick={() => (selectedArea = 'area:landing')}
					class="rounded-md px-2.5 py-1 font-medium {selectedArea === 'area:landing'
						? 'bg-canvas-secondary text-fg-main'
						: 'text-fg-light hover:text-fg-main'}"
				>
					Landing
				</button>
				<button
					type="button"
					onclick={() => (selectedArea = 'area:app')}
					class="rounded-md px-2.5 py-1 font-medium {selectedArea === 'area:app'
						? 'bg-canvas-secondary text-fg-main'
						: 'text-fg-light hover:text-fg-main'}"
				>
					App
				</button>
			</div>
		</div>
	</div>

	<!-- 4-Column Kanban Grid -->
	<div class="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
		{#each COLUMNS as col (col.id)}
			{@const colItems = filteredIssues.filter((item) => item.state === col.id)}
			<div class="flex flex-col rounded-xl border border-card-border bg-canvas-primary p-3">
				<header class="mb-3 flex items-center justify-between gap-2 border-b border-canvas-border pb-2">
					<div>
						<h3 class="text-xs font-bold uppercase tracking-wider text-fg-main">{col.label}</h3>
						<p class="text-[11px] text-fg-light">{col.description}</p>
					</div>
					<span class="rounded-full bg-canvas-secondary px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-fg-main">
						{colItems.length}
					</span>
				</header>

				<div class="space-y-2.5">
					{#each colItems as item (item.number)}
						<GitHubIssueCard
							issue={item}
							compact={true}
							onDispatchRun={handleDispatch}
							onOpenChat={() => {
								activeDrawerIssue = item;
								onSelectIssue?.(item);
							}}
						/>
					{:else}
						<p class="rounded-lg border border-dashed border-card-border py-6 text-center text-xs text-fg-light">
							No cards in {col.label}
						</p>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#if activeDrawerIssue}
		<div
			role="region"
			aria-label="Selected card inspector"
			class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent-primary bg-accent-subtle px-4 py-3 text-xs"
		>
			<div>
				<span class="font-mono font-bold text-accent-primary">
					Selected Issue {activeDrawerIssue.number}:
				</span>
				<span class="ml-1 font-semibold text-fg-main">{activeDrawerIssue.title}</span>
				{#if activeDrawerIssue.worktreeBranch}
					<code class="ml-2 rounded bg-card-bg px-2 py-0.5 font-mono text-[11px] text-fg-main">
						{activeDrawerIssue.worktreeBranch}
					</code>
				{/if}
			</div>
			<button
				type="button"
				onclick={() => (activeDrawerIssue = null)}
				class="rounded-md bg-card-bg px-2.5 py-1 font-medium text-fg-main hover:bg-canvas-primary"
			>
				Close inspector
			</button>
		</div>
	{/if}
</section>
