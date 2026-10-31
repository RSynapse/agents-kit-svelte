<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { buttonClass } from '../ui/styles';
	import { AlignLeft, ArrowUpRight, X } from '@lucide/svelte';
	import { formatCompactTokens } from '../state/chat-helpers';

	export type ContextCardKind = 'file' | 'url' | 'commit' | 'issue' | 'schema';

	export interface ContextChunk {
		id: string;
		title: string;
		source: string;
		content: string;
		kind?: ContextCardKind;
		tokens?: number;
		score?: number;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'chunks' | 'selectedId' | 'onSelect' | 'onRemove'> {
		chunks?: ContextChunk[];
		selectedId?: string;
		onSelect?: (id: string) => void;
		onRemove?: (id: string) => void;
		class?: string;
	}

	const DEFAULT_CHUNKS: ContextChunk[] = [
		{
			id: 'ctx-spec',
			title: 'G0 Browser Read Contract',
			source: 'docs/specs/browser-read-contract.md',
			kind: 'file',
			tokens: 4200,
			score: 0.96,
			content: 'Defines sample workspace isolation, provenance badges, and client stream recovery.'
		},
		{
			id: 'ctx-issue',
			title: 'Issue 184: Worktree isolation guard',
			source: 'RSynapse/trailside · Issue 184',
			kind: 'issue',
			tokens: 1450,
			score: 0.91,
			content: 'Each dispatched workflow run executes in a dedicated git worktree with clean status.'
		},
		{
			id: 'ctx-schema',
			title: 'RunEnvelope JSON Schema',
			source: 'contracts/g0/schema/run-envelope.json',
			kind: 'schema',
			tokens: 980,
			score: 0.88,
			content: 'Strict protocol shape validation separated from pure domain decisions.'
		}
	];

	let {
		chunks = DEFAULT_CHUNKS,
		selectedId = undefined,
		onSelect,
		onRemove,
		class: className = '',
		...rest
	}: Props = $props();

	let internalChunks = $state<ContextChunk[]>([]);
	let activeId = $state<string | undefined>('ctx-spec');

	$effect(() => {
		internalChunks = [...chunks];
	});

	$effect(() => {
		if (selectedId !== undefined) {
			activeId = selectedId;
		}
	});

	/**
	 * Maps a context item kind to a concise badge label.
	 *
	 * @param kind - Optional context item kind.
	 * @returns Short uppercase badge text.
	 */
	function getKindBadge(kind?: ContextCardKind): string {
		switch (kind) {
			case 'url':
				return 'URL';
			case 'commit':
				return 'GIT';
			case 'issue':
				return 'ISS';
			case 'schema':
				return 'JSON';
			case 'file':
			default:
				return 'MD';
		}
	}

	/**
	 * Selects a context chunk card for inspection.
	 *
	 * @param id - Context chunk identifier.
	 */
	function handleSelect(id: string): void {
		activeId = id;
		onSelect?.(id);
	}

	/**
	 * Removes a context chunk from the active set and invokes the callback.
	 *
	 * @param id - Context chunk identifier to remove.
	 */
	function handleRemove(id: string): void {
		internalChunks = internalChunks.filter((chunk) => chunk.id !== id);
		onRemove?.(id);
	}

	let totalTokens = $derived(
		internalChunks.reduce((sum, item) => sum + (item.tokens ?? 0), 0)
	);
</script>

<div {...rest} class="flex w-full flex-col gap-2.5 text-fg-main {className}">
	<header class="flex items-center justify-between gap-2 px-0.5 text-xs">
		<div class="flex items-center gap-2">
			<span class="text-[13px] font-semibold text-fg-main">Retrieved chunks</span>
			<span
				class="inline-flex h-5 items-center rounded-md border border-card-border bg-canvas-secondary px-1.5 font-mono text-[11px] font-medium tabular-nums text-fg-light"
			>
				{internalChunks.length}
			</span>
		</div>
		{#if totalTokens > 0}
			<span class="font-mono text-xs text-fg-light tabular-nums">
				{formatCompactTokens(totalTokens)} tokens
			</span>
		{/if}
	</header>

	{#each internalChunks as chunk (chunk.id)}
		{@const isSelected = activeId === chunk.id}
		<div
			class="overflow-hidden rounded-xl border bg-card-bg transition-colors {isSelected
				? 'border-accent-primary'
				: 'border-card-border'}"
		>
			<div class="flex items-center justify-between gap-2 border-b border-canvas-border px-3.5 py-2">
				<button
					type="button"
					onclick={() => handleSelect(chunk.id)}
					class="flex min-w-0 flex-1 items-center gap-2 text-left text-[13px] font-medium text-fg-main"
				>
					<AlignLeft aria-hidden="true" class="size-3.5 shrink-0 text-fg-light" />
					<span class="truncate">{chunk.title}</span>
				</button>

				<div class="flex shrink-0 items-center gap-2">
					{#if chunk.tokens !== undefined}
						<span class="font-mono text-xs text-fg-light tabular-nums">
							{formatCompactTokens(chunk.tokens)} tok
						</span>
					{/if}
					<button
						type="button"
						aria-label="Remove {chunk.title}"
						onclick={() => handleRemove(chunk.id)}
						class={buttonClass('ghost', 'icon-xs')}
					>
						<X aria-hidden="true" class="size-3.5" />
					</button>
				</div>
			</div>

			<p class="px-3.5 pt-2.5 pb-2 text-xs leading-relaxed text-fg-light">
				{chunk.content}
			</p>

			<div class="flex items-center justify-between gap-2 px-3.5 pb-3">
				<span
					class="inline-flex h-6 items-center gap-1.5 rounded-full border border-card-border bg-canvas-secondary px-2.5 text-xs font-medium text-fg-main"
				>
					<span
						class="inline-flex h-4 items-center justify-center rounded px-1 font-mono text-[9px] font-bold {chunk.kind ===
						'issue'
							? 'bg-status-success text-fg-inverse'
							: chunk.kind === 'schema'
								? 'bg-status-warning text-fg-inverse'
								: 'bg-accent-primary text-fg-inverse'}"
					>
						{getKindBadge(chunk.kind)}
					</span>
					<span class="truncate font-mono text-[11px]">{chunk.source}</span>
					<ArrowUpRight aria-hidden="true" class="size-2.5 text-fg-light" />
				</span>

				{#if chunk.score !== undefined}
					<span class="font-mono text-[11px] font-medium text-status-success tabular-nums">
						{Math.round(chunk.score * 100)}% match
					</span>
				{/if}
			</div>
		</div>
	{:else}
		<p class="rounded-card border border-card-border bg-card-bg p-6 text-center text-xs text-fg-light">
			No context items attached
		</p>
	{/each}
</div>
