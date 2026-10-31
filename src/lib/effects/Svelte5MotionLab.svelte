<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { ArrowRight, Check, Plus } from '@lucide/svelte';
	import { SEGMENT_GROUP_CLASS, segmentClass } from '../ui/styles';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { fade, fly } from 'svelte/transition';
	import {
		ReactiveSpringMetric,
		createBoardCrossfade,
		motionDuration
	} from '../state/motion.svelte';

	export interface MotionCardItem {
		id: string;
		title: string;
		lane: 'queued' | 'running' | 'verified';
		tokens: number;
	}

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'initialTarget'> {
		initialTarget?: number;
		class?: string;
	}

	const INITIAL_CARDS: MotionCardItem[] = [
		{ id: 'mc-1', title: 'Card 2151 · Contrast Audit', lane: 'verified', tokens: 14200 },
		{ id: 'mc-2', title: 'Card 2152 · Breakpoint Align', lane: 'running', tokens: 28400 },
		{ id: 'mc-3', title: 'Card 2177 · Skills Scroll Cue', lane: 'queued', tokens: 9600 },
		{ id: 'mc-4', title: 'Card 2180 · Svelte 5 Motion', lane: 'running', tokens: 34100 }
	];

	const LANES: { id: MotionCardItem['lane']; label: string }[] = [
		{ id: 'queued', label: 'Queued' },
		{ id: 'running', label: 'Running' },
		{ id: 'verified', label: 'Verified' }
	];

	const REACTIVE_TAGS = [
		'$props()',
		'$state()',
		'$derived()',
		'$effect()',
		'Spring',
		'Tween',
		'crossfade',
		'animate:flip',
		'SvelteSet',
		'SvelteMap',
		'{#snippet}'
	];

	let { initialTarget = 76, class: className = '', ...rest }: Props = $props();

	const springMetric = new ReactiveSpringMetric(76, { stiffness: 0.14, damping: 0.58 });
	const [send, receive] = createBoardCrossfade(260);

	// Svelte 5 reactive collections from 'svelte/reactivity'
	const activeTags = new SvelteSet<string>(['$props()', '$state()', 'Spring', 'crossfade', 'animate:flip']);
	const tagClickCounts = new SvelteMap<string, number>([
		['Spring', 3],
		['crossfade', 2],
		['animate:flip', 4]
	]);

	let cards = $state<MotionCardItem[]>(INITIAL_CARDS);
	let ready = $state(false);

	$effect(() => {
		ready = true;
		springMetric.set(initialTarget);
	});

	/**
	 * Cycles a card to the next workflow lane, triggering `crossfade` (`send`/`receive`)
	 * and `animate:flip` across the lane containers.
	 *
	 * @param id - Card identifier to advance.
	 */
	function cycleCardLane(id: string): void {
		cards = cards.map((card) => {
			if (card.id !== id) return card;
			const nextLane: MotionCardItem['lane'] =
				card.lane === 'queued' ? 'running' : card.lane === 'running' ? 'verified' : 'queued';
			return { ...card, lane: nextLane };
		});
	}

	/**
	 * Toggles a tag in `SvelteSet` and increments its interaction counter in `SvelteMap`.
	 *
	 * @param tag - Tag name to toggle.
	 */
	function toggleReactiveTag(tag: string): void {
		if (activeTags.has(tag)) {
			activeTags.delete(tag);
		} else {
			activeTags.add(tag);
		}
		tagClickCounts.set(tag, (tagClickCounts.get(tag) ?? 0) + 1);
	}
</script>

{#snippet laneBadge(lane: MotionCardItem['lane'])}
	<span
		class="rounded-chip px-1.5 py-px text-[11px] font-medium capitalize {lane ===
		'verified'
			? 'bg-status-success-subtle text-status-success'
			: lane === 'running'
				? 'bg-accent-subtle text-accent-primary'
				: 'bg-canvas-secondary text-fg-light'}"
	>
		{lane}
	</span>
{/snippet}

<section {...rest}
	aria-label="Svelte 5 Motion, Spring Physics, Crossfade & Reactivity Lab"
	class="space-y-5 rounded-window border border-card-border bg-card-bg p-5 text-sm shadow-xs {className}"
