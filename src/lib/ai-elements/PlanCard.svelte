<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Check, ChevronDown, LoaderCircle } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';
	import ThinkingShimmer from '../agents/ThinkingShimmer.svelte';
	import type { RiskTier } from '../types';

	export interface PlanMilestone {
		id: string;
		title: string;
		detail: string;
		files: string[];
		status: 'completed' | 'in-progress' | 'pending';
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'title' | 'description' | 'riskTier' | 'isStreaming' | 'milestones' | 'defaultOpen' | 'onApprove' | 'onRevise'> {
		title?: string;
		description?: string;
		riskTier?: RiskTier;
		isStreaming?: boolean;
		milestones?: PlanMilestone[];
		defaultOpen?: boolean;
		onApprove?: () => void;
		onRevise?: (note: string) => void;
		class?: string;
	}

	let {
		title = 'Plan',
		description,
		riskTier = 'T2',
		isStreaming = false,
		milestones = [],
		defaultOpen = true,
		onApprove,
		onRevise,
		class: className = '',
		...rest
	}: Props = $props();

	let isOpen = $state(true);
	let decision = $state<'pending' | 'approved' | 'revising'>('pending');
	let revisionNote = $state('');

	$effect(() => {
		isOpen = defaultOpen;
	});

	let completedCount = $derived(milestones.filter((m) => m.status === 'completed').length);

	/**
	 * Maps a Trailside risk tier (`T0`-`T4`) to semantic badge styles.
	 *
	 * @param tier - RiskTier value.
	 * @returns Tailwind semantic class string.
	 */
	function getRiskBadgeStyle(tier: RiskTier): string {
		switch (tier) {
			case 'T0':
			case 'T1':
				return 'bg-status-success-subtle text-status-success';
			case 'T2':
				return 'bg-accent-subtle text-accent-primary';
			case 'T3':
				return 'bg-status-warning-subtle text-status-warning';
			case 'T4':
				return 'bg-status-danger-subtle text-status-danger';
		}
	}

	/**
	 * Approves the execution plan and triggers the optional `onApprove` callback.
	 */
	function handleApprove(): void {
		decision = 'approved';
		onApprove?.();
	}

	/**
	 * Submits a revision request note and triggers the optional `onRevise` callback.
	 */
	function submitRevision(): void {
		onRevise?.(revisionNote.trim() || 'Requested milestone adjustments');
		decision = 'pending';
		revisionNote = '';
	}
</script>

<div {...rest} class={cn('w-full overflow-hidden rounded-card border border-card-border bg-card-bg text-sm', className)}>
	<div class="flex flex-wrap items-start justify-between gap-3 border-b border-canvas-border px-4 py-3.5">
		<div class="min-w-0 flex-1 space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<span
					class="rounded-md px-2 py-0.5 font-mono text-xs font-bold {getRiskBadgeStyle(riskTier)}"
				>
					Risk {riskTier}
				</span>
				<h3 class="font-semibold text-fg-main">
					{#if isStreaming}
						<ThinkingShimmer label={title} />
					{:else}
						{title}
					{/if}
				</h3>
			</div>
			<p class="text-xs text-fg-light">{description}</p>
		</div>

		<div class="flex items-center gap-2">
			<span class="rounded-full bg-canvas-secondary px-2.5 py-0.5 font-mono text-xs text-fg-light">
				{completedCount}/{milestones.length} milestones
			</span>
			<button
				type="button"
				aria-label="Toggle plan milestones"
				aria-expanded={isOpen}
				onclick={() => (isOpen = !isOpen)}
				class={buttonClass('secondary', 'icon-sm')}
			>
				<ChevronDown aria-hidden="true" class="transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
			</button>
		</div>
	</div>

	<AgentDisclosure open={isOpen}>
		<ol class="divide-y divide-canvas-border">
			{#each milestones as item, idx (item.id)}
				<li class="px-4 py-3">
					<div class="flex items-start gap-3">
						<span
							aria-hidden="true"
							class="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums {item.status ===
							'completed'
								? 'bg-status-success-subtle text-status-success'
								: item.status === 'in-progress'
									? 'bg-accent-subtle text-accent-primary'
									: 'bg-canvas-secondary text-fg-light'}"
						>
							{#if item.status === 'completed'}
								<Check class="size-3" />
							{:else if item.status === 'in-progress'}
								<LoaderCircle class="size-3 animate-spin" />
							{:else}
								{idx + 1}
							{/if}
						</span>

						<div class="min-w-0 flex-1 space-y-1.5">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<span class="font-medium text-fg-main">{item.title}</span>
								<span class="font-mono text-[11px] capitalize text-fg-light">{item.status}</span>
							</div>
							<p class="text-xs text-fg-light">{item.detail}</p>
							{#if item.files.length > 0}
								<div class="flex flex-wrap items-center gap-1.5 pt-0.5">
									{#each item.files as file (file)}
										<code
											class="rounded border border-card-border bg-canvas-primary px-2 py-0.5 font-mono text-[11px] text-fg-main"
										>
											{file}
										</code>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</li>
			{/each}
		</ol>

		<div class="flex flex-wrap items-center justify-between gap-2 border-t border-canvas-border px-4 py-3">
			{#if decision === 'approved'}
				<span
					class="inline-flex items-center gap-1.5 rounded-md bg-status-success-subtle px-3 py-1 font-mono text-xs font-medium text-status-success"
				>
					<Check aria-hidden="true" />
					Plan approved for execution
				</span>
				<button
					type="button"
					onclick={() => (decision = 'pending')}
					class={buttonClass('ghost', 'sm')}
				>
					Change decision
				</button>
			{:else if decision === 'revising'}
				<div class="flex w-full flex-wrap items-center gap-2">
					<input
						type="text"
						aria-label="Revision feedback"
						placeholder="Describe requested plan revisions..."
						bind:value={revisionNote}
						class="min-w-[200px] flex-1 rounded-md border border-card-border bg-card-bg px-3 py-1.5 text-xs text-fg-main outline-none focus:border-accent-primary"
					/>
					<button
						type="button"
						onclick={submitRevision}
						class={buttonClass('primary', 'md')}
					>
						Send Revision
					</button>
					<button
						type="button"
						onclick={() => (decision = 'pending')}
						class={buttonClass('secondary', 'md')}
					>
						Cancel
					</button>
				</div>
			{:else}
				<span class="text-xs text-fg-light">Ready for human review before worktree dispatch.</span>
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={() => (decision = 'revising')}
						class={buttonClass('secondary', 'md')}
					>
						Request Changes
					</button>
					<button
						type="button"
						onclick={handleApprove}
						class={buttonClass('primary', 'md')}
					>
						<Check aria-hidden="true" />
						Approve Plan
					</button>
				</div>
			{/if}
		</div>
	</AgentDisclosure>
</div>
