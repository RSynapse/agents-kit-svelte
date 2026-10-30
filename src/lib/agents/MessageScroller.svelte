<script lang="ts">
	import type { Snippet } from 'svelte';

	interface RailItem {
		id: string;
		label: string;
		role: 'user' | 'assistant' | 'system';
	}

	interface Props {
		items?: RailItem[];
		streaming?: boolean;
		class?: string;
		children: Snippet;
	}

	const FOLLOW_THRESHOLD_PX = 56;

	let { items = [], streaming = false, class: className = '', children }: Props = $props();

	let viewportEl = $state<HTMLDivElement | null>(null);
	let isPinnedToBottom = $state(true);

	/**
	 * Tracks whether the user has scrolled away from the live bottom edge.
	 */
	function handleScroll(): void {
		if (!viewportEl) return;
		const distanceFromBottom =
			viewportEl.scrollHeight - viewportEl.scrollTop - viewportEl.clientHeight;
		isPinnedToBottom = distanceFromBottom <= FOLLOW_THRESHOLD_PX;
	}

	/**
	 * Scrolls the conversation log smoothly back to the latest message.
	 */
	function scrollToBottom(): void {
		if (!viewportEl) return;
		viewportEl.scrollTo({
			top: viewportEl.scrollHeight,
			behavior: 'smooth'
		});
		isPinnedToBottom = true;
	}

	/**
	 * Scrolls a specific message anchor into view when selected from the preview rail.
	 *
	 * @param itemId - DOM id of the target message element.
	 */
	function jumpToMessage(itemId: string): void {
		const target = document.getElementById(itemId);
		target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	$effect(() => {
		if (streaming && isPinnedToBottom && viewportEl) {
			viewportEl.scrollTop = viewportEl.scrollHeight;
		}
	});
</script>

<div class="relative flex min-h-0 flex-1 overflow-hidden {className}">
	<div
		bind:this={viewportEl}
		onscroll={handleScroll}
		role="log"
		aria-live="polite"
		aria-relevant="additions text"
		aria-label="Agent conversation stream"
		class="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6"
	>
		{@render children()}
	</div>

	{#if items.length > 1}
		<nav
			aria-label="Conversation message rail"
			class="hidden w-8 shrink-0 flex-col items-center justify-center gap-1.5 border-l border-canvas-border bg-canvas-secondary py-4 lg:flex"
		>
			{#each items as item, idx (item.id)}
				<button
					type="button"
					title="{idx + 1}. {item.label}"
					aria-label="Jump to message {idx + 1}: {item.label}"
					onclick={() => jumpToMessage(item.id)}
					class="h-1.5 w-3 rounded-full transition-all hover:w-4 {item.role === 'user'
						? 'bg-accent-primary'
						: 'bg-fg-light'}"
				></button>
			{/each}
		</nav>
	{/if}

	{#if !isPinnedToBottom}
		<button
			type="button"
			onclick={scrollToBottom}
			class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-card-border bg-card-bg px-3 py-1 text-xs font-medium text-fg-main shadow-sm transition-colors hover:bg-canvas-secondary"
		>
			↓ Jump to latest
		</button>
	{/if}
</div>
