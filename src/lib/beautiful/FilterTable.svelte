<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { SEGMENT_GROUP_CLASS, segmentClass } from '../ui/styles';
	export type FilterStatus = 'todo' | 'progress' | 'done';

	export interface FilterTableRow {
		id: string;
		task: string;
		date: string;
		status: FilterStatus;
		owner: string;
		tag?: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'rows' | 'filter' | 'onFilterChange'> {
		rows?: FilterTableRow[];
		filter?: FilterStatus | 'all';
		onFilterChange?: (value: FilterStatus | 'all') => void;
		class?: string;
	}

	const FILTER_TABS: (FilterStatus | 'all')[] = ['all', 'todo', 'progress', 'done'];

	const DEFAULT_ROWS: FilterTableRow[] = [
		{
			id: 'ft-1',
			task: 'Verify idempotency lookup order on retry dispatch',
			date: 'Oct 30',
			status: 'done',
			owner: 'Claude Code · T2',
			tag: 'contracts'
		},
		{
			id: 'ft-2',
			task: 'Stream worktree unified diff hunks into review drawer',
			date: 'Oct 30',
			status: 'progress',
			owner: 'Codex · T2',
			tag: 'ui'
		},
		{
			id: 'ft-3',
			task: 'Audit companion probe argument arrays against allowlist',
			date: 'Oct 31',
			status: 'todo',
			owner: 'Referee · T1',
			tag: 'security'
		}
	];

	let {
		rows = DEFAULT_ROWS,
		filter = undefined,
		onFilterChange,
		class: className = '',
		...rest
	}: Props = $props();

	let activeFilter = $state<FilterStatus | 'all'>('all');
	let searchQuery = $state('');

	$effect(() => {
		if (filter !== undefined) {
			activeFilter = filter;
		}
	});

	/**
	 * Updates the active status filter tab and notifies the parent callback.
	 *
	 * @param next - Selected filter value (`'all' | 'todo' | 'progress' | 'done'`).
	 */
	function selectFilter(next: FilterStatus | 'all'): void {
		activeFilter = next;
		onFilterChange?.(next);
	}

	/**
	 * Maps a row status to semantic badge classes.
	 *
	 * @param status - Task row status.
	 * @returns Semantic Tailwind classes.
	 */
	function getStatusBadgeClass(status: FilterStatus): string {
		if (status === 'done') return 'bg-status-success-subtle text-status-success';
		if (status === 'progress') return 'bg-accent-subtle text-accent-primary';
		return 'bg-status-warning-subtle text-status-warning';
	}

	let visibleRows = $derived(
		rows.filter((row) => {
			const matchesTab = activeFilter === 'all' || row.status === activeFilter;
			const query = searchQuery.trim().toLowerCase();
			const matchesQuery =
				!query ||
				row.task.toLowerCase().includes(query) ||
				row.owner.toLowerCase().includes(query) ||
				(row.tag ?? '').toLowerCase().includes(query);
			return matchesTab && matchesQuery;
		})
	);
</script>

<section {...rest}
	class="overflow-hidden rounded-card border border-card-border bg-card-bg text-fg-main {className}"
>
	<div
		class="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border bg-canvas-secondary p-2.5"
	>
		<div class="{SEGMENT_GROUP_CLASS}">
			{#each FILTER_TABS as tab (tab)}
				<button
					type="button"
					onclick={() => selectFilter(tab)}
					class="{segmentClass(activeFilter === tab)} capitalize"
				>
					{tab}
				</button>
			{/each}
		</div>

		<input
			type="search"
			bind:value={searchQuery}
			placeholder="Filter tasks…"
			aria-label="Filter tasks by keyword"
			class="h-7 rounded-lg border border-card-border bg-card-bg px-2.5 text-xs text-fg-main placeholder:text-fg-light focus:border-accent-primary focus:outline-none"
		/>
	</div>

	<div class="divide-y divide-canvas-border">
		{#each visibleRows as row (row.id)}
			<div class="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-3.5 py-2.5 text-xs">
				<div class="min-w-0">
					<p class="truncate font-medium text-fg-main">{row.task}</p>
					<div class="mt-0.5 flex items-center gap-2 text-[11px] text-fg-light">
						<span>{row.owner}</span>
						{#if row.tag}
							<span class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px]">
								{row.tag}
							</span>
						{/if}
					</div>
				</div>
				<span class="font-mono text-[11px] text-fg-light">{row.date}</span>
				<span
					class="rounded-chip px-1.5 py-px font-mono text-[10px] font-medium capitalize {getStatusBadgeClass(
						row.status
					)}"
				>
					{row.status}
				</span>
			</div>
		{:else}
			<p class="p-6 text-center text-xs text-fg-light">No tasks match the current filter</p>
		{/each}
	</div>
</section>
