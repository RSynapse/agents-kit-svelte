<script lang="ts">
	import { buttonClass } from '../ui/styles';
	import { Check, CircleAlert, ImageIcon } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	export type ImageGenerationStatus = 'queued' | 'generating' | 'refining' | 'complete' | 'error';

	interface Props {
		status?: ImageGenerationStatus;
		label?: string;
		prompt?: string;
		resolution?: string;
		aspectRatio?: string;
		size?: 'compact' | 'fluid';
		progress?: number;
		statusText?: string;
		showStatus?: boolean;
		onRetry?: () => void;
		onRegenerate?: () => void;
		children?: Snippet;
		class?: string;
	}

	const STATUS_LABELS: Record<ImageGenerationStatus, string> = {
		queued: 'Waiting in queue',
		generating: 'Synthesizing latent canvas',
		refining: 'Refining high-frequency details',
		complete: 'Artifact ready',
		error: 'Generation failed'
	};

	const DEFAULT_PROGRESS: Record<ImageGenerationStatus, number> = {
		queued: 12,
		generating: 56,
		refining: 84,
		complete: 100,
		error: 0
	};

	let {
		status = 'refining',
		label,
		prompt = 'Architectural isometric diagram of an isolated Git worktree pipeline, warm editorial technical illustration',
		resolution = '1024 × 1024',
		aspectRatio = '16 / 10',
		size = 'fluid',
		progress,
		statusText,
		showStatus = true,
		onRetry,
		onRegenerate,
		children,
		class: className = ''
	}: Props = $props();

	let currentStatus = $state<ImageGenerationStatus>('refining');

	$effect(() => {
		currentStatus = status;
	});

	/**
	 * Cycles or triggers regeneration of the media preview.
	 */
	function handleRegenerate(): void {
		if (currentStatus === 'error' && onRetry) {
			onRetry();
			return;
		}
		onRegenerate?.();
		const order: ImageGenerationStatus[] = ['queued', 'generating', 'refining', 'complete'];
		const nextIndex = (order.indexOf(currentStatus) + 1) % order.length;
		currentStatus = order[nextIndex] ?? 'generating';
	}

	let isActive = $derived(
		currentStatus === 'queued' || currentStatus === 'generating' || currentStatus === 'refining'
	);
	let resolvedStatusText = $derived(statusText ?? STATUS_LABELS[currentStatus]);
	let resolvedProgress = $derived(progress ?? DEFAULT_PROGRESS[currentStatus]);
	let resolvedLabel = $derived(
		label ?? (prompt ? `${resolvedStatusText}: ${prompt}` : resolvedStatusText)
	);
</script>

<div
	data-slot="image-generation"
	data-state={currentStatus}
	aria-busy={isActive}
	class="w-full rounded-xl border border-card-border bg-card-bg p-3.5 text-fg-main {size === 'compact'
		? 'max-w-xs'
		: ''} {className}"
>
	<div
		role="img"
		aria-label={resolvedLabel}
		style="aspect-ratio: {aspectRatio}"
		class="relative isolate flex w-full flex-col justify-between overflow-hidden rounded-lg border border-canvas-border bg-canvas-secondary p-3.5"
	>
		<div class="relative z-10 flex items-center justify-between gap-2">
			<span
				class="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-card-bg px-2.5 py-0.5 text-[11px] font-medium {currentStatus ===
				'error'
					? 'text-status-danger'
					: currentStatus === 'complete'
						? 'text-status-success'
						: 'text-fg-main'}"
			>
				<span
					aria-hidden="true"
					class="size-1.5 rounded-full {currentStatus === 'error'
						? 'bg-status-danger'
						: currentStatus === 'complete'
							? 'bg-status-success'
							: 'animate-pulse bg-accent-primary'}"
				></span>
				<span class="capitalize">{currentStatus}</span>
			</span>

			{#if resolution}
				<span
					class="rounded-full border border-card-border bg-card-bg px-2 py-0.5 font-mono text-[10px] text-fg-light tabular-nums"
				>
					{resolution} · {aspectRatio}
				</span>
			{/if}
		</div>

		<div class="my-auto flex flex-col items-center justify-center py-4 text-center">
			{#if children}
				<div class="w-full overflow-hidden rounded-md">
					{@render children()}
				</div>
			{:else if currentStatus === 'complete'}
				<div
					class="flex size-10 items-center justify-center rounded-lg border border-card-border bg-card-bg text-status-success"
				>
					<Check aria-hidden="true" class="size-5" />
				</div>
				<p class="mt-2 text-xs font-medium text-fg-main">Render pass verified</p>
			{:else if currentStatus === 'error'}
				<div
					class="flex size-10 items-center justify-center rounded-lg border border-card-border bg-card-bg text-status-danger"
				>
					<CircleAlert aria-hidden="true" class="size-5" />
				</div>
				<p class="mt-2 text-xs text-status-danger">Sampler timeout exceeded</p>
			{:else}
				<div
					class="flex size-10 items-center justify-center rounded-lg border border-card-border bg-card-bg text-fg-light"
				>
					<ImageIcon aria-hidden="true" class="size-5 animate-pulse" />
				</div>
				<p class="mt-2 text-xs text-fg-light">{resolvedStatusText}…</p>
			{/if}
		</div>

		<div class="relative z-10 space-y-1">
			<div class="flex items-center justify-between font-mono text-[11px] text-fg-light tabular-nums">
				<span>Pass progress</span>
				<span>{resolvedProgress}%</span>
			</div>
			<div class="h-1 w-full overflow-hidden rounded-full bg-canvas-primary">
				<div
					class="h-full rounded-full transition-all duration-300 {currentStatus === 'error'
						? 'bg-status-danger'
						: currentStatus === 'complete'
							? 'bg-status-success'
							: 'bg-accent-primary'}"
					style="width: {resolvedProgress}%"
				></div>
			</div>
		</div>
	</div>

	{#if showStatus || prompt}
		<div class="mt-3 flex items-start justify-between gap-3">
			<div class="min-w-0 flex-1">
				{#if showStatus}
					<div aria-live="polite" class="text-xs font-medium text-fg-main">
						{resolvedStatusText}
					</div>
				{/if}
				{#if prompt}
					<p class="mt-0.5 line-clamp-2 text-xs text-fg-light">“{prompt}”</p>
				{/if}
			</div>

			<button
				type="button"
				onclick={handleRegenerate}
				class={buttonClass('secondary', 'sm', 'shrink-0')}
			>
				{currentStatus === 'error' ? 'Retry' : 'Cycle state'}
			</button>
		</div>
	{/if}
</div>
