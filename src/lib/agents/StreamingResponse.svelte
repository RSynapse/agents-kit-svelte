<script lang="ts">
	import type { Snippet } from 'svelte';
	import Citations from './Citations.svelte';
	import type { CitationItem } from '../types';

	interface Props {
		status?: 'streaming' | 'complete' | 'error';
		copyText?: string;
		sources?: CitationItem[];
		showActions?: boolean;
		onRetry?: () => void;
		class?: string;
		children: Snippet;
	}

	const COPY_FEEDBACK_MS = 1600;

	let {
		status = 'complete',
		copyText,
		sources = [],
		showActions = true,
		onRetry,
		class: className = '',
		children
	}: Props = $props();

	let copied = $state(false);
	let feedback = $state<'up' | 'down' | null>(null);

	/**
	 * Copies the response plain text to the clipboard.
	 */
	async function handleCopy(): Promise<void> {
		if (!copyText) return;
		await navigator.clipboard?.writeText(copyText);
		copied = true;
		window.setTimeout(() => {
			copied = false;
		}, COPY_FEEDBACK_MS);
	}
</script>

<div data-state={status} aria-busy={status === 'streaming'} class="w-full {className}">
	<div aria-live="polite" class="space-y-2.5 text-sm leading-6 text-fg-main">
		{@render children()}
	</div>

	{#if showActions && status !== 'streaming'}
		<div class="mt-2.5 flex flex-wrap items-center gap-1.5">
			{#if copyText}
				<button
					type="button"
					aria-label={copied ? 'Copied response' : 'Copy response'}
					onclick={handleCopy}
					class="rounded-md border border-card-border bg-canvas-secondary px-2 py-0.5 text-xs text-fg-light transition-colors hover:text-fg-main"
				>
					{copied ? '✓ Copied' : 'Copy'}
				</button>
			{/if}
			{#if onRetry}
				<button
					type="button"
					aria-label="Retry response"
					onclick={onRetry}
					class="rounded-md border border-card-border bg-canvas-secondary px-2 py-0.5 text-xs text-fg-light transition-colors hover:text-fg-main"
				>
					↻ Retry
				</button>
			{/if}
			<button
				type="button"
				aria-label="Helpful"
				aria-pressed={feedback === 'up'}
				onclick={() => (feedback = feedback === 'up' ? null : 'up')}
				class="rounded-md border px-2 py-0.5 text-xs transition-colors {feedback === 'up'
					? 'border-accent-primary bg-accent-subtle text-accent-primary'
					: 'border-card-border bg-canvas-secondary text-fg-light hover:text-fg-main'}"
			>
				👍
			</button>
			<button
				type="button"
				aria-label="Not helpful"
				aria-pressed={feedback === 'down'}
				onclick={() => (feedback = feedback === 'down' ? null : 'down')}
				class="rounded-md border px-2 py-0.5 text-xs transition-colors {feedback === 'down'
					? 'border-accent-primary bg-accent-subtle text-accent-primary'
					: 'border-card-border bg-canvas-secondary text-fg-light hover:text-fg-main'}"
			>
				👎
			</button>
			{#if sources.length > 0}
				<Citations citations={sources} class="mt-1" />
			{/if}
		</div>
	{/if}
</div>