>
	<header class="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-border pb-3.5">
		<div>
			<div class="flex flex-wrap items-center gap-2">
				<span class="rounded-full bg-accent-subtle px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent-primary">
					svelte/motion · svelte/transition · svelte/animate · svelte/reactivity
				</span>
				<span class="font-mono text-[11px] text-fg-light">
					Reduced motion: {prefersReducedMotion.current ? 'ON' : 'OFF'}
				</span>
			</div>
			<h3 class="mt-1 text-base font-semibold text-fg-main">
				Svelte 5 Microanimations, Spring Physics &amp; Crossfade Lab
			</h3>
		</div>

		<div class="{SEGMENT_GROUP_CLASS} flex-wrap">
			{#each [24, 52, 76, 98] as preset (preset)}
				<button
					type="button"
					disabled={!ready}
					aria-label="Spring to {preset}%"
					aria-pressed={springMetric.targetValue === preset}
					onclick={() => springMetric.set(preset)}
					class={segmentClass(springMetric.targetValue === preset)}
				>
					{preset}%
				</button>
			{/each}
		</div>
	</header>

	<div class="grid gap-5 lg:grid-cols-12">
		<!-- 1. Svelte 5 Spring Physics Panel -->
		<div class="space-y-3 rounded-xl border border-card-border bg-canvas-primary p-4 lg:col-span-5">
			<div class="flex items-center justify-between">
				<span class="font-mono text-xs font-semibold text-fg-main">
					1. new Spring() Physics Gauge
				</span>
				<span class="font-mono text-sm font-bold tabular-nums text-accent-primary">
					{springMetric.rounded}%
				</span>
			</div>

			<!-- Spring-driven visual bar and floating puck -->
			<div class="relative h-3 w-full overflow-hidden rounded-full bg-canvas-secondary">
				<div
					class="h-full rounded-full bg-accent-primary"
					style="width: {springMetric.clampedPercent}%;"
				></div>
			</div>

			<div class="grid grid-cols-2 gap-3 pt-1 text-xs">
				<label class="space-y-1">
					<span class="flex justify-between text-xs text-fg-light">
						<span>Stiffness</span>
						<span class="tabular-nums text-fg-main">{springMetric.stiffness.toFixed(2)}</span>
					</span>
					<input
						type="range"
						min="0.04"
						max="0.38"
						step="0.02"
						bind:value={springMetric.stiffness}
						aria-label="Spring stiffness"
						class="w-full accent-accent-primary"
					/>
				</label>

				<label class="space-y-1">
					<span class="flex justify-between text-xs text-fg-light">
						<span>Damping</span>
						<span class="tabular-nums text-fg-main">{springMetric.damping.toFixed(2)}</span>
					</span>
					<input
						type="range"
						min="0.22"
						max="0.96"
						step="0.02"
						bind:value={springMetric.damping}
						aria-label="Spring damping"
						class="w-full accent-accent-primary"
					/>
				</label>
			</div>

			<!-- 2. SvelteSet & SvelteMap Reactive Pills -->
			<div class="border-t border-canvas-border pt-3">
				<div class="mb-2 flex items-center justify-between text-xs">
					<span class="font-mono font-semibold text-fg-main">
						2. SvelteSet &amp; SvelteMap Primitives
					</span>
					<span class="font-mono text-[11px] text-fg-light">
						{activeTags.size} active
					</span>
				</div>
				<div class="flex flex-wrap gap-1.5">
					{#each REACTIVE_TAGS as tag (tag)}
						{@const isSelected = activeTags.has(tag)}
						{@const clicks = tagClickCounts.get(tag) ?? 0}
						<button
							type="button"
							disabled={!ready}
							aria-pressed={isSelected}
							onclick={() => toggleReactiveTag(tag)}
							class="inline-flex h-6 items-center gap-1 rounded-chip border px-2 font-mono text-[11px] transition-colors {isSelected
								? 'border-fg-main/20 bg-fg-main text-fg-inverse'
								: 'border-card-border bg-card-bg text-fg-light hover:text-fg-main'}"
						>
							{#key isSelected}
								<span in:fade={{ duration: motionDuration(120) }} class="inline-flex">
									{#if isSelected}<Check aria-hidden="true" class="size-3" />{:else}<Plus aria-hidden="true" class="size-3" />{/if}
								</span>
							{/key}
							<span>{tag}</span>
							{#if clicks > 0}
								<span class="rounded bg-card-bg px-1 text-[10px] tabular-nums text-fg-light">
									{clicks}
								</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- 3. Crossfade (send/receive) + animate:flip Multi-Lane Board -->
		<div class="space-y-2.5 rounded-xl border border-card-border bg-canvas-primary p-4 lg:col-span-7">
			<div class="flex items-center justify-between text-xs">
				<span class="font-mono font-semibold text-fg-main">
					3. crossfade (send/receive) + animate:flip Lane Switcher
				</span>
				<span class="text-fg-light">Click any card to glide it to the next lane</span>
			</div>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{#each LANES as lane (lane.id)}
					{@const laneCards = cards.filter((c) => c.lane === lane.id)}
					<div class="rounded-xl border border-card-border bg-canvas-secondary p-2.5">
						<div class="mb-2 flex items-center justify-between px-1">
							<span class="text-[11px] font-medium capitalize text-fg-main">
								{lane.label}
							</span>
							<span class="rounded-full bg-card-bg px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-fg-light">
								{laneCards.length}
							</span>
						</div>

						<div class="space-y-2">
							{#each laneCards as card (card.id)}
								<button
									type="button"
									disabled={!ready}
									in:receive={{ key: card.id }}
									out:send={{ key: card.id }}
									animate:flip={{ duration: motionDuration(240), easing: cubicOut }}
									onclick={() => cycleCardLane(card.id)}
									class="flex w-full flex-col items-start gap-1.5 rounded-control border border-card-border bg-card-bg p-2.5 text-left transition-colors hover:border-fg-light/40"
								>
									<div class="flex w-full items-center justify-between gap-1">
										{@render laneBadge(card.lane)}
										<ArrowRight aria-label="Advance" class="size-3.5 text-fg-light" />
									</div>
									<span class="text-xs font-semibold text-fg-main">{card.title}</span>
								</button>
							{:else}
								<div
									in:fly={{ y: 4, duration: motionDuration(150) }}
									class="rounded-control border border-dashed border-card-border py-4 text-center text-xs text-fg-light"
								>
									Empty lane
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
