<script lang="ts">
	import { AudioWaveform, Ellipsis, Infinity as InfinityIcon, LoaderCircle, Pause, Play, Sparkles } from '@lucide/svelte';
	import type { Component } from 'svelte';
	import { buttonClass, SEGMENT_GROUP_CLASS, segmentClass } from '../ui/styles';
	export type ThinkingVariant = 'wave' | 'spin' | 'stars' | 'infinity' | 'orbs';

	export type ThinkingState =
		| 'working'
		| 'searching'
		| 'solving'
		| 'listening'
		| 'connecting'
		| 'weaving'
		| 'composing'
		| 'breathing'
		| 'shaping';

	interface Props {
		variant?: ThinkingVariant;
		state?: ThinkingState;
		label?: string;
		detail?: string;
		paused?: boolean;
		showControls?: boolean;
		onVariantChange?: (variant: ThinkingVariant) => void;
		class?: string;
	}

	const stateLabels: Record<ThinkingState, string> = {
		working: 'Working in isolated worktree',
		searching: 'Searching repository contracts',
		solving: 'Evaluating domain invariants',
		listening: 'Listening for Companion heartbeat',
		connecting: 'Connecting to local daemon',
		weaving: 'Synthesizing multi-agent evidence',
		composing: 'Composing structured diff',
		breathing: 'Thinking deeply',
		shaping: 'Shaping referee response'
	};

	const variants: { id: ThinkingVariant; label: string; icon: Component }[] = [
		{ id: 'wave', label: 'Wave', icon: AudioWaveform },
		{ id: 'spin', label: 'Spin', icon: LoaderCircle },
		{ id: 'stars', label: 'Stars', icon: Sparkles },
		{ id: 'infinity', label: 'Infinity', icon: InfinityIcon },
		{ id: 'orbs', label: 'Orbs', icon: Ellipsis }
	];

	let {
		variant = 'orbs',
		state: thinkingState = 'working',
		label,
		detail = 'Claude Code 1.0 · Card 191 Attempt 1 · 18.4k tokens',
		paused = false,
		showControls = true,
		onVariantChange,
		class: className = ''
	}: Props = $props();

	let activeVariant = $state<ThinkingVariant>('orbs');
	let isPaused = $state(false);

	$effect(() => {
		activeVariant = variant;
		isPaused = paused;
	});

	let resolvedLabel = $derived(label ?? stateLabels[thinkingState]);

	/**
	 * Switches the active animated thinking indicator variant.
	 *
	 * @param nextVariant - Variant identifier to activate.
	 */
	function selectVariant(nextVariant: ThinkingVariant): void {
		activeVariant = nextVariant;
		onVariantChange?.(nextVariant);
	}
</script>

<div
	role="status"
	aria-live="polite"
	data-paused={isPaused}
	class="ak-thinking w-full rounded-card border border-card-border bg-card-bg text-sm {className}"
>
	<div class="flex items-center gap-3 px-4 py-3">
		<div
			aria-hidden="true"
			class="inline-flex size-8 shrink-0 items-center justify-center rounded-control bg-canvas-secondary text-fg-main"
		>
			{#if activeVariant === 'wave'}
				<span class="inline-flex h-4 items-center gap-[3px]">
					{#each [0, 1, 2, 3] as bar (bar)}
						<span class="ak-thinking-bar h-full w-[3px] rounded-full bg-current" style="animation-delay: {bar * 120}ms"></span>
					{/each}
				</span>
			{:else if activeVariant === 'spin'}
				<LoaderCircle class="size-4 {isPaused ? '' : 'animate-spin'}" />
			{:else if activeVariant === 'stars'}
				<Sparkles class="size-4 {isPaused ? '' : 'ak-breathe'}" />
			{:else if activeVariant === 'infinity'}
				<InfinityIcon class="size-4 {isPaused ? '' : 'ak-breathe'}" />
			{:else}
				<span class="inline-flex items-center gap-[3px]">
					{#each [0, 1, 2] as dot (dot)}
						<span class="ak-thinking-dot size-1.5 rounded-full bg-current" style="animation-delay: {dot * 160}ms"></span>
					{/each}
				</span>
			{/if}
		</div>

		<div class="min-w-0 flex-1">
			<p class="truncate font-medium text-fg-main">
				{#if isPaused}
					{resolvedLabel}
				{:else}
					<span class="ak-shimmer-text">{resolvedLabel}</span>
				{/if}
			</p>
			{#if detail}
				<p class="mt-0.5 truncate text-xs text-fg-light">{detail}</p>
			{/if}
		</div>

		{#if showControls}
			<button
				type="button"
				aria-label={isPaused ? 'Resume animation' : 'Pause animation'}
				onclick={() => (isPaused = !isPaused)}
				class={buttonClass('ghost', 'icon-sm')}
			>
				{#if isPaused}<Play />{:else}<Pause />{/if}
			</button>
		{/if}
	</div>

	{#if showControls}
		<div class="border-t border-canvas-border px-4 py-2.5">
			<div class={SEGMENT_GROUP_CLASS} role="group" aria-label="Indicator style">
				{#each variants as item (item.id)}
					{@const VariantIcon = item.icon}
					<button
						type="button"
						aria-pressed={activeVariant === item.id}
						onclick={() => selectVariant(item.id)}
						class={segmentClass(activeVariant === item.id)}
					>
						<VariantIcon aria-hidden="true" />
						<span class="hidden sm:inline">{item.label}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes ak-thinking-bar {
		0%,
		100% {
			transform: scaleY(0.35);
		}
		50% {
			transform: scaleY(1);
		}
	}

	@keyframes ak-thinking-dot {
		0%,
		100% {
			opacity: 0.25;
		}
		40% {
			opacity: 1;
		}
	}

	.ak-thinking-bar {
		animation: ak-thinking-bar 1s ease-in-out infinite;
	}

	.ak-thinking-dot {
		animation: ak-thinking-dot 1.2s ease-in-out infinite;
	}

	.ak-thinking[data-paused='true'] .ak-thinking-bar,
	.ak-thinking[data-paused='true'] .ak-thinking-dot {
		animation-play-state: paused;
	}
</style>
