<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Check, CircleCheck, FileCode, MessageSquare, MessageSquareWarning } from '@lucide/svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';
	import { motionDuration, rise } from '../state/motion.svelte';
	import { badgeClass, buttonClass, segmentClass, SEGMENT_GROUP_CLASS } from '../ui/styles';
	import type { GitHubReviewFile, GitHubReviewVerdict } from '../types';
	import { LiveLoop } from './live-loop.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'prNumber' | 'title' | 'reviewer' | 'files' | 'live' | 'onSubmitReview'> {
		prNumber: number;
		title: string;
		reviewer?: string;
		files?: GitHubReviewFile[];
		/** Demo mode: plays a reviewer reading each file, leaving a comment and approving, then loops. Off by default. */
		live?: boolean;
		onSubmitReview?: (prNumber: number, verdict: GitHubReviewVerdict) => void;
		class?: string;
	}

	const VERDICTS: { id: GitHubReviewVerdict; label: string }[] = [
		{ id: 'comment', label: 'Comment' },
		{ id: 'approve', label: 'Approve' },
		{ id: 'request-changes', label: 'Request changes' }
	];

	let {
		prNumber,
		title,
		reviewer,
		files = [],
		live = false,
		onSubmitReview,
		class: className = '',
		...rest
	}: Props = $props();

	// Steps: read file 1 → comment lands → each file marked viewed in turn → approve.
	const loop = new LiveLoop(() => files.length + 2, 5);
	const manuallyViewed = new SvelteSet<string>();
	let activePath = $state<string | null>(null);
	let verdict = $state<GitHubReviewVerdict>('approve');
	let submitted = $state<GitHubReviewVerdict | null>(null);

	$effect(() => {
		if (!live) return;
		return loop.start(1300);
	});

	const step = $derived(live ? loop.step : loop.total);
	// Once every file is viewed, return to the first file so the inline comment stays in view.
	const autoIndex = $derived(step > files.length ? 0 : Math.max(0, Math.min(files.length - 1, step - 1)));
	const activeFile = $derived(files.find((f) => f.path === activePath) ?? files[autoIndex]);
	const commentVisible = $derived(step >= 1 || loop.paused);
	const autoSubmitted = $derived(live && step >= loop.total && !loop.paused ? 'approve' : null);
	const finalVerdict = $derived(submitted ?? autoSubmitted);

	/** Whether a file has been marked viewed, by the demo or the reader. */
	function isViewed(path: string, index: number): boolean {
		return manuallyViewed.has(path) || (!loop.paused && index < step - 1);
	}

	/** Takes over from the live demo. */
	function takeOver(): void {
		if (!loop.paused) {
			loop.pause();
			files.forEach((f, i) => {
				if (i < step - 1) manuallyViewed.add(f.path);
			});
		}
	}

	/** Submits the selected verdict. */
	function submit(): void {
		takeOver();
		submitted = verdict;
		onSubmitReview?.(prNumber, verdict);
	}
</script>

