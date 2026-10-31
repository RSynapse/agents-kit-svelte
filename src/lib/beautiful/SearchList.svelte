<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Search } from '@lucide/svelte';
	import { SEGMENT_GROUP_CLASS, segmentClass } from '../ui/styles';
	export interface SearchListItem {
		id: string;
		label: string;
		description?: string;
		category?: 'issue' | 'file' | 'run' | 'doc';
	}

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'value' | 'items' | 'placeholder' | 'onValueChange' | 'onSelect'> {
		value?: string;
		items?: SearchListItem[];
		placeholder?: string;
		onValueChange?: (value: string) => void;
		onSelect?: (id: string) => void;
		class?: string;
	}

	let {
		value = undefined,
		items = [],
		placeholder = 'Search…',
		onValueChange,
		onSelect,
		class: className = '',
		...rest
	}: Props = $props();

	let internalQuery = $state('');
	let activeCategory = $state<'all' | 'issue' | 'file' | 'run' | 'doc'>('all');
	let activeIndex = $state(0);

	$effect(() => {
		if (value !== undefined) {
			internalQuery = value;
		}
	});

	/**
	 * Updates the search input string and notifies listeners.
	 *
	 * @param next - Updated search query string.
	 */
	function handleQueryInput(next: string): void {
		internalQuery = next;
		activeIndex = 0;
		onValueChange?.(next);
	}

	/**
	 * Handles keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`) inside the search input.
	 *
	 * @param event - Keyboard event from the search input.
	 */
	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = Math.min(Math.max(0, visibleItems.length - 1), activeIndex + 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = Math.max(0, activeIndex - 1);
		} else if (event.key === 'Enter' && visibleItems[activeIndex]) {
			event.preventDefault();
			onSelect?.(visibleItems[activeIndex].id);
		}
	}

	let visibleItems = $derived(
		items.filter((item) => {
			const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
			const query = internalQuery.trim().toLowerCase();
			const matchesText =
				!query ||
				`${item.label} ${item.description ?? ''}`.toLowerCase().includes(query);
			return matchesCategory && matchesText;
		})
	);
</script>

<section {...rest}
	class={cn('w-full max-w-xl rounded-card border border-card-border bg-card-bg p-3 text-fg-main', className)}
>
	<div class="flex items-center gap-2 border-b border-canvas-border pb-2.5">
		<Search aria-hidden="true" class="ml-1.5 size-3.5 text-fg-light" />
		<input
			type="search"
			value={internalQuery}
			{placeholder}
			aria-label={placeholder}
			oninput={(e) => handleQueryInput(e.currentTarget.value)}
			onkeydown={handleKeyDown}
			class="flex-1 bg-transparent text-xs text-fg-main placeholder:text-fg-light focus:outline-none"
		/>
		<span class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
			{visibleItems.length}
		</span>
	</div>

	<div class="{SEGMENT_GROUP_CLASS} mt-2 flex-wrap">
		{#each ['all', 'issue', 'file', 'run', 'doc'] as const as cat (cat)}
			<button
				type="button"
				onclick={() => {
					activeCategory = cat;
					activeIndex = 0;
				}}
				class="{segmentClass(activeCategory === cat)} capitalize"
			>
				{cat}
			</button>
		{/each}
	</div>

	<div class="mt-1 divide-y divide-canvas-border">
		{#each visibleItems as item, index (item.id)}
			<button
				type="button"
				onclick={() => {
					activeIndex = index;
					onSelect?.(item.id);
				}}
				class="flex min-h-10 w-full items-start justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors {index ===
				activeIndex
					? 'bg-canvas-secondary'
					: 'hover:bg-canvas-secondary'}"
			>
				<div class="min-w-0">
					<span class="block truncate text-xs font-medium text-fg-main">{item.label}</span>
					{#if item.description}
						<span class="mt-0.5 block truncate text-[11px] text-fg-light">{item.description}</span>
					{/if}
				</div>
				{#if item.category}
					<span
						class="shrink-0 rounded bg-card-bg px-1.5 py-0.5 text-[11px] capitalize text-fg-light font-medium"
					>
						{item.category}
					</span>
				{/if}
			</button>
		{:else}
			<p class="p-6 text-center text-xs text-fg-light">No matching results</p>
		{/each}
	</div>
</section>
