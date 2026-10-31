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
	class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-card-border bg-card-bg px-3.5 py-2.5 text-xs {className}"
>
	<div class="flex min-w-0 flex-wrap items-center gap-2">
		<span
			aria-hidden="true"
			class="inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-card-border bg-canvas-secondary text-fg-light"
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="size-3.5"
			>
				<circle cx="12" cy="12" r="3" />
				<line x1="3" x2="9" y1="12" y2="12" />
				<line x1="15" x2="21" y1="12" y2="12" />
			</svg>
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
			class="inline-flex h-7 items-center gap-1.5 rounded-md border border-card-border bg-card-bg px-2.5 font-medium text-fg-main transition-colors hover:bg-canvas-secondary"
		>
			{#if restored}
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-3.5 text-status-success"
				>
					<path d="M20 6 9 17l-5-5" />
				</svg>
				<span>Restored to checkpoint</span>
			{:else}
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-3.5 text-fg-light"
				>
					<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
					<path d="M3 3v5h5" />
				</svg>
				<span>Restore worktree</span>
			{/if}
		</button>
	{/if}
</div>
