<script lang="ts">
	import AgentDisclosure from './AgentDisclosure.svelte';
	import { parseUnifiedDiff } from '../state/chat-helpers';
	import type { FileDiffStatus } from '../types';

	interface Props {
		filename: string;
		patch: string;
		status?: FileDiffStatus;
		additions?: number;
		deletions?: number;
		defaultOpen?: boolean;
		maxHeight?: number;
		class?: string;
	}

	const COPY_FEEDBACK_MS = 1600;

	let {
		filename,
		patch,
		status = 'complete',
		additions,
		deletions,
		defaultOpen = true,
		maxHeight = 280,
		class: className = ''
	}: Props = $props();

	let isOpen = $state(true);
	let copied = $state(false);

	$effect(() => {
		isOpen = defaultOpen;
	});

	let parsed = $derived(parseUnifiedDiff(patch));
	let addedCount = $derived(additions ?? parsed.additions);
	let deletedCount = $derived(deletions ?? parsed.deletions);
	let panelId = $derived(`file-diff-${filename.replace(/[^a-zA-Z0-9_-]/g, '-')}`);

	/**
	 * Copies the raw unified diff patch to the clipboard.
	 */
	async function handleCopy(): Promise<void> {
		await navigator.clipboard?.writeText(patch);
		copied = true;
		window.setTimeout(() => {
			copied = false;
		}, COPY_FEEDBACK_MS);
	}
</script>

<div
	data-state={status}
	aria-busy={status === 'streaming'}
	class="w-full overflow-hidden rounded-lg border border-card-border bg-card-bg text-sm {className}"
>
	<div class="flex h-10 items-center gap-2 px-3">
		<button
			type="button"
			aria-expanded={isOpen}
			aria-controls={panelId}
			onclick={() => (isOpen = !isOpen)}
			class="flex min-w-0 flex-1 items-center gap-2 text-left outline-none"
		>
			<span
				aria-hidden="true"
				class="inline-flex size-4 shrink-0 items-center justify-center rounded bg-canvas-secondary font-mono text-[10px] text-fg-light"
			>
				±
			</span>

			<code class="min-w-0 truncate font-mono text-xs text-fg-main">{filename}</code>

			<span class="ml-auto inline-flex shrink-0 items-center gap-1.5 font-mono text-xs tabular-nums">
				<span class="font-medium text-diff-add-fg">+{addedCount}</span>
				<span class="font-medium text-diff-del-fg">-{deletedCount}</span>
			</span>

			<span
				aria-hidden="true"
				class="text-xs text-fg-light transition-transform duration-150 {isOpen ? 'rotate-180' : ''}"
			>
				▾
			</span>
		</button>

		<button
			type="button"
			aria-label={copied ? 'Copied diff' : 'Copy diff'}
			onclick={handleCopy}
			class="rounded px-2 py-0.5 font-mono text-[11px] text-fg-light transition-colors hover:bg-canvas-secondary hover:text-fg-main"
		>
			{copied ? 'Copied' : 'Copy'}
		</button>
	</div>

	<AgentDisclosure id={panelId} open={isOpen}>
		<div
			role={status === 'streaming' ? 'log' : undefined}
			aria-live={status === 'streaming' ? 'polite' : undefined}
			class="overflow-auto border-t border-canvas-border py-1.5 font-mono text-xs leading-5"
			style="max-height: {maxHeight}px;"
		>
			<div class="min-w-max">
				{#each parsed.lines as line (line.id)}
					<div
						class="grid min-h-5 grid-cols-[2.25rem_2.25rem_1.25rem_minmax(0,1fr)] items-baseline {line.kind ===
						'add'
							? 'bg-diff-add-bg text-diff-add-fg'
							: line.kind === 'delete'
								? 'bg-diff-del-bg text-diff-del-fg'
								: line.kind === 'hunk'
									? 'bg-canvas-secondary text-fg-light'
									: 'text-fg-main'}"
					>
						<span class="select-none pr-1.5 text-right tabular-nums text-fg-light">
							{line.oldNumber ?? ''}
						</span>
						<span class="select-none pr-1.5 text-right tabular-nums text-fg-light">
							{line.newNumber ?? ''}
						</span>
						<span class="select-none text-center font-semibold">
							{line.kind === 'add' ? '+' : line.kind === 'delete' ? '-' : ''}
						</span>
						<span class="whitespace-pre pr-4">{line.content}</span>
					</div>
				{/each}
			</div>
		</div>
	</AgentDisclosure>
</div>
