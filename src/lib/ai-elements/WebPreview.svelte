<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Check, ChevronDown, LoaderCircle, RefreshCw } from '@lucide/svelte';
	import { SEGMENT_GROUP_CLASS, buttonClass, segmentClass } from '../ui/styles';
	import type { Snippet } from 'svelte';
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';

	export type PreviewViewport = '390px' | '768px' | '1440px';

	export interface PreviewConsoleLog {
		id: string;
		level: 'log' | 'warn' | 'error';
		message: string;
		timestamp: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'defaultUrl' | 'defaultViewport' | 'logs' | 'defaultConsoleOpen' | 'onUrlChange' | 'children'> {
		defaultUrl: string;
		defaultViewport?: PreviewViewport;
		logs?: PreviewConsoleLog[];
		defaultConsoleOpen?: boolean;
		onUrlChange?: (url: string) => void;
		children?: Snippet;
		class?: string;
	}

	const VIEWPORTS: { id: PreviewViewport; label: string }[] = [
		{ id: '390px', label: '390px' },
		{ id: '768px', label: '768px' },
		{ id: '1440px', label: '1440px' }
	];

	let {
		defaultUrl,
		defaultViewport = '1440px',
		logs = [],
		defaultConsoleOpen = true,
		onUrlChange,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	let currentUrl = $state('');
	let urlInput = $state('');
	let viewport = $state<PreviewViewport>('1440px');
	let consoleOpen = $state(true);
	let refreshTick = $state(1);

	$effect(() => {
		currentUrl = defaultUrl;
		urlInput = defaultUrl;
		viewport = defaultViewport;
		consoleOpen = defaultConsoleOpen;
	});

	/**
	 * Applies the edited URL bar value and notifies any external listener.
	 */
	function submitUrl(): void {
		const trimmed = urlInput.trim() || defaultUrl;
		currentUrl = trimmed;
		urlInput = trimmed;
		onUrlChange?.(trimmed);
	}

	/**
	 * Handles Enter key submission inside the URL bar input.
	 *
	 * @param event - Keyboard event from the URL input.
	 */
	function handleUrlKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			event.preventDefault();
			submitUrl();
		}
	}

	/**
	 * Increments the refresh counter to simulate reloading the preview frame.
	 */
	function reloadPreview(): void {
		refreshTick += 1;
	}

	let errorLogCount = $derived(logs.filter((l) => l.level === 'error').length);
	let warnLogCount = $derived(logs.filter((l) => l.level === 'warn').length);
</script>

<div {...rest} class="flex w-full flex-col overflow-hidden rounded-card border border-card-border bg-card-bg text-sm {className}">
	<div class="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border bg-canvas-secondary px-3 py-2">
		<div class="flex items-center gap-1.5">
			<button
				type="button"
				aria-label="Reload preview"
				onclick={reloadPreview}
				class={buttonClass('secondary', 'icon-sm')}
			>
				<RefreshCw aria-hidden="true" />
			</button>
		</div>

		<div class="flex min-w-[200px] flex-1 items-center gap-1.5">
			<input
				type="text"
				aria-label="Preview URL"
				bind:value={urlInput}
				onkeydown={handleUrlKeydown}
				class="w-full rounded-md border border-card-border bg-card-bg px-3 py-1 font-mono text-xs text-fg-main outline-none focus:border-accent-primary"
			/>
			<button
				type="button"
				onclick={submitUrl}
				class={buttonClass('secondary', 'sm')}
			>
				Go
			</button>
		</div>

		<div class="{SEGMENT_GROUP_CLASS}">
			{#each VIEWPORTS as vp (vp.id)}
				<button
					type="button"
					aria-pressed={viewport === vp.id}
					onclick={() => (viewport = vp.id)}
					class="{segmentClass(viewport === vp.id)}"
				>
					{vp.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="flex justify-center bg-canvas-primary p-4">
		<div
			style:max-width={viewport}
			class="w-full overflow-hidden rounded-lg border border-card-border bg-card-bg transition-all duration-200"
		>
			{#if children}
				{@render children()}
			{:else}
				<div class="space-y-3 p-4">
					<div class="flex items-center justify-between border-b border-canvas-border pb-2.5">
						<div class="flex items-center gap-2">
							<span class="size-2 rounded-full bg-status-success"></span>
							<span class="font-mono text-xs font-semibold text-fg-main">{currentUrl}</span>
						</div>
						<span class="rounded bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] text-fg-light">
							viewport: {viewport} · rev {refreshTick}
						</span>
					</div>

					<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
						<div class="rounded-control border border-card-border p-3">
							<div class="text-xs text-fg-light">Triage Queue</div>
							<div class="mt-1 font-semibold text-fg-main">3 Cards Ready</div>
							<div class="mt-1 inline-flex items-center gap-1 text-xs text-status-success"><Check aria-hidden="true" class="size-3.5" />All checks green</div>
						</div>
						<div class="rounded-control border border-card-border p-3">
							<div class="text-xs text-fg-light">Active Worktree</div>
							<div class="mt-1 font-semibold text-fg-main">feat/svelte5-primitives</div>
							<div class="mt-1 inline-flex items-center gap-1 text-xs text-accent-primary"><LoaderCircle aria-hidden="true" class="size-3.5 animate-spin" />Claude Code running</div>
						</div>
						<div class="rounded-control border border-card-border p-3">
							<div class="text-xs text-fg-light">Referee Gate</div>
							<div class="mt-1 font-semibold text-fg-main">Pass (0 violations)</div>
							<div class="mt-1 text-xs text-fg-light">OKLCH tokens verified</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="border-t border-canvas-border bg-terminal-bg font-mono text-xs text-terminal-fg">
		<button
			type="button"
			aria-expanded={consoleOpen}
			onclick={() => (consoleOpen = !consoleOpen)}
			class="flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:opacity-90"
		>
			<div class="flex items-center gap-2">
				<span class="font-semibold">Console Drawer</span>
				<span class="rounded bg-card-bg px-1.5 py-0.5 text-[10px] text-fg-main">
					{logs.length}
				</span>
				{#if warnLogCount > 0}
					<span class="rounded bg-status-warning-subtle px-1.5 py-0.5 text-[10px] text-status-warning">
						{warnLogCount} warn
					</span>
				{/if}
				{#if errorLogCount > 0}
					<span class="rounded bg-status-danger-subtle px-1.5 py-0.5 text-[10px] text-status-danger">
						{errorLogCount} error
					</span>
				{/if}
			</div>
			<ChevronDown aria-hidden="true" class="size-3.5 text-terminal-muted transition-transform duration-200 {consoleOpen ? 'rotate-180' : ''}" />
		</button>

		<AgentDisclosure open={consoleOpen}>
			<div class="max-h-40 space-y-1 overflow-y-auto border-t border-canvas-border px-4 py-2.5">
				{#each logs as entry (entry.id)}
					<div class="flex items-start gap-2 text-[11px] leading-relaxed">
						<span class="shrink-0 tabular-nums text-terminal-muted">{entry.timestamp}</span>
						<span
							class={entry.level === 'error'
								? 'text-status-danger'
								: entry.level === 'warn'
									? 'text-status-warning'
									: 'text-terminal-fg'}
						>
							{entry.message}
						</span>
					</div>
				{/each}
			</div>
		</AgentDisclosure>
	</div>
</div>
