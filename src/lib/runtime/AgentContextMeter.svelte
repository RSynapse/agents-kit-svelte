<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { pillClass } from '../ui/styles';
	import { Spring, prefersReducedMotion } from 'svelte/motion';
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';
	import { computeContextMeter, formatCompactTokens } from '../state/chat-helpers';
	import { rise } from '../state/motion.svelte';
	import type { ContextSourceItem } from '../types';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'usedTokens' | 'maxTokens' | 'sources' | 'defaultOpen' | 'align'> {
		usedTokens: number;
		maxTokens: number;
		sources?: ContextSourceItem[];
		defaultOpen?: boolean;
		/** Which edge the breakdown panel lines up with. `auto` picks the side with room. */
		align?: 'auto' | 'start' | 'end';
		class?: string;
	}

	let {
		usedTokens,
		maxTokens,
		sources = [],
		defaultOpen = false,
		align = 'auto',
		class: className = '',
		...rest
	}: Props = $props();

	let isOpen = $state(false);
	let rootEl: HTMLElement | undefined = $state();
	let resolvedAlign = $state<'start' | 'end'>('end');
	const PANEL_WIDTH = 288;

	/**
	 * Chooses the panel edge that keeps it inside the nearest clipping ancestor
	 * (or the viewport), so it never bleeds past a card or screen edge.
	 */
	function measureAlign(): void {
		if (align !== 'auto') {
			resolvedAlign = align;
			return;
		}
		if (!rootEl) return;
		const trigger = rootEl.getBoundingClientRect();
		let left = 0;
		let right = window.innerWidth;
		for (let el = rootEl.parentElement; el; el = el.parentElement) {
			const style = getComputedStyle(el);
			if (style.overflowX !== 'visible' || style.overflow !== 'visible') {
				const rect = el.getBoundingClientRect();
				left = Math.max(left, rect.left);
				right = Math.min(right, rect.right);
				break;
			}
		}
		const fitsEnd = trigger.right - PANEL_WIDTH >= left + 4;
		const fitsStart = trigger.left + PANEL_WIDTH <= right - 4;
		resolvedAlign = fitsEnd || !fitsStart ? 'end' : 'start';
	}

	$effect(() => {
		if (isOpen) measureAlign();
	});

	$effect(() => {
		isOpen = defaultOpen;
	});

	let meter = $derived(computeContextMeter(usedTokens, maxTokens));

	const percentSpring = new Spring(0, { stiffness: 0.16, damping: 0.78 });

	$effect(() => {
		void percentSpring.set(meter.percent, { instant: prefersReducedMotion.current });
	});
</script>

<div {...rest} bind:this={rootEl} class={cn('relative inline-block text-xs', className)}>
	<button
		type="button"
		aria-label="Context window {meter.formattedUsed} of {meter.formattedMax} tokens ({meter.percent}%)"
		aria-expanded={isOpen}
		aria-controls="agent-context-meter-panel"
		onclick={() => (isOpen = !isOpen)}
		class={pillClass('secondary', 'sm')}
	>
		<span class="text-fg-light">Context</span>
		<span class="h-1.5 w-14 overflow-hidden rounded-full bg-chat-user">
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
			transition:rise={{ y: -4 }}
			class="absolute top-9 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-soft {resolvedAlign === 'end'
				? 'right-0'
				: 'left-0'} border border-chat-border bg-card-bg p-3.5 ak-shadow-soft"
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
