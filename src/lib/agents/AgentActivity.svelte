<script lang="ts">
	import AgentDisclosure from './AgentDisclosure.svelte';
	import ThinkingShimmer from './ThinkingShimmer.svelte';
	import { summarizeActivity } from '../state/chat-helpers';
	import type { ActivityItem, ActivityStatus } from '../types';

	interface Props {
		items: ActivityItem[];
		status?: ActivityStatus;
		title?: string;
		durationSeconds?: number;
		defaultOpen?: boolean;
		class?: string;
	}

	let {
		items,
		status = 'complete',
		title,
		durationSeconds,
		defaultOpen = true,
		class: className = ''
	}: Props = $props();

	let isOpen = $state(true);

	$effect(() => {
		isOpen = defaultOpen;
	});

	let resolvedTitle = $derived(summarizeActivity(items, status, durationSeconds, title));
	let errorCount = $derived(
		items.filter((item) => 'status' in item && item.status === 'error').length
	);
	let panelId = $derived(`agent-activity-${items[0]?.id ?? 'panel'}`);
</script>

<div
	data-state={status}
	aria-busy={status === 'working'}
	class="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm {className}"
>
	<button
		type="button"
		aria-expanded={isOpen}
		aria-controls={panelId}
		onclick={() => (isOpen = !isOpen)}
		class="group flex w-full items-center gap-2 text-left text-fg-light outline-none transition-colors hover:text-fg-main"
	>
		<span
			aria-hidden="true"
			class="inline-flex size-4 shrink-0 items-center justify-center rounded text-xs font-mono {status ===
			'working'
				? 'bg-accent-subtle text-accent-primary'
				: 'bg-canvas-secondary text-fg-light'}"
		>
			{status === 'working' ? '◎' : '✦'}
		</span>

		<span class="font-medium text-fg-main">
			{#if status === 'working'}
				<ThinkingShimmer label="{resolvedTitle}…" />
			{:else}
				{resolvedTitle}
			{/if}
		</span>

		{#if errorCount > 0}
			<span
				class="rounded-full bg-status-danger-subtle px-2 py-0.5 text-xs font-medium text-status-danger"
			>
				{errorCount} {errorCount === 1 ? 'error' : 'errors'}
			</span>
		{/if}

		<span class="ml-auto font-mono text-xs text-fg-light">
			{items.length} {items.length === 1 ? 'entry' : 'entries'}
		</span>

		<span
			aria-hidden="true"
			class="text-xs text-fg-light transition-transform duration-150 {isOpen ? 'rotate-180' : ''}"
		>
			▾
		</span>
	</button>

	<AgentDisclosure id={panelId} open={isOpen}>
		<ol class="mt-2 space-y-1.5 border-l-2 border-canvas-border pl-3">
			{#each items as item (item.id)}
				<li class="flex items-start gap-2 text-xs leading-5">
					{#if item.type === 'text'}
						<span aria-hidden="true" class="mt-0.5 font-mono text-fg-light">⋯</span>
						<p class="text-fg-light">{item.label}</p>
					{:else}
						<span
							aria-hidden="true"
							class="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded font-mono text-[10px] {item.status ===
							'error'
								? 'bg-status-danger-subtle text-status-danger'
								: item.status === 'running'
									? 'bg-accent-subtle text-accent-primary'
									: 'bg-status-success-subtle text-status-success'}"
						>
							{item.status === 'error' ? '!' : item.status === 'running' ? '↻' : '✓'}
						</span>

						<div class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
							<span class="font-medium text-fg-main">{item.label}</span>
							{#if item.target}
								<code
									class="truncate rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px] text-fg-main"
								>
									{item.target}
								</code>
							{/if}
							{#if item.type === 'tool' && (item.additions !== undefined || item.deletions !== undefined)}
								<span class="inline-flex items-center gap-1 font-mono text-[11px] tabular-nums">
									{#if item.additions !== undefined}
										<span class="text-diff-add-fg">+{item.additions}</span>
									{/if}
									{#if item.deletions !== undefined}
										<span class="text-diff-del-fg">-{item.deletions}</span>
									{/if}
								</span>
							{/if}
							{#if item.meta}
								<span class="text-fg-light">· {item.meta}</span>
							{/if}
						</div>
					{/if}
				</li>
			{/each}
		</ol>
	</AgentDisclosure>
</div>
