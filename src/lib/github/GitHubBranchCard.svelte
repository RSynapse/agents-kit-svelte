<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { ArrowDown, ArrowUp, Check, Circle, FolderGit2, GitBranch, GitCompare, ShieldCheck } from '@lucide/svelte';
	import { flip } from 'svelte/animate';
	import { motionDuration, rise } from '../state/motion.svelte';
	import { badgeClass, buttonClass } from '../ui/styles';
	import type { GitHubBranchData } from '../types';
	import { LiveLoop } from './live-loop.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'branch' | 'live' | 'onOpenWorktree' | 'onCompare'> {
		branch: GitHubBranchData;
		/** Demo mode: plays branch creation and commits landing one by one, then loops. Off by default. */
		live?: boolean;
		onOpenWorktree?: (branch: string) => void;
		onCompare?: (branch: string, base: string) => void;
		class?: string;
	}

	let { branch, live = false, onOpenWorktree, onCompare, class: className = '', ...rest }: Props = $props();

	const loop = new LiveLoop(() => branch.commits.length + 1, 4);
	let worktreeOpen = $state(false);

	$effect(() => {
		if (!live) return;
		return loop.start(1000);
	});

	const step = $derived(live ? loop.step : loop.total);
	const created = $derived(step >= 1);
	const landed = $derived([...branch.commits.slice(0, Math.max(0, step - 1))].reverse());
</script>

<article {...rest} class="overflow-hidden rounded-card border border-card-border bg-card-bg text-sm {className}">
	<header class="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border px-4 py-3">
		<div class="flex min-w-0 items-center gap-2">
			<GitBranch aria-hidden="true" class="size-4 shrink-0 text-accent-primary" />
			<code class="truncate font-mono text-[13px] font-semibold text-fg-main">{branch.name}</code>
		</div>
		{#if created}
			<span class={badgeClass('success')} in:rise>Created from {branch.base} @ {branch.baseSha}</span>
		{:else}
			<span class={badgeClass('neutral')}><span class="ak-shimmer-text">Creating branch…</span></span>
		{/if}
	</header>

	<div class="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto]">
		<div class="min-w-0">
			<div class="flex flex-wrap items-center gap-3 text-xs text-fg-light">
				<span class="inline-flex items-center gap-1 font-mono tabular-nums">
					<ArrowUp aria-hidden="true" class="size-3 text-status-success" />{landed.length} ahead
				</span>
				<span class="inline-flex items-center gap-1 font-mono tabular-nums">
					<ArrowDown aria-hidden="true" class="size-3" />{branch.behind} behind
				</span>
				{#if branch.linkedIssueNumber}
					<span>Closes <strong class="font-medium text-fg-main">#{branch.linkedIssueNumber}</strong></span>
				{/if}
			</div>

			<!-- Commit rail: newest first -->
			<ol class="relative mt-3 space-y-0 border-l border-canvas-border pl-4" aria-label="Commits on {branch.name}">
				{#each landed as commit (commit.sha)}
					<li class="relative py-1.5" animate:flip={{ duration: motionDuration(220) }} in:rise>
						<span aria-hidden="true" class="absolute top-2.5 -left-[21px] size-2.5 rounded-full border-2 border-card-bg bg-accent-primary"></span>
						<p class="truncate text-xs font-medium text-fg-main">{commit.message}</p>
						<p class="font-mono text-[10px] text-fg-light">{commit.sha} · {commit.author}</p>
					</li>
				{/each}
				<li class="relative py-1.5">
					<span aria-hidden="true" class="absolute top-2.5 -left-[21px] size-2.5 rounded-full border-2 border-card-bg bg-fg-light/50"></span>
					<p class="text-xs text-fg-light">Branched from <code class="font-mono">{branch.base}</code> at {branch.baseSha}</p>
				</li>
			</ol>
		</div>

		<div class="rounded-control bg-canvas-secondary p-3 text-xs sm:w-52">
			<p class="mb-1.5 inline-flex items-center gap-1.5 font-medium text-fg-main">
				<ShieldCheck aria-hidden="true" class="size-3.5" />Branch rules
			</p>
			<ul class="space-y-1">
				{#each branch.protections as rule (rule.id)}
					<li class="flex items-center gap-1.5 {rule.satisfied ? 'text-fg-main' : 'text-fg-light'}">
						{#if rule.satisfied}
							<Check aria-hidden="true" class="size-3 text-status-success" strokeWidth={3} />
						{:else}
							<Circle aria-hidden="true" class="size-3" />
						{/if}
						{rule.label}
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<footer class="flex flex-wrap justify-end gap-1.5 border-t border-canvas-border px-4 py-2.5">
		<button type="button" class={buttonClass('ghost', 'sm')} onclick={() => onCompare?.(branch.name, branch.base)}>
			<GitCompare aria-hidden="true" />Compare
		</button>
		<button
			type="button"
			class={buttonClass('secondary', 'sm')}
			onclick={() => {
				loop.pause();
				worktreeOpen = true;
				onOpenWorktree?.(branch.name);
			}}
		>
			{#if worktreeOpen}<Check aria-hidden="true" />Worktree ready{:else}<FolderGit2 aria-hidden="true" />Open in worktree{/if}
		</button>
	</footer>
</article>
