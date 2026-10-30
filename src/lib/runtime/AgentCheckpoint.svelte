<script lang="ts">
	import type { CheckpointEntry } from '../types';

	interface Props {
		checkpoint: CheckpointEntry;
		onRestore?: (checkpointId: string) => void;
		class?: string;
	}

	let { checkpoint, onRestore, class: className = '' }: Props = $props();

	let restored = $state(false);

	/**
	 * Triggers a worktree checkpoint restore callback and records the restored state.
	 */
	function handleRestore(): void {
		restored = true;
		onRestore?.(checkpoint.id);
	}
</script>

<div
	role="region"
	aria-label="Worktree checkpoint {checkpoint.commitSha}"
	class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-card-border bg-canvas-secondary px-3 py-2 text-xs {className}"
>
	<div class="flex min-w-0 flex-wrap items-center gap-2">
		<span
			aria-hidden="true"
			class="inline-flex size-5 shrink-0 items-center justify-center rounded bg-card-bg font-mono text-[11px] text-accent-primary"
		>
			⚑
		</span>
		<span class="font-semibold text-fg-main">{checkpoint.title}</span>
		<code class="rounded bg-card-bg px-1.5 py-0.5 font-mono text-[11px] text-fg-light">
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
			class="rounded-md border border-card-border bg-card-bg px-2.5 py-1 font-medium text-fg-main transition-colors hover:bg-canvas-primary"
		>
			{restored ? '✓ Restored to checkpoint' : '↺ Restore worktree'}
		</button>
	{/if}
</div>
