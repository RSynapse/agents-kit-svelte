<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { FileIcon, FolderOpen } from '@lucide/svelte';
	export interface WorktreeFileNode {
		path: string;
		name: string;
		kind: 'folder' | 'file';
		additions?: number;
		deletions?: number;
		children?: WorktreeFileNode[];
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'nodes' | 'selectedPath' | 'onSelect'> {
		nodes: WorktreeFileNode[];
		selectedPath?: string;
		onSelect?: (path: string) => void;
		class?: string;
	}

	let { nodes, selectedPath, onSelect, class: className = '', ...rest }: Props = $props();
</script>

<div {...rest}
	role="tree"
	aria-label="Worktree changed files"
	class={cn('rounded-card border border-card-border bg-card-bg p-2 font-mono text-xs', className)}
>
	{#each nodes as node (node.path)}
		{#if node.kind === 'folder'}
			<div role="treeitem" aria-selected={selectedPath === node.path} class="py-0.5">
				<div class="flex items-center gap-1.5 px-2 py-1 font-medium text-fg-light">
					<FolderOpen aria-hidden="true" class="size-3.5 shrink-0 text-fg-light" />
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
									<FileIcon aria-hidden="true" class="size-3.5 shrink-0 text-fg-light" />
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
					<FileIcon aria-hidden="true" class="size-3.5 shrink-0 text-fg-light" />
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
