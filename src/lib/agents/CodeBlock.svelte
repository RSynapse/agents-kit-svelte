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
	<div class="flex h-9 items-center gap-2 px-3">
		{#if filename}
			<code class="min-w-0 truncate font-mono text-xs text-fg-main">{filename}</code>
		{/if}
		<span class="font-mono text-[10px] font-medium uppercase tracking-wider text-fg-light">
			{language}
		</span>
		<span
			class="ml-auto inline-flex items-center gap-1 font-mono text-[11px] {status === 'streaming'
				? 'text-accent-primary'
				: 'text-status-success'}"
		>
			{status === 'streaming' ? '↻ Writing' : '✓ Ready'}
		</span>
		<button
			type="button"
			aria-label={copied ? 'Copied code' : 'Copy code'}
			onclick={handleCopy}
			class="rounded px-2 py-0.5 font-mono text-[11px] text-fg-light transition-colors hover:bg-canvas-secondary hover:text-fg-main"
		>
			{copied ? 'Copied' : 'Copy'}
		</button>
	</div>

	<div
		class="overflow-auto border-t border-canvas-border bg-canvas-secondary py-2 font-mono text-xs leading-5 text-fg-main"
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
						<span class="select-none pr-3 text-right tabular-nums text-fg-light">
							{lineNum}
						</span>
					{/if}
					<span class="whitespace-pre pr-4">{lineContent}</span>
				</div>
			{/each}
		</div>
	</div>
</div>
