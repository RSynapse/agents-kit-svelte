<script lang="ts">
	export interface WorktreeFileNode {
		path: string;
		name: string;
		kind: 'folder' | 'file';
		additions?: number;
		deletions?: number;
		children?: WorktreeFileNode[];
	}

	interface Props {
		nodes: WorktreeFileNode[];
		selectedPath?: string;
		onSelect?: (path: string) => void;
		class?: string;
	}

	let { nodes, selectedPath, onSelect, class: className = '' }: Props = $props();
</script>

<div
	role="tree"
	aria-label="Worktree changed files"
	class="rounded-xl border border-card-border bg-card-bg p-2 font-mono text-xs {className}"
>
	{#each nodes as node (node.path)}
		{#if node.kind === 'folder'}
			<div role="treeitem" aria-selected={selectedPath === node.path} class="py-0.5">
				<div class="flex items-center gap-1.5 px-2 py-1 font-semibold text-fg-light">
					<span aria-hidden="true">📂</span>
					<span>{node.name}</span>
				</div>
				{#if node.children}
					<div class="ml-3 border-l border-canvas-border pl-2">
						{#each node.children as child (child.path)}
							<button
								type="button"
								role="treeitem"
								aria-selected={selectedPath === child.path}
								onclick={() => onSelect?.(child.path)}
								class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors {selectedPath ===
								child.path
									? 'bg-accent-subtle text-fg-main'
									: 'text-fg-main hover:bg-canvas-secondary'}"
							>
								<span class="truncate">📄 {child.name}</span>
								{#if child.additions !== undefined || child.deletions !== undefined}
									<span class="flex shrink-0 items-center gap-1 text-[11px] tabular-nums">
										{#if child.additions !== undefined}
											<span class="text-diff-add-fg">+{child.additions}</span>
										{/if}
										{#if child.deletions !== undefined}
											<span class="text-diff-del-fg">-{child.deletions}</span>
										{/if}
									</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<button
				type="button"
				role="treeitem"
				aria-selected={selectedPath === node.path}
				onclick={() => onSelect?.(node.path)}
				class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors {selectedPath ===
				node.path
					? 'bg-accent-subtle text-fg-main'
					: 'text-fg-main hover:bg-canvas-secondary'}"
			>
				<span class="truncate">📄 {node.name}</span>
				{#if node.additions !== undefined || node.deletions !== undefined}
					<span class="flex shrink-0 items-center gap-1 text-[11px] tabular-nums">
						{#if node.additions !== undefined}
							<span class="text-diff-add-fg">+{node.additions}</span>
						{/if}
						{#if node.deletions !== undefined}
							<span class="text-diff-del-fg">-{node.deletions}</span>
						{/if}
					</span>
				{/if}
			</button>
		{/if}
	{/each}
</div>
