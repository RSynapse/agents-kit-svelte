<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class' | 'children' | 'label' | 'elapsedSeconds' | 'initialSeconds' | 'running'> {
		label?: string;
		elapsedSeconds?: number;
		initialSeconds?: number;
		running?: boolean;
		class?: string;
	}

	let {
		label = 'Working',
		elapsedSeconds,
		initialSeconds = 0,
		running = true,
		class: className = '',
		...rest
	}: Props = $props();

	const GRID_DELAYS = [0, 140, 280, 420, 560, 700, 840, 980, 1120];
	const TICK_INTERVAL_MS = 100;

	let internalSeconds = $state(0);

	/**
	 * Formats total seconds into a compact `Xm Y.Zs` or `Y.Zs` timer label.
	 *
	 * @param totalSeconds - Elapsed seconds.
	 * @returns Formatted duration string.
	 */
	function formatElapsed(totalSeconds: number): string {
		const safeSeconds = Math.max(0, totalSeconds);
		const minutes = Math.floor(safeSeconds / 60);
		const seconds = (safeSeconds % 60).toFixed(1);
		return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
	}

	$effect(() => {
		internalSeconds = initialSeconds;
		if (elapsedSeconds !== undefined || !running) {
			return;
		}
		const startedAt = performance.now() - initialSeconds * 1000;
		const timer = window.setInterval(() => {
			internalSeconds = (performance.now() - startedAt) / 1000;
		}, TICK_INTERVAL_MS);

		return () => window.clearInterval(timer);
	});

	let displayedElapsed = $derived(elapsedSeconds ?? internalSeconds);
</script>

<span {...rest}
	role="status"
	aria-label="{label}, in progress"
	class={cn('inline-flex items-center gap-2.5 rounded-full bg-chat-surface py-1 pr-3 pl-2 text-xs text-fg-light', className)}
>
	<span aria-hidden="true" class="grid size-4 shrink-0 grid-cols-3 gap-[2px]">
		{#each GRID_DELAYS as delay (delay)}
			<span
				class="ak-progress-cell rounded-full bg-chat-accent"
				style="animation-delay: {delay}ms;"
			></span>
		{/each}
	</span>
	<span class="font-medium text-fg-main">{label}</span>
	<span aria-hidden="true" class="tabular-nums text-fg-light">
		{formatElapsed(displayedElapsed)}
	</span>
</span>

<style>
	@keyframes ak-progress-cell {
		0%,
		100% {
			opacity: 0.25;
		}
		50% {
			opacity: 1;
		}
	}

	.ak-progress-cell {
		animation: ak-progress-cell 1.4s ease-in-out infinite;
	}
</style>
