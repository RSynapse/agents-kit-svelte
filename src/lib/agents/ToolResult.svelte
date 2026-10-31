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
	<div class="flex h-10 items-center gap-2 px-3">
		<button
			type="button"
			aria-expanded={isOpen}
			aria-controls={panelId}
			onclick={() => (isOpen = !isOpen)}
			class="group flex min-w-0 flex-1 items-center gap-2 text-left outline-none"
		>
			<span
				aria-hidden="true"
				class="inline-flex size-4 shrink-0 items-center justify-center {status === 'error'
					? 'text-status-danger'
					: status === 'running'
						? 'text-accent-primary'
						: 'text-fg-light'}"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-4"
				>
					<path d="m7 11 2-2-2-2" />
					<path d="M11 13h4" />
					<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
				</svg>
			</span>

			<span class="font-medium text-fg-main">{tool}</span>

			{#if summary}
				<code class="min-w-0 truncate rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-xs text-fg-light">
					{summary}
				</code>
			{/if}

			{#if meta}
				<span class="ml-auto shrink-0 font-mono text-xs tabular-nums text-fg-light">{meta}</span>
			{/if}

			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="size-4 shrink-0 text-fg-light transition-transform duration-150 group-hover:text-fg-main {isOpen
					? 'rotate-180'
					: ''}"
			>
				<path d="m6 9 6 6 6-6" />
			</svg>
		</button>

		<div class="flex items-center gap-1">
			{#if status === 'error' && onRetry}
				<button
					type="button"
					onclick={onRetry}
					class="rounded-md px-2 py-0.5 text-xs font-medium text-fg-light transition-colors hover:bg-canvas-secondary hover:text-fg-main"
				>
					Retry
				</button>
			{/if}
			<button
				type="button"
				aria-label={copied ? 'Copied output' : 'Copy output'}
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

	<AgentDisclosure id={panelId} open={isOpen}>
		<div
			role={status === 'running' ? 'log' : undefined}
			aria-live={status === 'running' ? 'polite' : undefined}
			class="max-h-56 overflow-auto border-t border-canvas-border bg-terminal-bg px-3.5 py-2.5 font-mono text-xs leading-5 text-terminal-fg"
		>
			<pre class="m-0 whitespace-pre-wrap break-words">{output}</pre>
		</div>
	</AgentDisclosure>
</div>
