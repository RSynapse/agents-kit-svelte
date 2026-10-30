<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { Spring, prefersReducedMotion } from 'svelte/motion';
	import { fly } from 'svelte/transition';
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';
	import { computeContextMeter, formatCompactTokens } from '../state/chat-helpers';
	import { motionDuration, pressScale } from '../state/motion.svelte';
	import type { ContextSourceItem } from '../types';

	interface Props {
		usedTokens: number;
		maxTokens: number;
		sources?: ContextSourceItem[];
		defaultOpen?: boolean;
		class?: string;
	}

	let {
		usedTokens,
		maxTokens,
		sources = [],
		defaultOpen = false,
		class: className = ''
	}: Props = $props();

	let isOpen = $state(false);

	$effect(() => {
		isOpen = defaultOpen;
	});

	let meter = $derived(computeContextMeter(usedTokens, maxTokens));

	const percentSpring = new Spring(0, { stiffness: 0.16, damping: 0.78 });

	$effect(() => {
		void percentSpring.set(meter.percent, { instant: prefersReducedMotion.current });
	});
</script>

<div class="relative inline-block text-xs {className}">
	<button
		type="button"
		use:pressScale
		aria-label="Context window {meter.formattedUsed} of {meter.formattedMax} tokens ({meter.percent}%)"
		aria-expanded={isOpen}
		aria-controls="agent-context-meter-panel"
		onclick={() => (isOpen = !isOpen)}
		class="inline-flex items-center gap-2 rounded-lg border border-card-border bg-canvas-secondary px-2.5 py-1 font-mono text-xs text-fg-main transition-colors hover:bg-card-bg"
	>
		<span class="text-fg-light">Context</span>
		<span class="h-1.5 w-14 overflow-hidden rounded-full bg-card-bg">
			<span
				class="block h-full rounded-full transition-colors {meter.tone === 'danger'
					? 'bg-status-danger'
					: meter.tone === 'warning'
						? 'bg-status-warning'
						: 'bg-accent-primary'}"
				style="width: {Math.max(0, Math.min(100, percentSpring.current))}%;"
			></span>
		</span>
		<span class="tabular-nums font-medium">
			{meter.formattedUsed}/{meter.formattedMax}
		</span>
		<span class="tabular-nums text-fg-light">({Math.round(percentSpring.current)}%)</span>
	</button>

	{#if sources.length > 0 && isOpen}
		<div
			id="agent-context-meter-panel"
			transition:fly={{ y: -6, duration: motionDuration(180), easing: cubicOut }}
			class="absolute right-0 top-9 z-30 w-72 rounded-xl border border-card-border bg-card-bg p-3 shadow-lg"
		>
			<div class="flex items-center justify-between border-b border-canvas-border pb-2">
				<span class="font-semibold text-fg-main">Context Window Breakdown</span>
				<span class="font-mono text-[11px] tabular-nums text-fg-light">
					{meter.percent}% used
				</span>
			</div>
			<AgentDisclosure open={isOpen}>
				<ul class="mt-2 space-y-1.5">
					{#each sources as source (source.id)}
						<li class="flex items-center justify-between gap-2 text-xs">
							<span class="truncate text-fg-main">{source.label}</span>
							<span class="font-mono text-[11px] tabular-nums text-fg-light">
								{formatCompactTokens(source.tokens)}
							</span>
						</li>
					{/each}
				</ul>
			</AgentDisclosure>
		</div>
	{/if}
</div>
