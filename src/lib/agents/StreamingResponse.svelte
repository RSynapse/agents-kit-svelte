<script lang="ts">
	import { buttonClass } from '../ui/styles';
	import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from '@lucide/svelte';
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
		<div class="mt-2.5 flex flex-wrap items-center gap-1">
			{#if copyText}
				<button
					type="button"
					aria-label={copied ? 'Copied response' : 'Copy response'}
					onclick={handleCopy}
					class={buttonClass('ghost', 'sm')}
				>
					{#if copied}
						<Check aria-hidden="true" class="size-3.5 text-status-success" />
						<span>Copied</span>
					{:else}
						<Copy aria-hidden="true" class="size-3.5" />
						<span>Copy</span>
					{/if}
				</button>
			{/if}
			{#if onRetry}
				<button
					type="button"
					aria-label="Retry response"
					onclick={onRetry}
					class={buttonClass('ghost', 'sm')}
				>
					<RefreshCw aria-hidden="true" class="size-3.5" />
					<span>Retry</span>
				</button>
			{/if}
			<button
				type="button"
				aria-label="Helpful"
				aria-pressed={feedback === 'up'}
				onclick={() => (feedback = feedback === 'up' ? null : 'up')}
				class="inline-flex size-7 items-center justify-center rounded-md transition-colors {feedback ===
				'up'
					? 'bg-accent-subtle text-accent-primary'
					: 'text-fg-light hover:bg-canvas-secondary hover:text-fg-main'}"
			>
				<ThumbsUp aria-hidden="true" class="size-3.5" />
			</button>
			<button
				type="button"
				aria-label="Not helpful"
				aria-pressed={feedback === 'down'}
				onclick={() => (feedback = feedback === 'down' ? null : 'down')}
				class="inline-flex size-7 items-center justify-center rounded-md transition-colors {feedback ===
				'down'
					? 'bg-accent-subtle text-accent-primary'
					: 'text-fg-light hover:bg-canvas-secondary hover:text-fg-main'}"
			>
				<ThumbsDown aria-hidden="true" class="size-3.5" />
			</button>
			{#if sources.length > 0}
				<Citations citations={sources} class="ml-1" />
			{/if}
		</div>
	{/if}
</div>
