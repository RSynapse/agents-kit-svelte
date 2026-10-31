<script lang="ts">
	import { Check, RotateCcw } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';
	import type { GitHubCommitData } from '../types';

	interface Props {
		commit?: GitHubCommitData;
		defaultOpen?: boolean;
		onRestore?: (sha: string) => void;
		class?: string;
	}

	const DEFAULT_COMMIT: GitHubCommitData = {
		sha: 'cdb5ea5',
		message: 'fix(home): raise contrast of unpicked agents, skipped gates and secondary captions',
		author: 'argon-agent',
		timestamp: '12m ago',
		branch: 'argon/2151-home-faint-captions-contrast',
		verified: true,
		additions: 68,
		deletions: 14,
		files: [
			{
				path: 'apps/web/src/lib/home/trail.css',
				status: 'modified',
				additions: 12,
				deletions: 11
			},
			{
				path: 'apps/web/src/lib/home/route-map.css',
				status: 'modified',
				additions: 2,
				deletions: 3
			},
			{
				path: 'tests/browser/home.spec.ts',
				status: 'modified',
				additions: 54,
				deletions: 0
			}
		]
	};

	const COPY_FEEDBACK_MS = 1500;

	let {
		commit = DEFAULT_COMMIT,
		defaultOpen = true,
		onRestore,
		class: className = ''
	}: Props = $props();

	let isOpen = $state(true);
	let copied = $state(false);
	let restored = $state(false);

	$effect(() => {
		isOpen = defaultOpen;
	});

	/**
	 * Copies the commit SHA to the system clipboard.
	 */
	async function copySha(): Promise<void> {
		await navigator.clipboard?.writeText(commit.sha);
		copied = true;
		window.setTimeout(() => {
			copied = false;
		}, COPY_FEEDBACK_MS);
	}
</script>

<div class="rounded-xl border border-card-border bg-card-bg p-3.5 text-sm {className}">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex min-w-0 flex-1 items-center gap-2">
			<button
				type="button"
				aria-expanded={isOpen}
				onclick={() => (isOpen = !isOpen)}
				class="flex min-w-0 flex-1 items-center gap-2 text-left"
			>
				<span
					aria-hidden="true"
					class="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-subtle font-mono text-xs font-bold text-accent-primary"
				>
					⊙
				</span>
				<span class="truncate font-semibold text-fg-main">{commit.message}</span>
			</button>
		</div>

		<div class="flex items-center gap-1.5 font-mono text-xs">
			{#if commit.verified}
				<span
					class="rounded-full bg-status-success-subtle px-2 py-0.5 text-[10px] font-semibold text-status-success"
				>
					Verified
				</span>
			{/if}
			<button
				type="button"
				onclick={copySha}
				title="Copy commit SHA"
				class={buttonClass('secondary', 'sm')}
			>
				{copied ? '✓ Copied' : commit.sha}
			</button>
		</div>
	</div>

	<div class="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-fg-light">
		<span>
			Authored by <strong class="font-medium text-fg-main">{commit.author}</strong> · {commit.timestamp}
			on <code class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px]">{commit.branch}</code>
		</span>
		<span class="font-mono tabular-nums">
			<span class="text-diff-add-fg">+{commit.additions}</span>
			<span class="ml-1 text-diff-del-fg">-{commit.deletions}</span>
		</span>
	</div>

	<AgentDisclosure open={isOpen}>
		<ul class="mt-3 divide-y divide-canvas-border rounded-lg border border-card-border bg-canvas-primary font-mono text-xs">
			{#each commit.files as file (file.path)}
				<li class="flex items-center justify-between gap-2 px-3 py-1.5">
					<span class="flex min-w-0 items-center gap-2">
						<span
							class="inline-block size-4 rounded text-center text-[10px] font-bold {file.status ===
							'added'
								? 'bg-status-success-subtle text-status-success'
								: file.status === 'deleted'
									? 'bg-status-danger-subtle text-status-danger'
									: 'bg-accent-subtle text-accent-primary'}"
						>
							{file.status === 'added' ? 'A' : file.status === 'deleted' ? 'D' : 'M'}
						</span>
						<span class="truncate text-fg-main">{file.path}</span>
					</span>
					<span class="shrink-0 tabular-nums">
						<span class="text-diff-add-fg">+{file.additions}</span>
						<span class="ml-1 text-diff-del-fg">-{file.deletions}</span>
					</span>
				</li>
			{/each}
		</ul>

		<div class="mt-2.5 flex justify-end">
			<button
				type="button"
				onclick={() => {
					restored = true;
					onRestore?.(commit.sha);
				}}
				class={buttonClass('secondary', 'sm')}
			>
				{#if restored}<Check aria-hidden="true" />Checked out in worktree{:else}<RotateCcw aria-hidden="true" />Checkout commit in worktree{/if}
			</button>
		</div>
	</AgentDisclosure>
</div>
