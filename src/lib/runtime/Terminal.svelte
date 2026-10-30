<script lang="ts">
	interface Props {
		title?: string;
		output: string;
		streaming?: boolean;
		onClear?: () => void;
		class?: string;
	}

	const COPY_FEEDBACK_MS = 1600;

	let {
		title = 'studio-mac · zsh (worktree: trailside/1210-auth-redirect)',
		output,
		streaming = false,
		onClear,
		class: className = ''
	}: Props = $props();

	let copied = $state(false);

	/**
	 * Copies the terminal buffer to the clipboard.
	 */
	async function handleCopy(): Promise<void> {
		await navigator.clipboard?.writeText(output);
		copied = true;
		window.setTimeout(() => {
			copied = false;
		}, COPY_FEEDBACK_MS);
	}
</script>

<div
	class="flex flex-col overflow-hidden rounded-xl border border-card-border bg-terminal-bg text-terminal-fg {className}"
>
	<div class="flex items-center justify-between border-b border-canvas-border px-4 py-2 text-xs">
		<div class="flex items-center gap-2 font-mono text-terminal-muted">
			<span aria-hidden="true">$_</span>
			<span>{title}</span>
			{#if streaming}
				<span class="rounded-full bg-accent-subtle px-2 py-0.5 text-[10px] text-accent-primary">
					Running
				</span>
			{/if}
		</div>

		<div class="flex items-center gap-1.5">
			<button
				type="button"
				onclick={handleCopy}
				class="rounded px-2 py-0.5 font-mono text-[11px] text-terminal-muted transition-colors hover:text-terminal-fg"
			>
				{copied ? 'Copied' : 'Copy'}
			</button>
			{#if onClear}
				<button
					type="button"
					onclick={onClear}
					class="rounded px-2 py-0.5 font-mono text-[11px] text-terminal-muted transition-colors hover:text-terminal-fg"
				>
					Clear
				</button>
			{/if}
		</div>
	</div>

	<div class="max-h-96 overflow-auto p-4 font-mono text-xs leading-6">
		<pre class="m-0 whitespace-pre-wrap break-words">{output}{#if streaming}<span
					aria-hidden="true"
					class="ml-1 inline-block h-3.5 w-2 animate-pulse bg-terminal-fg"
				></span>{/if}</pre>
	</div>
</div>