<article {...rest} class={cn('@container overflow-hidden rounded-card border border-card-border bg-card-bg text-sm', className)}>
	<header class="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border px-4 py-3">
		<div class="min-w-0">
			<h3 class="truncate font-semibold text-fg-main">{title} <span class="font-normal text-fg-light">#{prNumber}</span></h3>
			<p class="text-xs text-fg-light">
				Files changed{#if reviewer}{' · '}reviewing as <strong class="font-medium text-fg-main">{reviewer}</strong>{/if}
			</p>
		</div>
		<span class="font-mono text-xs text-fg-light tabular-nums">
			{files.filter((f, i) => isViewed(f.path, i)).length}/{files.length} viewed
		</span>
	</header>

	<div class="grid @2xl:grid-cols-[13rem_1fr]">
		<!-- File list -->
		<ul class="flex gap-1 overflow-x-auto border-b border-canvas-border p-2 @2xl:flex-col @2xl:border-r @2xl:border-b-0">
			{#each files as file, i (file.path)}
				{@const viewed = isViewed(file.path, i)}
				<li class="min-w-0 shrink-0 @2xl:shrink">
					<div class="flex items-center gap-1 rounded-control px-1.5 py-1 {activeFile?.path === file.path ? 'bg-canvas-secondary' : ''}">
						<button
							type="button"
							class="flex min-w-0 flex-1 items-center gap-1.5 text-left font-mono text-[11px] text-fg-main"
							onclick={() => {
								takeOver();
								activePath = file.path;
							}}
						>
							<FileCode aria-hidden="true" class="size-3.5 shrink-0 text-fg-light" />
							<span class="truncate">{file.path.split('/').pop()}</span>
							<span class="shrink-0 tabular-nums"><span class="text-diff-add-fg">+{file.additions}</span> <span class="text-diff-del-fg">-{file.deletions}</span></span>
						</button>
						<button
							type="button"
							aria-label="Mark {file.path} as viewed"
							aria-pressed={viewed}
							onclick={() => {
								takeOver();
								if (manuallyViewed.has(file.path)) manuallyViewed.delete(file.path);
								else manuallyViewed.add(file.path);
							}}
							class="inline-flex size-4 shrink-0 items-center justify-center rounded border transition-colors {viewed
								? 'border-status-success bg-status-success text-fg-inverse'
								: 'border-card-border bg-card-bg'}"
						>
							{#if viewed}<Check aria-hidden="true" class="size-2.5" strokeWidth={3} />{/if}
						</button>
					</div>
				</li>
			{/each}
		</ul>

		<!-- Diff -->
		{#if activeFile}
			<div class="min-w-0">
				<p class="border-b border-canvas-border bg-canvas-secondary/60 px-3 py-1.5 font-mono text-[11px] text-fg-light">{activeFile.path}</p>
				<div class="overflow-x-auto font-mono text-[11px] leading-5">
					{#each activeFile.lines as line, li (li)}
						<div
							class="grid grid-cols-[2.25rem_2.25rem_1rem_1fr] {line.kind === 'add'
								? 'bg-diff-add-bg'
								: line.kind === 'del'
									? 'bg-diff-del-bg'
									: line.kind === 'hunk'
										? 'bg-accent-subtle/60 text-fg-light'
										: ''}"
						>
							<span class="pr-1.5 text-right text-fg-light/70 select-none tabular-nums">{line.oldLine ?? ''}</span>
							<span class="pr-1.5 text-right text-fg-light/70 select-none tabular-nums">{line.newLine ?? ''}</span>
							<span class="text-center select-none {line.kind === 'add' ? 'text-diff-add-fg' : line.kind === 'del' ? 'text-diff-del-fg' : 'text-fg-light'}">
								{line.kind === 'add' ? '+' : line.kind === 'del' ? '-' : ''}
							</span>
							<span class="pr-3 whitespace-pre text-fg-main">{line.text}</span>
						</div>
						{#if activeFile.comment && commentVisible && line.newLine === activeFile.comment.afterLine}
							<div class="border-y border-canvas-border bg-card-bg px-3 py-2 font-sans" transition:slide={{ duration: motionDuration(200) }}>
								<p class="flex items-center gap-1.5 text-xs">
									<MessageSquare aria-hidden="true" class="size-3.5 text-fg-light" />
									<strong class="font-medium text-fg-main">{activeFile.comment.author}</strong>
									<span class="text-fg-light">commented</span>
								</p>
								<p class="mt-1 pl-5 text-xs leading-5 text-fg-main">{activeFile.comment.body}</p>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<footer class="flex flex-wrap items-center justify-between gap-2 border-t border-canvas-border px-4 py-2.5">
		{#if finalVerdict}
			<span in:rise class={badgeClass(finalVerdict === 'approve' ? 'success' : finalVerdict === 'request-changes' ? 'danger' : 'neutral')}>
				{#if finalVerdict === 'approve'}<CircleCheck aria-hidden="true" />Approved{:else if finalVerdict === 'request-changes'}<MessageSquareWarning aria-hidden="true" />Changes requested{:else}<MessageSquare aria-hidden="true" />Commented{/if}
				{#if reviewer}by {reviewer}{/if}
			</span>
		{:else}
			<span class="text-xs text-fg-light">1 pending comment</span>
		{/if}
		<div class="flex items-center gap-1.5">
			<div class={SEGMENT_GROUP_CLASS} role="radiogroup" aria-label="Review verdict">
				{#each VERDICTS as v (v.id)}
					<button
						type="button"
						role="radio"
						aria-checked={verdict === v.id}
						onclick={() => {
							takeOver();
							verdict = v.id;
						}}
						class={segmentClass(verdict === v.id)}
					>
						{v.label}
					</button>
				{/each}
			</div>
			<button type="button" class={buttonClass('primary', 'sm')} onclick={submit}>Submit review</button>
		</div>
	</footer>
</article>
