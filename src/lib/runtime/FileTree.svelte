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
				<div class="flex items-center gap-1.5 px-2 py-1 font-medium text-fg-light">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-3.5 shrink-0 text-fg-light"
					>
						<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
					</svg>
					<span class="truncate">{node.name}</span>
				</div>
				{#if node.children}
					<div class="ml-3.5 border-l border-canvas-border pl-2">
						{#each node.children as child (child.path)}
							<button
								type="button"
								role="treeitem"
								aria-selected={selectedPath === child.path}
								onclick={() => onSelect?.(child.path)}
								class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors {selectedPath ===
								child.path
									? 'bg-canvas-secondary font-medium text-fg-main'
									: 'text-fg-light hover:bg-canvas-secondary/60 hover:text-fg-main'}"
							>
								<span class="flex min-w-0 items-center gap-1.5 truncate">
									<svg
										aria-hidden="true"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="size-3.5 shrink-0 text-fg-light"
									>
										<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
										<path d="M14 2v4a2 2 0 0 0 2 2h4" />
									</svg>
									<span class="truncate">{child.name}</span>
								</span>
								{#if child.additions !== undefined || child.deletions !== undefined}
									<span class="flex shrink-0 items-center gap-1 font-sans text-[11px] font-medium tabular-nums">
										{#if child.additions !== undefined}
											<span class="text-diff-add-fg">+{child.additions}</span>
										{/if}
										{#if child.deletions !== undefined}
											<span class="text-diff-del-fg">−{child.deletions}</span>
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
					? 'bg-canvas-secondary font-medium text-fg-main'
					: 'text-fg-light hover:bg-canvas-secondary/60 hover:text-fg-main'}"
			>
				<span class="flex min-w-0 items-center gap-1.5 truncate">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-3.5 shrink-0 text-fg-light"
					>
						<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
						<path d="M14 2v4a2 2 0 0 0 2 2h4" />
					</svg>
					<span class="truncate">{node.name}</span>
				</span>
				{#if node.additions !== undefined || node.deletions !== undefined}
					<span class="flex shrink-0 items-center gap-1 font-sans text-[11px] font-medium tabular-nums">
						{#if node.additions !== undefined}
							<span class="text-diff-add-fg">+{node.additions}</span>
						{/if}
						{#if node.deletions !== undefined}
							<span class="text-diff-del-fg">−{node.deletions}</span>
						{/if}
					</span>
				{/if}
			</button>
		{/if}
	{/each}
</div>
