<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Check, CircleDot, Copy, Sparkles, X } from '@lucide/svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';
	import { motionDuration, rise } from '../state/motion.svelte';
	import { badgeClass, buttonClass, PROGRESS_TRACK_CLASS, progressFillClass } from '../ui/styles';
	import type { GitHubTriageIssue } from '../types';
	import { LiveLoop } from './live-loop.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'issue' | 'live' | 'onApply' | 'onMarkDuplicate'> {
		issue: GitHubTriageIssue;
		/** Demo mode: reveals the agent's suggestions one at a time, then loops. Off by default. */
		live?: boolean;
		onApply?: (issueNumber: number, applied: string[]) => void;
		onMarkDuplicate?: (issueNumber: number, duplicateOf: number) => void;
		class?: string;
	}

	let { issue, live = false, onApply, onMarkDuplicate, class: className = '', ...rest }: Props = $props();

	const loop = new LiveLoop(() => issue.suggestions.length + 2, 4);
	const rejected = new SvelteSet<string>();
	let applied = $state(false);
	let duplicateMarked = $state(false);

	$effect(() => {
		if (!live) return;
		return loop.start(900);
	});

	const step = $derived(live ? loop.step : loop.total);
	const visibleSuggestions = $derived(issue.suggestions.slice(0, Math.max(0, step - 1)));
	const thinking = $derived(step < loop.total && !applied);
	const showDuplicate = $derived(!!issue.duplicate && step >= loop.total);

	/** Toggles whether a suggestion is kept, and takes over from the live demo. */
	function toggle(id: string): void {
		loop.pause();
		if (rejected.has(id)) rejected.delete(id);
		else rejected.add(id);
	}

	/** Applies every kept suggestion to the issue. */
	function apply(): void {
		loop.pause();
		applied = true;
		onApply?.(
			issue.number,
			issue.suggestions.filter((s) => !rejected.has(s.id)).map((s) => s.value)
		);
	}
</script>

<article {...rest} class="overflow-hidden rounded-card border border-card-border bg-card-bg text-sm {className}">
	<header class="border-b border-canvas-border px-4 py-3">
		<div class="flex items-start gap-2.5">
			<CircleDot aria-hidden="true" class="mt-0.5 size-4 shrink-0 text-status-success" />
			<div class="min-w-0 flex-1">
				<h3 class="font-semibold text-fg-main">
					{issue.title} <span class="font-normal text-fg-light">#{issue.number}</span>
				</h3>
				<p class="mt-0.5 text-xs text-fg-light">
					Opened {issue.openedAt} by <strong class="font-medium text-fg-main">{issue.author}</strong> · needs triage
				</p>
			</div>
		</div>
		<p class="mt-2.5 rounded-control bg-canvas-secondary px-3 py-2 text-xs leading-5 text-fg-main">{issue.body}</p>
	</header>

	<div class="px-4 py-3">
		<div class="mb-2 flex items-center justify-between gap-2">
			<span class="inline-flex items-center gap-1.5 text-xs font-medium text-fg-main">
				<Sparkles aria-hidden="true" class="size-3.5 text-accent-primary" />
				{#if applied}
					Triage applied
				{:else if thinking}
					<span class="ak-shimmer-text">Reading the issue and similar reports…</span>
				{:else}
					Suggested triage
				{/if}
			</span>
			<span class="text-[11px] text-fg-light">Click a row to drop it</span>
		</div>

		<ul class="space-y-1">
			{#each visibleSuggestions as s (s.id)}
				{@const off = rejected.has(s.id)}
				<li in:rise>
					<button
						type="button"
						onclick={() => toggle(s.id)}
						disabled={applied}
						aria-pressed={!off}
						class="grid w-full grid-cols-[5.5rem_1fr_4.5rem] items-center gap-3 rounded-control px-2 py-1.5 text-left text-xs transition-colors hover:bg-canvas-primary disabled:hover:bg-transparent {off
							? 'opacity-45'
							: ''}"
					>
						<span class="text-fg-light">{s.label}</span>
						<span class="flex min-w-0 items-center gap-1.5">
							<span class={badgeClass(s.tone, off ? 'line-through' : '')}>{s.value}</span>
							{#if applied && !off}<Check aria-hidden="true" class="size-3 text-status-success" />{/if}
						</span>
						<span class="flex items-center gap-1.5">
							<span class="{PROGRESS_TRACK_CLASS} h-1 flex-1">
								<span class={progressFillClass(s.confidence >= 0.85 ? 'success' : 'accent')} style="width: {Math.round(s.confidence * 100)}%"></span>
							</span>
							<span class="w-7 text-right font-mono text-[10px] tabular-nums text-fg-light">{Math.round(s.confidence * 100)}%</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>

		{#if showDuplicate && issue.duplicate}
			<div
				transition:slide={{ duration: motionDuration(180) }}
				class="mt-3 flex flex-wrap items-center gap-2 rounded-control border border-status-warning/30 bg-status-warning-subtle px-3 py-2 text-xs"
			>
				<Copy aria-hidden="true" class="size-3.5 text-status-warning" />
				<span class="min-w-0 flex-1 text-fg-main">
					Possibly related to <strong class="font-medium">#{issue.duplicate.number}</strong> “{issue.duplicate.title}”
					<span class="text-fg-light">· {Math.round(issue.duplicate.similarity * 100)}% similar</span>
				</span>
				<button
					type="button"
					class={buttonClass('ghost', 'xs')}
					disabled={duplicateMarked}
					onclick={() => {
						loop.pause();
						duplicateMarked = true;
						if (issue.duplicate) onMarkDuplicate?.(issue.number, issue.duplicate.number);
					}}
				>
					{duplicateMarked ? 'Linked' : 'Link as related'}
				</button>
			</div>
		{/if}
	</div>

	<footer class="flex flex-wrap items-center justify-end gap-1.5 border-t border-canvas-border px-4 py-2.5">
		<button type="button" class={buttonClass('ghost', 'sm')} disabled={applied} onclick={() => { loop.pause(); rejected.clear(); }}>
			<X aria-hidden="true" />Reset
		</button>
		<button type="button" class={buttonClass('primary', 'sm')} disabled={applied || thinking} onclick={apply}>
			<Check aria-hidden="true" />{applied ? 'Applied' : 'Apply triage'}
		</button>
	</footer>
</article>
