<script lang="ts">
	import AgentDisclosure from './AgentDisclosure.svelte';
	import type { ToolResultStatus } from '../types';

	interface Props {
		tool: string;
		summary?: string;
		output: string;
		status?: ToolResultStatus;
		meta?: string;
		defaultOpen?: boolean;
		onRetry?: () => void;
		class?: string;
	}

	const COPY_FEEDBACK_MS = 1600;

	let {
		tool,
		summary,
		output,
		status = 'success',
		meta,
		defaultOpen = true,
		onRetry,
		class: className = ''
	}: Props = $props();

	let isOpen = $state(true);
	let copied = $state(false);

	$effect(() => {
		isOpen = defaultOpen;
	});

	let panelId = $derived(`tool-result-${tool.replace(/[^a-zA-Z0-9_-]/g, '-')}`);

	/**
	 * Copies the raw tool terminal output to the system clipboard.
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
	data-state={status}
	aria-busy={status === 'running'}
	class="w-full overflow-hidden rounded-lg border border-card-border bg-card-bg text-sm {className}"
>
	<div class="flex items-center gap-2 px-3 py-2">
		<button
			type="button"
			aria-expanded={isOpen}
			aria-controls={panelId}
			onclick={() => (isOpen = !isOpen)}
			class="flex min-w-0 flex-1 items-center gap-2 text-left outline-none"
		>
			<span
				aria-hidden="true"
				class="inline-flex size-4 shrink-0 items-center justify-center rounded font-mono text-[10px] {status ===
				'error'
					? 'bg-status-danger-subtle text-status-danger'
					: status === 'running'
						? 'bg-accent-subtle text-accent-primary'
						: 'bg-status-success-subtle text-status-success'}"
			>
				{status === 'error' ? '!' : status === 'running' ? '↻' : '$'}
			</span>

			<span class="font-mono text-xs font-semibold text-fg-main">{tool}</span>

			{#if summary}
				<code class="min-w-0 truncate font-mono text-xs text-fg-light">{summary}</code>
			{/if}

			{#if meta}
				<span class="ml-auto shrink-0 font-mono text-xs tabular-nums text-fg-light">{meta}</span>
			{/if}

			<span
				aria-hidden="true"
				class="text-xs text-fg-light transition-transform duration-150 {isOpen ? 'rotate-180' : ''}"
			>
				▾
			</span>
		</button>

		<div class="flex items-center gap-1">
			{#if status === 'error' && onRetry}
				<button
					type="button"
					onclick={onRetry}
					class="rounded px-2 py-0.5 text-xs font-medium text-fg-light transition-colors hover:bg-canvas-secondary hover:text-fg-main"
				>
					Retry
				</button>
			{/if}
			<button
				type="button"
				aria-label={copied ? 'Copied output' : 'Copy output'}
				onclick={handleCopy}
				class="rounded px-2 py-0.5 font-mono text-[11px] text-fg-light transition-colors hover:bg-canvas-secondary hover:text-fg-main"
			>
				{copied ? 'Copied' : 'Copy'}
			</button>
		</div>
	</div>

	<AgentDisclosure id={panelId} open={isOpen}>
		<div
			role={status === 'running' ? 'log' : undefined}
			aria-live={status === 'running' ? 'polite' : undefined}
			class="max-h-56 overflow-auto border-t border-canvas-border bg-terminal-bg px-3 py-2.5 font-mono text-xs leading-5 text-terminal-fg"
		>
			<pre class="m-0 whitespace-pre-wrap break-words">{output}</pre>
		</div>
	</AgentDisclosure>
</div>
