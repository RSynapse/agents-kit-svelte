<script lang="ts">
	interface Props {
		code: string;
		language?: string;
		filename?: string;
		status?: 'streaming' | 'complete';
		showLineNumbers?: boolean;
		highlightLines?: number[];
		maxHeight?: number;
		class?: string;
	}

	const COPY_FEEDBACK_MS = 1600;

	let {
		code,
		language = 'typescript',
		filename,
		status = 'complete',
		showLineNumbers = true,
		highlightLines = [],
		maxHeight = 260,
		class: className = ''
	}: Props = $props();

	let copied = $state(false);
	let lines = $derived(code.split('\n'));
	let highlightedSet = $derived(new Set(highlightLines));

	/**
	 * Copies the code block text to the system clipboard.
	 */
	async function handleCopy(): Promise<void> {
		await navigator.clipboard?.writeText(code);
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
			<polyline points="16 18 22 12 16 6" />
			<polyline points="8 6 2 12 8 18" />
		</svg>

		{#if filename}
			<code class="min-w-0 truncate font-mono text-xs text-fg-main">{filename}</code>
		{/if}
		<span class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px] text-fg-light">
			{language}
		</span>

		<div class="ml-auto flex items-center gap-1.5">
			{#if status === 'streaming'}
				<span class="inline-flex items-center gap-1 font-mono text-[11px] text-accent-primary">
					<span class="size-1.5 animate-pulse rounded-full bg-accent-primary"></span>
					Writing
				</span>
			{/if}
			<button
				type="button"
				aria-label={copied ? 'Copied code' : 'Copy code'}
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
	</div>

	<div
		class="overflow-auto border-t border-canvas-border bg-canvas-secondary/60 py-2 font-mono text-xs leading-5 text-fg-main"
		style="max-height: {maxHeight}px;"
	>
		<div class="min-w-max">
			{#each lines as lineContent, idx (idx)}
				{@const lineNum = idx + 1}
				<div
					class="grid min-h-5 {showLineNumbers
						? 'grid-cols-[2.75rem_minmax(0,1fr)]'
						: 'grid-cols-1'} {highlightedSet.has(lineNum) ? 'bg-accent-subtle' : ''}"
				>
					{#if showLineNumbers}
						<span class="select-none pr-3 text-right tabular-nums text-fg-light/60">
							{lineNum}
						</span>
					{/if}
					<span class="whitespace-pre pr-4">{lineContent}</span>
				</div>
			{/each}
		</div>
	</div>
</div>
