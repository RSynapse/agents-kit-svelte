<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { pillClass } from '../ui/styles';
	import { Check, ChevronDown, Copy, FileCode } from '@lucide/svelte';
	import AgentDisclosure from './AgentDisclosure.svelte';
	import { parseUnifiedDiff } from '../state/chat-helpers';
	import type { FileDiffStatus } from '../types';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'filename' | 'patch' | 'status' | 'additions' | 'deletions' | 'defaultOpen' | 'maxHeight'> {
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
		class: className = '',
		...rest
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

<div {...rest}
	data-state={status}
	aria-busy={status === 'streaming'}
	class={cn('w-full overflow-hidden rounded-soft border border-chat-border bg-card-bg ak-shadow-soft-sm text-sm', className)}
>
	<div class="flex h-10 items-center gap-2 px-3">
		<button
			type="button"
			aria-expanded={isOpen}
			aria-controls={panelId}
			onclick={() => (isOpen = !isOpen)}
			class="group flex min-w-0 flex-1 items-center gap-2 text-left text-fg-light outline-none transition-colors hover:text-fg-main"
		>
			<FileCode aria-hidden="true" class="size-4 shrink-0 text-fg-light" />

			<code class="min-w-0 truncate font-mono text-xs text-fg-main">{filename}</code>

			<span class="ml-auto inline-flex shrink-0 items-center gap-1.5 font-sans text-xs font-medium tabular-nums">
				<span class="text-diff-add-fg">+{addedCount}</span>
				<span class="text-diff-del-fg">−{deletedCount}</span>
			</span>

			{#if status === 'complete'}
				<Check aria-hidden="true" class="size-3.5 shrink-0 text-fg-light" />
			{/if}

			<ChevronDown aria-hidden="true" class="size-4 shrink-0 text-fg-light transition-transform duration-150 group-hover:text-fg-main {isOpen
					? 'rotate-180'
					: ''}" />
		</button>

		<button
			type="button"
			aria-label={copied ? 'Copied diff' : 'Copy diff'}
			onclick={handleCopy}
			class={pillClass('ghost', 'icon-sm')}
		>
			{#if copied}
				<Check aria-hidden="true" class="size-3.5 text-status-success" />
			{:else}
				<Copy aria-hidden="true" class="size-3.5" />
			{/if}
		</button>
	</div>

	<AgentDisclosure id={panelId} open={isOpen}>
		<div
			role={status === 'streaming' ? 'log' : undefined}
			aria-live={status === 'streaming' ? 'polite' : undefined}
			class="overflow-auto border-t border-chat-border/70 bg-chat-surface/60 py-1.5 font-mono text-xs leading-5"
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
									? 'bg-chat-surface text-fg-light'
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
