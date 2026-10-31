<script lang="ts">
	import { Check, X } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	export interface DiffTableRow {
		id: string;
		field: string;
		before: string;
		after: string;
		status?: 'pending' | 'accepted' | 'rejected';
	}

	interface Props {
		rows?: DiffTableRow[];
		title?: string;
		onAccept?: (id: string) => void;
		onReject?: (id: string) => void;
		onApplyAll?: () => void;
		class?: string;
	}

	const DEFAULT_ROWS: DiffTableRow[] = [
		{
			id: 'row-tier',
			field: 'riskTier',
			before: 'T1 (Read-only)',
			after: 'T2 (Worktree isolated)',
			status: 'accepted'
		},
		{
			id: 'row-timeout',
			field: 'maxRunDurationSec',
			before: '300',
			after: '900',
			status: 'pending'
		},
		{
			id: 'row-branch',
			field: 'worktreeBranch',
			before: 'main',
			after: 'worktree/card-184-attempt-1',
			status: 'pending'
		}
	];

	let {
		rows = DEFAULT_ROWS,
		title = 'Review field changes',
		onAccept,
		onReject,
		onApplyAll,
		class: className = ''
	}: Props = $props();

	let internalRows = $state<DiffTableRow[]>([]);

	$effect(() => {
		internalRows = rows.map((row) => ({ ...row }));
	});

	/**
	 * Updates a single row decision status and invokes the appropriate callback.
	 *
	 * @param id - Row identifier.
	 * @param nextStatus - Decision status (`'accepted'` or `'rejected'`).
	 */
	function setDecision(id: string, nextStatus: 'accepted' | 'rejected'): void {
		internalRows = internalRows.map((row) =>
			row.id === id ? { ...row, status: nextStatus } : row
		);
		if (nextStatus === 'accepted') {
			onAccept?.(id);
		} else {
			onReject?.(id);
		}
	}

	/**
	 * Marks all rows in the comparison table as accepted.
	 */
	function handleApplyAll(): void {
		internalRows = internalRows.map((row) => ({ ...row, status: 'accepted' }));
		onApplyAll?.();
	}

	let acceptedCount = $derived(internalRows.filter((r) => r.status === 'accepted').length);
	let rejectedCount = $derived(internalRows.filter((r) => r.status === 'rejected').length);
	let pendingCount = $derived(internalRows.length - acceptedCount - rejectedCount);
</script>

<section
	class="overflow-hidden rounded-card border border-card-border bg-card-bg text-fg-main {className}"
>
	<header
		class="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-canvas-border px-4 py-2.5"
	>
		<div>
			<h2 class="text-sm font-semibold text-fg-main">{title}</h2>
			<p class="text-xs text-fg-light">{internalRows.length} changed fields</p>
		</div>

		<div aria-live="polite" class="flex items-center gap-3 font-mono text-xs tabular-nums">
			<span class="text-status-success">{acceptedCount} accepted</span>
			<span class="text-status-danger">{rejectedCount} rejected</span>
			<span class="text-fg-light">{pendingCount} pending</span>
		</div>
	</header>

	<div role="region" aria-label={title} class="overflow-x-auto">
		<table class="w-full min-w-[600px] text-left text-xs">
			<thead class="sticky top-0 bg-canvas-secondary text-fg-light">
				<tr>
					<th class="px-4 py-2.5 font-medium">Field</th>
					<th class="px-4 py-2.5 font-medium">Change</th>
					<th class="px-4 py-2.5 font-medium">Decision</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-canvas-border">
				{#each internalRows as row (row.id)}
					<tr class="align-top">
						<th class="w-40 px-4 py-3 font-mono font-medium text-fg-main">
							{row.field}
						</th>
						<td class="px-4 py-3">
							<div class="grid gap-1 font-mono text-xs">
								<div
									class="grid grid-cols-[1rem_1fr] rounded bg-diff-del-bg px-2 py-1 text-diff-del-fg {row.status ===
									'accepted'
										? 'line-through opacity-55'
										: ''}"
								>
									<span aria-hidden="true">-</span>
									<span class="break-words">{row.before}</span>
								</div>
								<div
									class="grid grid-cols-[1rem_1fr] rounded bg-diff-add-bg px-2 py-1 text-diff-add-fg {row.status ===
									'rejected'
										? 'line-through opacity-55'
										: ''}"
								>
									<span aria-hidden="true">+</span>
									<span class="break-words">{row.after}</span>
								</div>
							</div>
						</td>
						<td class="w-44 px-4 py-3">
							<div class="flex items-center gap-1.5">
								<button
									type="button"
									aria-pressed={row.status === 'rejected'}
									onclick={() => setDecision(row.id, 'rejected')}
									class="rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors {row.status ===
									'rejected'
										? 'border-status-danger bg-status-danger-subtle text-status-danger'
										: 'border-card-border bg-canvas-primary text-fg-light hover:text-fg-main'}"
								>
									<X aria-hidden="true" />
									Reject
								</button>
								<button
									type="button"
									aria-pressed={row.status === 'accepted'}
									onclick={() => setDecision(row.id, 'accepted')}
									class="rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors {row.status ===
									'accepted'
										? 'border-status-success bg-status-success-subtle text-status-success'
										: 'border-card-border bg-canvas-primary text-fg-light hover:text-fg-main'}"
								>
									<Check aria-hidden="true" />
									Accept
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<footer
		class="flex min-h-11 items-center justify-between gap-3 border-t border-canvas-border bg-canvas-secondary px-4 py-2"
	>
		<span class="text-xs text-fg-light">Decisions apply only after confirmation.</span>
		<button
			type="button"
			onclick={handleApplyAll}
			class={buttonClass('primary', 'md')}
		>
			Apply all {internalRows.length} changes
		</button>
	</footer>
</section>
