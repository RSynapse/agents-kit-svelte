<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ChevronDown } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	export interface RecordRow {
		id: string;
		name: string;
		categories?: string[];
		updated?: string;
		strength?: string;
		status?: 'active' | 'verified' | 'queued';
		links?: number;
	}

	type SortColumn = 'name' | 'categories' | 'updated' | 'strength' | 'links';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'records' | 'sortKey' | 'sortDirection' | 'selectedIds' | 'onSort' | 'onSelect' | 'onSelectionChange'> {
		records?: RecordRow[];
		sortKey?: SortColumn;
		sortDirection?: 'asc' | 'desc';
		selectedIds?: string[];
		onSort?: (key: SortColumn) => void;
		onSelect?: (id: string) => void;
		onSelectionChange?: (ids: string[]) => void;
		class?: string;
	}

	const COLUMNS: { key: SortColumn; label: string }[] = [
		{ key: 'name', label: 'Record' },
		{ key: 'categories', label: 'Categories' },
		{ key: 'updated', label: 'Updated' },
		{ key: 'strength', label: 'Strength' },
		{ key: 'links', label: 'Links' }
	];

	let {
		records = [],
		sortKey = undefined,
		sortDirection = 'asc',
		selectedIds = undefined,
		onSort,
		onSelect,
		onSelectionChange,
		class: className = '',
		...rest
	}: Props = $props();

	let currentSortKey = $state<SortColumn>('links');
	let currentSortDir = $state<'asc' | 'desc'>('desc');
	let selectedSet = $state<Set<string>>(new Set(['rec-1']));

	$effect(() => {
		if (sortKey !== undefined) {
			currentSortKey = sortKey;
		}
		currentSortDir = sortDirection;
	});

	$effect(() => {
		if (selectedIds !== undefined) {
			selectedSet = new Set(selectedIds);
		}
	});

	/**
	 * Sorts records by the active column key and direction.
	 *
	 * @param list - Unsorted record rows.
	 * @param key - Column key to sort by.
	 * @param dir - Sort direction (`'asc'` or `'desc'`).
	 * @returns Sorted copy of the record rows.
	 */
	function sortRecords(list: RecordRow[], key: SortColumn, dir: 'asc' | 'desc'): RecordRow[] {
		const copy = [...list];
		const factor = dir === 'asc' ? 1 : -1;
		copy.sort((a, b) => {
			if (key === 'links') {
				return ((a.links ?? 0) - (b.links ?? 0)) * factor;
			}
			const left = String(a[key] ?? '');
			const right = String(b[key] ?? '');
			return left.localeCompare(right) * factor;
		});
		return copy;
	}

	/**
	 * Handles clicking a column header to toggle sort order.
	 *
	 * @param key - Column key clicked.
	 */
	function handleSortClick(key: SortColumn): void {
		if (currentSortKey === key) {
			currentSortDir = currentSortDir === 'asc' ? 'desc' : 'asc';
		} else {
			currentSortKey = key;
			currentSortDir = 'asc';
		}
		onSort?.(key);
	}

	/**
	 * Toggles selection for a single record row.
	 *
	 * @param id - Record identifier.
	 */
	function toggleRowSelection(id: string): void {
		const next = new Set(selectedSet);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedSet = next;
		onSelect?.(id);
		onSelectionChange?.(Array.from(next));
	}

	let sortedRecords = $derived(sortRecords(records, currentSortKey, currentSortDir));
	let totalLinks = $derived(records.reduce((sum, r) => sum + (r.links ?? 0), 0));
</script>

<section {...rest}
	class={cn('overflow-hidden rounded-card border border-card-border bg-card-bg text-fg-main', className)}
>
	<div role="region" aria-label="Agent records table" class="overflow-x-auto">
		<table class="w-full min-w-[600px] text-left text-xs">
			<thead class="sticky top-0 bg-canvas-secondary text-fg-light">
				<tr>
					<th class="w-10 px-3 py-2.5">
						<span class="sr-only">Select</span>
					</th>
					{#each COLUMNS as col (col.key)}
						<th class="px-3 py-2.5 font-medium">
							<button
								type="button"
								onclick={() => handleSortClick(col.key)}
								class={buttonClass('ghost', 'sm')}
							>
								<span>{col.label}</span>
								{#if currentSortKey === col.key}
									<ChevronDown aria-hidden="true" class="size-3.5 transition-transform duration-200 {currentSortDir === 'asc' ? 'rotate-180' : ''}" />
								{/if}
							</button>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y divide-canvas-border">
				{#each sortedRecords as record (record.id)}
					{@const isSelected = selectedSet.has(record.id)}
					<tr
						class="transition-colors {isSelected
							? 'bg-accent-subtle'
							: 'hover:bg-canvas-secondary'}"
					>
						<td class="px-3 py-2.5">
							<input
								type="checkbox"
								checked={isSelected}
								aria-label="Select {record.name}"
								onchange={() => toggleRowSelection(record.id)}
								class="size-3.5 rounded border-card-border accent-accent-primary"
							/>
						</td>
						<td class="px-3 py-2.5">
							<button
								type="button"
								onclick={() => toggleRowSelection(record.id)}
								class="font-medium text-fg-main underline-offset-2 hover:underline"
							>
								{record.name}
							</button>
						</td>
						<td class="px-3 py-2.5">
							<div class="flex flex-wrap gap-1">
								{#each record.categories ?? [] as category (category)}
									<span
										class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] text-fg-light"
									>
										{category}
									</span>
								{/each}
							</div>
						</td>
						<td class="px-3 py-2.5 font-mono text-fg-light">
							{record.updated ?? 'Not updated'}
						</td>
						<td class="px-3 py-2.5">
							<span
								class="rounded-chip px-1.5 py-px font-mono text-[10px] font-medium {record.status ===
								'verified'
									? 'bg-status-success-subtle text-status-success'
									: record.status === 'active'
										? 'bg-accent-subtle text-accent-primary'
										: 'bg-status-warning-subtle text-status-warning'}"
							>
								{record.strength ?? 'Not scored'}
							</span>
						</td>
						<td class="px-3 py-2.5 font-mono text-fg-main tabular-nums">
							{record.links ?? 0}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<footer
		class="flex min-h-9 items-center justify-between border-t border-canvas-border bg-canvas-secondary px-3 text-xs text-fg-light"
	>
		<span>{records.length} records ({selectedSet.size} selected)</span>
		<span class="font-mono tabular-nums">{totalLinks} links</span>
	</footer>
</section>
