<script lang="ts">
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

	const variants: { id: ThinkingVariant; label: string; glyph: string }[] = [
		{ id: 'wave', label: 'Wave', glyph: '∿' },
		{ id: 'spin', label: 'Spin', glyph: '◐' },
		{ id: 'stars', label: 'Stars', glyph: '✦' },
		{ id: 'infinity', label: 'Infinity', glyph: '∞' },
		{ id: 'orbs', label: 'Orbs', glyph: '◉' }
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
	class="w-full rounded-xl border border-card-border bg-card-bg p-4 text-sm {className}"
>
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<div
				aria-hidden="true"
				class="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-canvas-border bg-accent-subtle text-accent-primary"
			>
				{#if activeVariant === 'wave'}
					<span class="inline-flex items-end gap-0.5">
						<span
							class="h-2 w-1 rounded-full bg-accent-primary {isPaused ? '' : 'animate-bounce'}"
						></span>
						<span
							class="h-4 w-1 rounded-full bg-accent-primary {isPaused ? '' : 'animate-pulse'}"
						></span>
						<span
							class="h-3 w-1 rounded-full bg-accent-primary {isPaused ? '' : 'animate-bounce'}"
						></span>
					</span>
				{:else if activeVariant === 'spin'}
					<span
						class="inline-block size-5 rounded-full border-2 border-accent-primary border-t-transparent {isPaused
							? ''
							: 'animate-spin'}"
					></span>
				{:else if activeVariant === 'stars'}
					<span class="font-mono text-base {isPaused ? '' : 'animate-pulse'}">✦✧✦</span>
				{:else if activeVariant === 'infinity'}
					<span class="font-mono text-lg font-bold {isPaused ? '' : 'animate-pulse'}">∞</span>
				{:else}
					<span class="relative inline-flex size-4 items-center justify-center">
						{#if !isPaused}
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-primary opacity-60"
							></span>
						{/if}
						<span class="relative inline-flex size-2.5 rounded-full bg-accent-primary"></span>
					</span>
				{/if}
			</div>

			<div class="min-w-0">
				<div class="flex items-center gap-2">
					<span class="font-semibold text-fg-main">{resolvedLabel}</span>
					<span
						class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase text-fg-light"
					>
						{activeVariant}
					</span>
				</div>
				{#if detail}
					<p class="mt-0.5 font-mono text-xs text-fg-light">{detail}</p>
				{/if}
			</div>
		</div>

		{#if showControls}
			<div class="flex flex-wrap items-center gap-1.5">
				{#each variants as item (item.id)}
					<button
						type="button"
						onclick={() => selectVariant(item.id)}
						class="rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors {activeVariant ===
						item.id
							? 'border-accent-primary bg-accent-subtle text-accent-primary'
							: 'border-card-border bg-canvas-primary text-fg-light hover:bg-canvas-secondary hover:text-fg-main'}"
					>
						{item.glyph} {item.label}
					</button>
				{/each}
				<button
					type="button"
					onclick={() => (isPaused = !isPaused)}
					class="rounded-lg border border-card-border bg-canvas-primary px-2.5 py-1 text-xs text-fg-light hover:bg-canvas-secondary hover:text-fg-main"
				>
					{isPaused ? '▶ Resume' : '⏸ Pause'}
				</button>
			</div>
		{/if}
	</div>
</div>
