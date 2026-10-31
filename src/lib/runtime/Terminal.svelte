<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { SquareTerminal } from '@lucide/svelte';
	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'title' | 'output' | 'streaming' | 'onClear'> {
		title?: string;
		output: string;
		streaming?: boolean;
		onClear?: () => void;
		class?: string;
	}

	const COPY_FEEDBACK_MS = 1600;

	let {
		title = 'Terminal',
		output,
		streaming = false,
		onClear,
		class: className = '',
		...rest
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

<div {...rest}
	class={cn('flex flex-col overflow-hidden rounded-xl border border-card-border bg-terminal-bg text-terminal-fg', className)}
>
	<div class="flex h-10 items-center justify-between border-b border-canvas-border px-3.5 text-xs">
		<div class="flex items-center gap-2 font-mono text-terminal-muted">
			<SquareTerminal aria-hidden="true" class="size-4 shrink-0" />
			<span class="truncate">{title}</span>
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
				class="rounded-md px-2 py-0.5 font-mono text-[11px] text-terminal-muted transition-colors hover:text-terminal-fg"
			>
				{copied ? 'Copied' : 'Copy'}
			</button>
			{#if onClear}
				<button
					type="button"
					onclick={onClear}
					class="rounded-md px-2 py-0.5 font-mono text-[11px] text-terminal-muted transition-colors hover:text-terminal-fg"
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
