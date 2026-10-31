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
		<div class="mt-2.5 flex flex-wrap items-center gap-1">
			{#if copyText}
				<button
					type="button"
					aria-label={copied ? 'Copied response' : 'Copy response'}
					onclick={handleCopy}
					class="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-fg-light transition-colors hover:bg-canvas-secondary hover:text-fg-main"
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
						<span>Copied</span>
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
						<span>Copy</span>
					{/if}
				</button>
			{/if}
			{#if onRetry}
				<button
					type="button"
					aria-label="Retry response"
					onclick={onRetry}
					class="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-fg-light transition-colors hover:bg-canvas-secondary hover:text-fg-main"
				>
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
						<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
						<path d="M21 3v5h-5" />
						<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
						<path d="M8 16H3v5" />
					</svg>
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
					<path d="M7 10v12" />
					<path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
				</svg>
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
					<path d="M17 14V2" />
					<path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
				</svg>
			</button>
			{#if sources.length > 0}
				<Citations citations={sources} class="ml-1" />
			{/if}
		</div>
	{/if}
</div>
