<script lang="ts">
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

	interface Props {
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
		class: className = ''
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
				return 'COMMIT';
			case 'issue':
				return 'ISSUE';
			case 'schema':
				return 'SCHEMA';
			case 'file':
			default:
				return 'FILE';
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

<div
	class="divide-y divide-canvas-border rounded-xl border border-card-border bg-card-bg text-fg-main {className}"
>
	<header class="flex items-center justify-between gap-2 px-4 py-2.5 text-xs">
		<span class="font-semibold text-fg-main">Attached Context ({internalChunks.length})</span>
		{#if totalTokens > 0}
			<span class="font-mono text-fg-light tabular-nums">
				{formatCompactTokens(totalTokens)} tokens
			</span>
		{/if}
	</header>

	{#each internalChunks as chunk (chunk.id)}
		{@const isSelected = activeId === chunk.id}
		<div
			class="flex items-start justify-between gap-3 p-3.5 transition-colors {isSelected
				? 'bg-accent-subtle'
				: 'hover:bg-canvas-secondary'}"
		>
			<button
				type="button"
				onclick={() => handleSelect(chunk.id)}
				class="min-w-0 flex-1 text-left"
			>
				<div class="flex flex-wrap items-center gap-2">
					<span
						class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-fg-light"
					>
						{getKindBadge(chunk.kind)}
					</span>
					<strong class="truncate text-xs font-semibold text-fg-main">{chunk.title}</strong>
				</div>

				<p class="mt-1 line-clamp-2 text-xs leading-5 text-fg-light">
					{chunk.content}
				</p>

				<div class="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-fg-light">
					<span>{chunk.source}</span>
					{#if chunk.tokens !== undefined}
						<span>· {formatCompactTokens(chunk.tokens)} tok</span>
					{/if}
					{#if chunk.score !== undefined}
						<span class="text-status-success">· {Math.round(chunk.score * 100)}% match</span>
					{/if}
				</div>
			</button>

			<button
				type="button"
				aria-label="Remove {chunk.title}"
				onclick={() => handleRemove(chunk.id)}
				class="shrink-0 rounded-md px-2 py-1 font-mono text-xs text-fg-light transition-colors hover:bg-status-danger-subtle hover:text-status-danger"
			>
				✕
			</button>
		</div>
	{:else}
		<p class="p-6 text-center text-xs text-fg-light">No context items attached</p>
	{/each}
</div>
