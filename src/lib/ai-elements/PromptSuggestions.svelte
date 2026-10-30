<script lang="ts">
	export interface PromptSuggestionItem {
		id: string;
		category: 'inspect' | 'implement' | 'verify' | 'review';
		label: string;
		prompt: string;
	}

	interface Props {
		suggestions?: PromptSuggestionItem[];
		highlightQuery?: string;
		selectedCategory?: 'all' | 'inspect' | 'implement' | 'verify' | 'review';
		onSelect?: (item: PromptSuggestionItem) => void;
		class?: string;
	}

	const DEFAULT_SUGGESTIONS: PromptSuggestionItem[] = [
		{
			id: 'sug-1',
			category: 'inspect',
			label: 'Audit Svelte 5 Runes compliance',
			prompt: 'Scan all components in src/lib/ and verify zero legacy Svelte 4 prop declarations or reactive statements.'
		},
		{
			id: 'sug-2',
			category: 'implement',
			label: 'Generate isolated worktree plan',
			prompt: 'Draft a T2 execution plan with file targets and test verification gates.'
		},
		{
			id: 'sug-3',
			category: 'verify',
			label: 'Run referee contract check',
			prompt: 'Execute the unit test suite and validate OKLCH semantic token contrast.'
		},
		{
			id: 'sug-4',
			category: 'review',
			label: 'Summarize pull request diff',
			prompt: 'Inspect changed hunks and highlight potential SSR hydration risks.'
		}
	];

	const CATEGORIES: { id: 'all' | 'inspect' | 'implement' | 'verify' | 'review'; label: string }[] =
		[
			{ id: 'all', label: 'All' },
			{ id: 'inspect', label: 'Inspect' },
			{ id: 'implement', label: 'Implement' },
			{ id: 'verify', label: 'Verify' },
			{ id: 'review', label: 'Review' }
		];

	let {
		suggestions = DEFAULT_SUGGESTIONS,
		highlightQuery = '',
		selectedCategory = 'all',
		onSelect,
		class: className = ''
	}: Props = $props();

	let activeCategory = $state<'all' | 'inspect' | 'implement' | 'verify' | 'review'>('all');
	let searchFilter = $state('');
	let selectedPrompt = $state<PromptSuggestionItem | null>(null);

	$effect(() => {
		activeCategory = selectedCategory;
		searchFilter = highlightQuery;
	});

	let filteredSuggestions = $derived.by(() => {
		return suggestions.filter((item) => {
			const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
			const q = searchFilter.trim().toLowerCase();
			if (!q) return matchesCategory;
			return (
				matchesCategory &&
				(item.label.toLowerCase().includes(q) || item.prompt.toLowerCase().includes(q))
			);
		});
	});

	/**
	 * Splits text into before, matched, and after segments for case-insensitive query highlighting.
	 *
	 * @param text - Source text to segment.
	 * @param query - Highlight search query.
	 * @returns Object with `before`, `match`, and `after` strings.
	 */
	function splitHighlight(
		text: string,
		query: string
	): { before: string; match: string; after: string } {
		const trimmed = query.trim();
		if (!trimmed) {
			return { before: text, match: '', after: '' };
		}
		const lowerText = text.toLowerCase();
		const lowerQuery = trimmed.toLowerCase();
		const index = lowerText.indexOf(lowerQuery);
		if (index === -1) {
			return { before: text, match: '', after: '' };
		}
		return {
			before: text.slice(0, index),
			match: text.slice(index, index + trimmed.length),
			after: text.slice(index + trimmed.length)
		};
	}

	/**
	 * Selects a prompt suggestion pill and fires the optional `onSelect` callback.
	 *
	 * @param item - Selected PromptSuggestionItem.
	 */
	function chooseSuggestion(item: PromptSuggestionItem): void {
		selectedPrompt = item;
		onSelect?.(item);
	}
</script>

<div class="w-full rounded-xl border border-card-border bg-card-bg p-4 text-sm {className}">
	<div class="flex flex-wrap items-center justify-between gap-2 pb-3">
		<div class="flex flex-wrap items-center gap-1.5">
			{#each CATEGORIES as cat (cat.id)}
				<button
					type="button"
					aria-pressed={activeCategory === cat.id}
					onclick={() => (activeCategory = cat.id)}
					class="rounded-full px-3 py-1 font-mono text-xs font-medium transition-colors {activeCategory ===
					cat.id
						? 'bg-accent-primary text-fg-inverse'
						: 'bg-canvas-secondary text-fg-light hover:text-fg-main'}"
				>
					{cat.label}
				</button>
			{/each}
		</div>

		<input
			type="search"
			aria-label="Filter prompt suggestions"
			placeholder="Filter suggestions..."
			bind:value={searchFilter}
			class="rounded-lg border border-card-border bg-canvas-primary px-3 py-1 font-mono text-xs text-fg-main outline-none focus:border-accent-primary"
		/>
	</div>

	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
		{#each filteredSuggestions as item (item.id)}
			{@const parts = splitHighlight(item.label, searchFilter)}
			{@const isSelected = selectedPrompt?.id === item.id}
			<button
				type="button"
				onclick={() => chooseSuggestion(item)}
				class="flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors {isSelected
					? 'border-accent-primary bg-accent-subtle'
					: 'border-card-border bg-canvas-primary hover:bg-canvas-secondary'}"
			>
				<div class="flex w-full items-center justify-between gap-2">
					<span class="font-medium text-fg-main">
						{parts.before}{#if parts.match}<span class="rounded bg-accent-subtle px-0.5 font-semibold text-accent-primary">{parts.match}</span>{/if}{parts.after}
					</span>
					<span class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase text-fg-light">
						{item.category}
					</span>
				</div>
				<p class="line-clamp-2 text-xs text-fg-light">{item.prompt}</p>
			</button>
		{/each}
	</div>

	{#if selectedPrompt}
		<div class="mt-3 flex items-center justify-between gap-2 rounded-lg border border-card-border bg-canvas-secondary px-3 py-2 text-xs">
			<span class="truncate font-mono text-fg-main">
				Selected: {selectedPrompt.prompt}
			</span>
			<button
				type="button"
				onclick={() => (selectedPrompt = null)}
				class="shrink-0 font-mono text-fg-light underline hover:text-fg-main"
			>
				Clear
			</button>
		</div>
	{/if}
</div>
