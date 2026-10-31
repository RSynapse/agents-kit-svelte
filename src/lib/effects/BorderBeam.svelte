<script lang="ts">
	import { buttonClass } from '../ui/styles';
	import type { Snippet } from 'svelte';

	export type BorderBeamTone = 'accent' | 'success' | 'warning' | 'danger';
	export type BorderBeamSize = 'sm' | 'md' | 'line' | 'pulse';

	interface Props {
		active?: boolean;
		tone?: BorderBeamTone;
		size?: BorderBeamSize;
		durationSeconds?: number;
		label?: string;
		children?: Snippet;
		class?: string;
	}

	let {
		active = true,
		tone = 'accent',
		size = 'md',
		durationSeconds = 6,
		label = 'Active Worktree Run · Claude Code',
		children,
		class: className = ''
	}: Props = $props();

	let isActive = $state(true);

	$effect(() => {
		isActive = active;
	});

	/**
	 * Maps semantic beam tone to CSS custom property references defined in `app.css`.
	 *
	 * @param currentTone - Semantic tone name.
	 * @returns CSS variable expression for the beam color.
	 */
	function resolveBeamColorVar(currentTone: BorderBeamTone): string {
		switch (currentTone) {
			case 'accent':
				return 'var(--color-accent-primary-val)';
			case 'success':
				return 'var(--color-status-success-val)';
			case 'warning':
				return 'var(--color-status-warning-val)';
			case 'danger':
				return 'var(--color-status-danger-val)';
		}
	}

	let beamColor = $derived(resolveBeamColorVar(tone));
</script>

<div
	style:--ak-beam-color={beamColor}
	style:--ak-beam-duration="{durationSeconds}s"
	data-active={isActive}
	data-size={size}
	class="ak-border-beam relative overflow-hidden rounded-card bg-card-border p-px {className}"
>
	{#if isActive}
		<div aria-hidden="true" class="ak-border-beam-glow pointer-events-none absolute"></div>
	{/if}

	<div class="relative z-10 rounded-[9px] bg-card-bg">
		{#if children}
			{@render children()}
		{:else}
			<div class="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<span
							class="inline-flex size-1.5 rounded-full {isActive
								? 'ak-breathe bg-accent-primary'
								: 'bg-fg-light'}"
						></span>
						<span class="font-semibold text-fg-main">{label}</span>
					</div>
					<p class="text-xs text-fg-light">
						Animated semantic border beam highlighting active agent execution cards.
					</p>
				</div>

				<button
					type="button"
					aria-pressed={isActive}
					onclick={() => (isActive = !isActive)}
					class={buttonClass('secondary', 'sm')}
				>
					{isActive ? 'Pause Beam' : 'Resume Beam'}
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes ak-beam-spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.ak-border-beam-glow {
		/* A single soft highlight travelling the hairline; no glow, blur or bloom. */
		top: 50%;
		left: 50%;
		width: max(300%, 40rem);
		aspect-ratio: 1;
		translate: -50% -50%;
		background: conic-gradient(
			from 0deg,
			transparent 0deg,
			transparent 290deg,
			color-mix(in oklch, var(--ak-beam-color) 70%, transparent) 345deg,
			transparent 360deg
		);
		animation: ak-beam-spin var(--ak-beam-duration, 6s) linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.ak-border-beam-glow {
			animation: none;
			background: var(--ak-beam-color);
			opacity: 0.25;
		}
	}
</style>
