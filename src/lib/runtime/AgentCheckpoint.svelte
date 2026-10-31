<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { buttonClass } from '../ui/styles';
	import { Check, GitCommitHorizontal, RotateCcw } from '@lucide/svelte';
	import type { CheckpointEntry } from '../types';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'checkpoint' | 'onRestore'> {
		checkpoint: CheckpointEntry;
		onRestore?: (checkpointId: string) => void;
		class?: string;
	}

	let { checkpoint, onRestore, class: className = '', ...rest }: Props = $props();

	let restored = $state(false);

	/**
	 * Triggers a worktree checkpoint restore callback and records the restored state.
	 */
	function handleRestore(): void {
		restored = true;
		onRestore?.(checkpoint.id);
	}
</script>

<div {...rest}
	role="region"
	aria-label="Worktree checkpoint {checkpoint.commitSha}"
	class={cn('flex flex-wrap items-center justify-between gap-2 rounded-lg border border-card-border bg-card-bg px-3.5 py-2.5 text-xs', className)}
>
	<div class="flex min-w-0 flex-wrap items-center gap-2">
		<span
			aria-hidden="true"
			class="inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-card-border bg-canvas-secondary text-fg-light"
		>
			<GitCommitHorizontal class="size-3.5" />
		</span>
		<span class="font-medium text-fg-main">{checkpoint.title}</span>
		<code class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px] text-fg-main">
			{checkpoint.commitSha}
		</code>
		<span class="text-fg-light">· {checkpoint.description}</span>
		<span class="font-mono text-[11px] text-fg-light">
			({checkpoint.filesChanged} {checkpoint.filesChanged === 1 ? 'file' : 'files'} · {checkpoint.timestamp})
		</span>
	</div>

	{#if checkpoint.restorable !== false}
		<button
			type="button"
			onclick={handleRestore}
			class={buttonClass('secondary', 'sm')}
		>
			{#if restored}
				<Check aria-hidden="true" class="size-3.5 text-status-success" />
				<span>Restored to checkpoint</span>
			{:else}
				<RotateCcw aria-hidden="true" class="size-3.5 text-fg-light" />
				<span>Restore worktree</span>
			{/if}
		</button>
	{/if}
</div>
