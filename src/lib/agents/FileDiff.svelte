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
			class="group flex min-w-0 flex-1 items-center gap-2 text-left text-fg-light outline-none transition-colors hover:text-fg-main"
		>
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="size-4 shrink-0 text-fg-light"
			>
				<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
				<path d="M14 2v4a2 2 0 0 0 2 2h4" />
				<path d="m10 13-2 2 2 2" />
				<path d="m14 17 2-2-2-2" />
			</svg>

			<code class="min-w-0 truncate font-mono text-xs text-fg-main">{filename}</code>

			<span class="ml-auto inline-flex shrink-0 items-center gap-1.5 font-sans text-xs font-medium tabular-nums">
				<span class="text-diff-add-fg">+{addedCount}</span>
				<span class="text-diff-del-fg">−{deletedCount}</span>
			</span>

			{#if status === 'complete'}
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-3.5 shrink-0 text-fg-light"
				>
					<path d="M20 6 9 17l-5-5" />
				</svg>
			{/if}

			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="size-4 shrink-0 text-fg-light transition-transform duration-150 group-hover:text-fg-main {isOpen
					? 'rotate-180'
					: ''}"
			>
				<path d="m6 9 6 6 6-6" />
			</svg>
		</button>

		<button
			type="button"
			aria-label={copied ? 'Copied diff' : 'Copy diff'}
			onclick={handleCopy}
			class="inline-flex size-7 items-center justify-center rounded-md text-fg-light transition-colors hover:bg-canvas-secondary hover:text-fg-main"
		>
			{#if copied}
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
			{:else}
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-3.5"
				>
					<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
					<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
				</svg>
			{/if}
		</button>
	</div>

	<AgentDisclosure id={panelId} open={isOpen}>
		<div
			role={status === 'streaming' ? 'log' : undefined}
			aria-live={status === 'streaming' ? 'polite' : undefined}
			class="overflow-auto border-t border-canvas-border bg-canvas-secondary/60 py-1.5 font-mono text-xs leading-5"
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
						<span class="select-none pr-1.5 text-right tabular-nums text-fg-light/60">
							{line.oldNumber ?? ''}
						</span>
						<span class="select-none pr-1.5 text-right tabular-nums text-fg-light/60">
							{line.newNumber ?? ''}
						</span>
						<span class="select-none text-center font-medium">
							{line.kind === 'add' ? '+' : line.kind === 'delete' ? '−' : ''}
						</span>
						<span class="whitespace-pre pr-4">{line.content}</span>
					</div>
				{/each}
			</div>
		</div>
	</AgentDisclosure>
</div>
