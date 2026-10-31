<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { GitMerge, ListOrdered, Pause, Play, X } from '@lucide/svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { motionDuration, rise } from '../state/motion.svelte';
	import { badgeClass, buttonClass, PROGRESS_TRACK_CLASS, progressFillClass } from '../ui/styles';
	import type { GitHubMergeQueueEntry } from '../types';
	import { LiveLoop } from './live-loop.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'baseBranch' | 'entries' | 'ticksPerMerge' | 'live' | 'onRemove'> {
		baseBranch?: string;
		entries?: GitHubMergeQueueEntry[];
		/** Ticks needed to finish one merge group's checks. */
		ticksPerMerge?: number;
		/** Demo mode: plays entries running checks and merging in order, then loops. Off by default. */
		live?: boolean;
		onRemove?: (prNumber: number) => void;
		class?: string;
	}

	let {
		baseBranch = 'main',
		entries = [],
		ticksPerMerge = 3,
		live = false,
		onRemove,
		class: className = '',
		...rest
	}: Props = $props();

	const loop = new LiveLoop(() => (entries.length - 1) * ticksPerMerge, 4);
	let removed = $state<number[]>([]);
	let held = $state(false);

	$effect(() => {
		if (!live) return;
		return loop.start(800);
	});

	const step = $derived(live ? loop.step : 0);
	const mergedCount = $derived(Math.floor(step / ticksPerMerge));
	const headProgress = $derived((step % ticksPerMerge) / ticksPerMerge);
	const remaining = $derived(entries.filter((e) => !removed.includes(e.number)));
	const merged = $derived(remaining.slice(0, mergedCount).reverse());
	const queued = $derived(remaining.slice(mergedCount));

	/**
	 * Returns how many of an entry's checks have passed. The head of the queue runs ahead;
	 * the entry behind it is tested speculatively on top of it.
	 */
	function passed(entry: GitHubMergeQueueEntry, position: number): number {
		if (held) return 0;
		const share = position === 0 ? headProgress : position === 1 ? headProgress / 2 : 0;
		return Math.round(entry.checksTotal * share);
	}

	/** Removes a pull request from the queue and takes over from the demo. */
	function remove(prNumber: number): void {
		loop.pause();
		removed = [...removed, prNumber];
		onRemove?.(prNumber);
	}
</script>

<section {...rest} aria-label="Merge queue for {baseBranch}" class={cn('overflow-hidden rounded-card border border-card-border bg-card-bg text-sm', className)}>
	<header class="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border px-4 py-3">
		<div class="flex items-center gap-2">
			<ListOrdered aria-hidden="true" class="size-4 text-fg-light" />
			<div>
				<h3 class="font-semibold text-fg-main">Merge queue · <code class="font-mono text-[13px]">{baseBranch}</code></h3>
				<p class="text-xs text-fg-light">Each group is tested on top of the one ahead before it lands.</p>
			</div>
		</div>
		<button
			type="button"
			class={buttonClass('secondary', 'sm')}
			aria-pressed={held}
			onclick={() => {
				held = !held;
				if (held) loop.pause();
				else loop.resume();
			}}
		>
			{#if held}<Play aria-hidden="true" />Resume queue{:else}<Pause aria-hidden="true" />Hold queue{/if}
		</button>
	</header>

	<ol class="divide-y divide-canvas-border">
		{#each queued as entry, i (entry.number)}
			{@const ok = passed(entry, i)}
			<li class="flex items-center gap-3 px-4 py-2.5" animate:flip={{ duration: motionDuration(260) }} out:fade={{ duration: motionDuration(140) }}>
				<span class="inline-flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] tabular-nums {i === 0 && !held ? 'bg-accent-subtle text-accent-primary' : 'bg-canvas-secondary text-fg-light'}">
					{i + 1}
				</span>
				<div class="min-w-0 flex-1">
					<p class="truncate text-xs font-medium text-fg-main">{entry.title} <span class="font-normal text-fg-light">#{entry.number}</span></p>
					<div class="mt-1 flex items-center gap-2">
						<span class="{PROGRESS_TRACK_CLASS} h-1 w-28">
							<span class={progressFillClass(i === 0 ? 'accent' : 'neutral')} style="width: {(ok / entry.checksTotal) * 100}%"></span>
						</span>
						<span class="font-mono text-[10px] text-fg-light tabular-nums">
							{held ? 'held' : i < 2 ? `${ok}/${entry.checksTotal} checks` : 'waiting'}
						</span>
						<span class="truncate text-[11px] text-fg-light">· {entry.author}</span>
					</div>
				</div>
				<button type="button" aria-label="Remove #{entry.number} from the queue" title="Remove from queue" class={buttonClass('ghost', 'icon-xs')} onclick={() => remove(entry.number)}>
					<X aria-hidden="true" />
				</button>
			</li>
		{:else}
			<li class="px-4 py-4 text-center text-xs text-fg-light">Queue is empty.</li>
		{/each}
	</ol>

	{#if merged.length}
		<div class="border-t border-canvas-border bg-canvas-secondary/50 px-4 py-2.5">
			<p class="mb-1 text-[11px] font-medium text-fg-light">Merged just now</p>
			<ul class="space-y-1">
				{#each merged as entry (entry.number)}
					<li class="flex items-center gap-2 text-xs" in:rise animate:flip={{ duration: motionDuration(220) }}>
						<GitMerge aria-hidden="true" class="size-3.5 text-accent-primary" />
						<span class="min-w-0 flex-1 truncate text-fg-main">{entry.title}</span>
						<span class={badgeClass('accent')}>#{entry.number}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</section>
