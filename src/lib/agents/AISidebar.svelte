<script lang="ts">
	export type SidebarResourceKind = 'folder' | 'project' | 'file' | 'bookmark' | 'worktree';

	export interface SidebarResource {
		id: string;
		label: string;
		kind: SidebarResourceKind;
		pinned?: boolean;
		badge?: string;
		disabled?: boolean;
		children?: SidebarResource[];
	}

	interface FlatSidebarRow {
		item: SidebarResource;
		depth: number;
		parentId: string | null;
	}

	interface Props {
		items?: SidebarResource[];
		activeId?: string | null;
		defaultExpandedIds?: string[];
		ariaLabel?: string;
		searchable?: boolean;
		onSelect?: (id: string) => void;
		onActiveChange?: (id: string) => void;
		onRename?: (id: string, label: string) => void;
		onTogglePin?: (id: string, pinned: boolean) => void;
		class?: string;
	}

	const DEFAULT_ITEMS: SidebarResource[] = [
		{
			id: 'wt-184',
			label: 'feat/issue-184-worktree',
			kind: 'worktree',
			pinned: true,
			badge: 'T2',
			children: [
				{
					id: 'src-agents',
					label: 'src/lib/agents',
					kind: 'folder',
					children: [
						{ id: 'file-sidebar', label: 'AISidebar.svelte', kind: 'file', badge: '+142' },
						{ id: 'file-approval', label: 'ApprovalCard.svelte', kind: 'file', badge: 'clean' }
					]
				},
				{
					id: 'file-spec',
					label: 'docs/specs/run-dispatch.md',
					kind: 'bookmark',
					pinned: true
				}
			]
		},
		{
			id: 'proj-contracts',
			label: 'contracts/g0',
			kind: 'project',
			children: [
				{ id: 'file-schema', label: 'schema/envelope.json', kind: 'file' },
				{ id: 'file-validator', label: 'src/validate.ts', kind: 'file' }
			]
		}
	];

	let {
		items = DEFAULT_ITEMS,
		activeId = undefined,
		defaultExpandedIds = ['wt-184', 'src-agents', 'proj-contracts'],
		ariaLabel = 'Workspace resources',
		searchable = true,
		onSelect,
		onActiveChange,
		onRename,
		onTogglePin,
		class: className = ''
	}: Props = $props();

	let internalItems = $state<SidebarResource[]>([]);
	let selectedId = $state<string | null>('file-sidebar');
	let expandedIds = $state<Set<string>>(new Set());
	let searchQuery = $state('');
	let renamingId = $state<string | null>(null);
	let renameDraft = $state('');

	$effect(() => {
		internalItems = structuredClone(items);
	});

	$effect(() => {
		expandedIds = new Set(defaultExpandedIds);
	});

	$effect(() => {
		if (activeId !== undefined) {
			selectedId = activeId;
		}
	});

	/**
	 * Determines whether a sidebar resource node can contain child items.
	 *
	 * @param item - Resource item to inspect.
	 * @returns True if the item is a container kind or already has children.
	 */
	function isContainer(item: SidebarResource): boolean {
		return (
			item.kind === 'folder' ||
			item.kind === 'project' ||
			item.kind === 'worktree' ||
			Boolean(item.children && item.children.length > 0)
		);
	}

	/**
	 * Recursively flattens a resource hierarchy into visible tree rows.
	 *
	 * @param list - Resource nodes at the current level.
	 * @param expanded - Set of expanded folder/project IDs.
	 * @param query - Lowercase search filter string.
	 * @param depth - Nesting depth (0-indexed).
	 * @param parentId - Parent node ID if nested.
	 * @returns Array of flattened rows for rendering.
	 */
	function flattenTree(
		list: SidebarResource[],
		expanded: Set<string>,
		query: string,
		depth = 0,
		parentId: string | null = null
	): FlatSidebarRow[] {
		const rows: FlatSidebarRow[] = [];
		for (const item of list) {
			const childRows = item.children
				? flattenTree(item.children, expanded, query, depth + 1, item.id)
				: [];
			const matchesSelf = !query || item.label.toLowerCase().includes(query);
			if (!matchesSelf && childRows.length === 0) {
				continue;
			}
			rows.push({ item, depth, parentId });
			if (item.children?.length && (expanded.has(item.id) || query.length > 0)) {
				rows.push(...childRows);
			}
		}
		return rows;
	}

	/**
	 * Collects all pinned items from the tree recursively.
	 *
	 * @param list - Resource tree to traverse.
	 * @returns Flat list of pinned resources.
	 */
	function collectPinned(list: SidebarResource[]): SidebarResource[] {
		const pinned: SidebarResource[] = [];
		for (const item of list) {
			if (item.pinned) {
				pinned.push(item);
			}
			if (item.children?.length) {
				pinned.push(...collectPinned(item.children));
			}
		}
		return pinned;
	}

	/**
	 * Updates a resource node immutably across the tree by ID.
	 *
	 * @param list - Current resource tree.
	 * @param id - Target resource ID.
	 * @param updater - Transformation function for the matching node.
	 * @returns Updated resource tree.
	 */
	function updateNodeById(
		list: SidebarResource[],
		id: string,
		updater: (node: SidebarResource) => SidebarResource
	): SidebarResource[] {
		return list.map((item) => {
			const updated = item.id === id ? updater(item) : item;
			if (updated.children?.length) {
				return {
					...updated,
					children: updateNodeById(updated.children, id, updater)
				};
			}
			return updated;
		});
	}

	/**
	 * Returns a concise icon glyph for a resource kind and expansion state.
	 *
	 * @param item - Resource item.
	 * @param isExpanded - Whether the item is currently expanded.
	 * @returns Unicode glyph representing the resource.
	 */
	function getIconGlyph(item: SidebarResource, isExpanded: boolean): string {
		if (item.kind === 'worktree') return '⎇';
		if (item.kind === 'folder' || item.kind === 'project') return isExpanded ? '📂' : '📁';
		if (item.kind === 'bookmark') return '★';
		return '📄';
	}

	/**
	 * Toggles the expanded state of a container node.
	 *
	 * @param id - Container resource ID.
	 */
	function toggleExpand(id: string): void {
		const next = new Set(expandedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		expandedIds = next;
	}

	/**
	 * Selects a resource item and notifies listeners.
	 *
	 * @param id - Selected resource ID.
	 */
	function selectItem(id: string): void {
		selectedId = id;
		onSelect?.(id);
		onActiveChange?.(id);
	}

	/**
	 * Begins inline renaming for the specified resource.
	 *
	 * @param item - Resource to rename.
	 */
	function startRename(item: SidebarResource): void {
		if (item.disabled) return;
		renamingId = item.id;
		renameDraft = item.label;
	}

	/**
	 * Commits the active inline rename draft if non-empty.
	 */
	function commitRename(): void {
		if (!renamingId) return;
		const trimmed = renameDraft.trim();
		const targetId = renamingId;
		if (trimmed.length > 0) {
			internalItems = updateNodeById(internalItems, targetId, (node) => ({
				...node,
				label: trimmed
			}));
			onRename?.(targetId, trimmed);
		}
		renamingId = null;
	}

	/**
	 * Toggles the pinned status of a resource item.
	 *
	 * @param item - Resource item to pin or unpin.
	 */
	function togglePin(item: SidebarResource): void {
		const nextPinned = !item.pinned;
		internalItems = updateNodeById(internalItems, item.id, (node) => ({
			...node,
			pinned: nextPinned
		}));
		onTogglePin?.(item.id, nextPinned);
	}

	let normalizedQuery = $derived(searchQuery.trim().toLowerCase());
	let flatRows = $derived(flattenTree(internalItems, expandedIds, normalizedQuery));
	let pinnedItems = $derived(collectPinned(internalItems));
</script>

<aside
	aria-label={ariaLabel}
	class="flex w-full max-w-xs flex-col rounded-xl border border-card-border bg-card-bg p-3 text-sm text-fg-main {className}"
>
	<header class="mb-2 flex items-center justify-between gap-2 px-1">
		<span class="font-mono text-xs font-semibold tracking-wider text-fg-light uppercase">
			{ariaLabel}
		</span>
		<span class="rounded-full bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] text-fg-light">
			{flatRows.length}
		</span>
	</header>

	{#if searchable}
		<div class="mb-2.5">
			<input
				type="search"
				bind:value={searchQuery}
				placeholder="Filter files & worktrees…"
				aria-label="Filter workspace resources"
				class="h-8 w-full rounded-lg border border-card-border bg-canvas-primary px-2.5 text-xs text-fg-main placeholder:text-fg-light focus:border-accent-primary focus:outline-none"
			/>
		</div>
	{/if}

	{#if pinnedItems.length > 0 && !normalizedQuery}
		<div class="mb-2.5 border-b border-canvas-border pb-2">
			<p class="mb-1 px-1.5 font-mono text-[10px] font-semibold tracking-wider text-fg-light uppercase">
				Pinned
			</p>
			<div class="space-y-0.5">
				{#each pinnedItems as pin (pin.id)}
					<button
						type="button"
						onclick={() => selectItem(pin.id)}
						class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors {selectedId ===
						pin.id
							? 'bg-accent-subtle font-medium text-accent-primary'
							: 'text-fg-main hover:bg-canvas-secondary'}"
					>
						<span class=" truncate">📌 {pin.label}</span>
						{#if pin.badge}
							<span class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
								{pin.badge}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div role="tree" aria-label={ariaLabel} class="space-y-0.5">
		{#each flatRows as row (row.item.id)}
			{@const container = isContainer(row.item)}
			{@const isExpanded = expandedIds.has(row.item.id)}
			{@const isSelected = selectedId === row.item.id}
			<div
				role="treeitem"
				aria-level={row.depth + 1}
				aria-expanded={container ? isExpanded : undefined}
				aria-selected={isSelected}
				style="padding-left: {8 + row.depth * 14}px"
				class="group flex min-h-8 items-center gap-1.5 rounded-lg pr-1.5 transition-colors {isSelected
					? 'bg-accent-subtle text-accent-primary'
					: 'text-fg-main hover:bg-canvas-secondary'}"
			>
				<span aria-hidden="true" class="inline-flex size-4 shrink-0 items-center justify-center text-xs">
					{getIconGlyph(row.item, isExpanded)}
				</span>

				{#if renamingId === row.item.id}
					<input
						type="text"
						bind:value={renameDraft}
						aria-label="Rename {row.item.label}"
						onblur={commitRename}
						onkeydown={(event) => {
							if (event.key === 'Enter') commitRename();
							if (event.key === 'Escape') renamingId = null;
						}}
						class="h-6 min-w-0 flex-1 rounded border border-accent-primary bg-canvas-primary px-1.5 text-xs text-fg-main focus:outline-none"
					/>
				{:else}
					<button
						type="button"
						disabled={row.item.disabled}
						onclick={() => {
							if (container) toggleExpand(row.item.id);
							selectItem(row.item.id);
						}}
						ondblclick={() => startRename(row.item)}
						class="flex min-w-0 flex-1 items-center justify-between gap-2 py-1 text-left text-xs outline-none disabled:opacity-50"
					>
						<span class="truncate {isSelected ? 'font-semibold' : 'font-normal'}">
							{row.item.label}
						</span>
						{#if row.item.badge}
							<span class="shrink-0 rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
								{row.item.badge}
							</span>
						{/if}
					</button>

					<div class="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
						<button
							type="button"
							aria-label={row.item.pinned ? `Unpin ${row.item.label}` : `Pin ${row.item.label}`}
							onclick={() => togglePin(row.item)}
							class="rounded p-1 text-[10px] text-fg-light hover:bg-canvas-primary hover:text-fg-main"
						>
							{row.item.pinned ? '★' : '☆'}
						</button>
						<button
							type="button"
							aria-label="Rename {row.item.label}"
							onclick={() => startRename(row.item)}
							class="rounded p-1 text-[10px] text-fg-light hover:bg-canvas-primary hover:text-fg-main"
						>
							✎
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<p class="py-6 text-center text-xs text-fg-light">No matching workspace items</p>
		{/each}
	</div>
</aside>
