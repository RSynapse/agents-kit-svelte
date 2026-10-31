<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Check, Package, Sparkles, Tag } from '@lucide/svelte';
	import { rise } from '../state/motion.svelte';
	import { badgeClass, buttonClass, segmentClass, SEGMENT_GROUP_CLASS } from '../ui/styles';
	import type { GitHubReleaseData } from '../types';
	import { LiveLoop } from './live-loop.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'release' | 'live' | 'onPublish'> {
		release: GitHubReleaseData;
		/** Demo mode: writes the release notes line by line, then loops. Off by default. */
		live?: boolean;
		onPublish?: (tag: string, prerelease: boolean) => void;
		class?: string;
	}

	let { release, live = false, onPublish, class: className = '', ...rest }: Props = $props();

	const flatCount = $derived(release.groups.reduce((n, g) => n + g.items.length, 0));
	const contributors = $derived([...new Set(release.groups.flatMap((g) => g.items.map((i) => i.author)))]);

	const loop = new LiveLoop(() => flatCount, 5);
	let channel = $state<'latest' | 'prerelease'>('latest');
	let published = $state(false);

	$effect(() => {
		if (!live) return;
		return loop.start(700);
	});

	const shown = $derived(live ? loop.step : flatCount);
	const writing = $derived(shown < flatCount);

	/** Number of items from a group that have been written so far. */
	function visibleIn(groupIndex: number): number {
		const before = release.groups.slice(0, groupIndex).reduce((n, g) => n + g.items.length, 0);
		return Math.max(0, Math.min(release.groups[groupIndex].items.length, shown - before));
	}

	/** Publishes the release on the chosen channel. */
	function publish(): void {
		loop.pause();
		published = true;
		onPublish?.(release.tag, channel === 'prerelease');
	}
</script>

<article {...rest} class="overflow-hidden rounded-card border border-card-border bg-card-bg text-sm {className}">
	<header class="flex flex-wrap items-start justify-between gap-2 border-b border-canvas-border px-4 py-3">
		<div class="min-w-0">
			<p class="flex flex-wrap items-center gap-2">
				<span class={badgeClass('accent')}><Tag aria-hidden="true" />{release.tag}</span>
				{#if published}
					<span in:rise class={badgeClass(channel === 'latest' ? 'success' : 'warning')}>
						{channel === 'latest' ? 'Latest' : 'Pre-release'}
					</span>
				{:else}
					<span class={badgeClass('neutral')}>Draft</span>
				{/if}
			</p>
			<h3 class="mt-1.5 font-semibold text-fg-main">{release.name}</h3>
			<p class="text-xs text-fg-light">
				{release.previousTag}…{release.tag} · {flatCount} pull requests · targets <code class="font-mono">{release.target}</code>
			</p>
		</div>
		<span class="inline-flex items-center gap-1.5 text-xs text-fg-light">
			<Sparkles aria-hidden="true" class="size-3.5 text-accent-primary" />
			{#if writing}<span class="ak-shimmer-text">Writing notes from merged PRs…</span>{:else}Notes generated{/if}
		</span>
	</header>

	<div class="space-y-3 px-4 py-3">
		{#each release.groups as group, gi (group.id)}
			{@const n = visibleIn(gi)}
			{#if n > 0}
				<section in:rise>
					<h4 class="text-xs font-semibold text-fg-main">{group.title}</h4>
					<ul class="mt-1 space-y-0.5">
						{#each group.items.slice(0, n) as item (item.pr)}
							<li class="flex items-baseline gap-2 text-xs leading-5" in:rise>
								<span aria-hidden="true" class="mt-2 size-1 shrink-0 rounded-full bg-fg-light"></span>
								<span class="min-w-0 flex-1 text-fg-main">
									{item.text}
									<span class="text-fg-light">by {item.author} in <span class="font-mono text-accent-primary">#{item.pr}</span></span>
								</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		{/each}

		{#if !writing}
			<div in:rise class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-control bg-canvas-secondary px-3 py-2 text-xs">
				<span class="flex items-center gap-1.5">
					<span class="flex -space-x-1.5">
						{#each contributors as person (person)}
							<span title={person} class="inline-flex size-5 items-center justify-center rounded-full border-2 border-canvas-secondary bg-card-bg text-[9px] font-semibold text-accent-primary ak-shadow-btn uppercase">
								{person.slice(0, 1)}
							</span>
						{/each}
					</span>
					<span class="text-fg-light">{contributors.length} contributors</span>
				</span>
				{#each release.assets as asset (asset.name)}
					<span class="inline-flex items-center gap-1 font-mono text-[11px] text-fg-main">
						<Package aria-hidden="true" class="size-3 text-fg-light" />{asset.name}
						<span class="text-fg-light">{asset.size}</span>
					</span>
				{/each}
			</div>
		{/if}
	</div>

	<footer class="flex flex-wrap items-center justify-between gap-2 border-t border-canvas-border px-4 py-2.5">
		<div class={SEGMENT_GROUP_CLASS} role="radiogroup" aria-label="Release channel">
			<button type="button" role="radio" aria-checked={channel === 'latest'} disabled={published} class={segmentClass(channel === 'latest')} onclick={() => { loop.pause(); channel = 'latest'; }}>
				Latest
			</button>
			<button type="button" role="radio" aria-checked={channel === 'prerelease'} disabled={published} class={segmentClass(channel === 'prerelease')} onclick={() => { loop.pause(); channel = 'prerelease'; }}>
				Pre-release
			</button>
		</div>
		<button type="button" class={buttonClass('primary', 'sm')} disabled={writing || published} onclick={publish}>
				{#if published}<Check aria-hidden="true" />Published{:else}<Tag aria-hidden="true" />Publish release{/if}
			</button>
	</footer>
</article>
