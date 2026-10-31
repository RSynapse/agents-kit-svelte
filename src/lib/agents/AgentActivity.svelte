<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { pillClass } from '../ui/styles';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { ChevronDown, FileText, Globe, Pencil, Search, SquareTerminal, Wrench } from '@lucide/svelte';
	import AgentDisclosure from './AgentDisclosure.svelte';
	import ThinkingShimmer from './ThinkingShimmer.svelte';
	import { summarizeActivity } from '../state/chat-helpers';
	import { motionDuration, rise } from '../state/motion.svelte';
	import type { ActivityItem, ActivityStatus } from '../types';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'items' | 'status' | 'title' | 'durationSeconds' | 'defaultOpen'> {
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
		class: className = '',
		...rest
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

	/**
	 * Determines which Lucide tool icon family to render for an activity row.
	 *
	 * @param item - Activity entry from the agent turn.
	 * @returns Icon key (`'read' | 'edit' | 'bash' | 'search' | 'web' | 'tool'`).
	 */
	const ROW_ICONS = {
		read: FileText,
		edit: Pencil,
		bash: SquareTerminal,
		search: Search,
		web: Globe,
		tool: Wrench
	} as const;

	function resolveRowIcon(item: ActivityItem): 'read' | 'edit' | 'bash' | 'search' | 'web' | 'tool' {
		if (item.type === 'search') return 'search';
		const lower = item.label.toLowerCase();
		if (lower.startsWith('read') || lower.includes('file') || lower.includes('view')) return 'read';
		if (lower.startsWith('edit') || lower.startsWith('write') || lower.startsWith('patch')) {
			return 'edit';
		}
		if (lower.startsWith('bash') || lower.startsWith('run') || lower.includes('cmd')) return 'bash';
		if (lower.includes('web') || lower.includes('fetch')) return 'web';
		return 'tool';
	}
</script>

<div {...rest}
	data-state={status}
	aria-busy={status === 'working'}
	class={cn('w-full text-sm', className)}
>
	<button
		type="button"
		aria-expanded={isOpen}
		aria-controls={panelId}
		onclick={() => (isOpen = !isOpen)}
		class={pillClass('ghost', 'sm', 'group')}
	>
		<span>
			{#if status === 'working'}
				<ThinkingShimmer label={resolvedTitle} spark />
			{:else}
				{resolvedTitle}
			{/if}
		</span>

		{#if errorCount > 0}
			<span
				class="inline-flex items-center gap-1 rounded-chip bg-status-danger-subtle px-1.5 py-px text-[11px] font-medium text-status-danger"
			>
				{errorCount} {errorCount === 1 ? 'error' : 'errors'}
			</span>
		{/if}

		<ChevronDown
			aria-hidden="true"
			class="size-3.5 shrink-0 text-fg-light transition-transform duration-200 group-hover:text-fg-main {isOpen
				? 'rotate-180'
				: ''}"
		/>
	</button>

	<AgentDisclosure id={panelId} open={isOpen}>
		<ol class="mt-2 space-y-2.5 border-l border-chat-border/70 pl-3.5">
			{#each items as item (item.id)}
				<li
					animate:flip={{ duration: motionDuration(200), easing: cubicOut }}
					in:rise
					class="text-sm leading-5"
				>
					{#if item.type === 'text'}
						<p class="leading-relaxed text-fg-light">{item.label}</p>
					{:else}
						{@const iconKind = resolveRowIcon(item)}
						{@const RowIcon = ROW_ICONS[iconKind]}
						{@const isRunning = item.status === 'running'}
						{@const isError = item.status === 'error'}
						<div class="flex min-w-0 flex-wrap items-center gap-2">
							<span
								aria-hidden="true"
								class="inline-flex size-4 shrink-0 items-center justify-center {isError
									? 'text-status-danger'
									: isRunning
										? 'text-accent-primary'
										: 'text-fg-light'}"
							>
								<RowIcon class="size-3.5" />
							</span>

							<span class="font-medium {isError ? 'text-status-danger' : 'text-fg-light'}">
								{#if isRunning}
									<ThinkingShimmer label={item.label} />
								{:else}
									{item.label}
								{/if}
							</span>

							{#if item.target}
								<span
									class="inline-flex min-w-0 max-w-full items-center gap-2 rounded-chip bg-chat-surface px-1.5 py-0.5 font-mono text-xs text-fg-main"
								>
									<span class="truncate">{item.target}</span>
									{#if item.type === 'tool' && (item.additions !== undefined || item.deletions !== undefined)}
										<span class="inline-flex shrink-0 items-center gap-1 font-sans text-xs font-medium tabular-nums">
											{#if item.additions !== undefined}
												<span class="text-diff-add-fg">+{item.additions}</span>
											{/if}
											{#if item.deletions !== undefined}
												<span class="text-diff-del-fg">−{item.deletions}</span>
											{/if}
										</span>
									{/if}
								</span>
							{/if}

							{#if item.meta}
								<span class="text-xs text-fg-light">{item.meta}</span>
							{/if}
						</div>
					{/if}
				</li>
			{/each}
		</ol>
	</AgentDisclosure>
</div>
