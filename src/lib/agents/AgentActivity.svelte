<script lang="ts">
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import AgentDisclosure from './AgentDisclosure.svelte';
	import ThinkingShimmer from './ThinkingShimmer.svelte';
	import { summarizeActivity } from '../state/chat-helpers';
	import { motionDuration } from '../state/motion.svelte';
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

	/**
	 * Determines which Lucide tool icon family to render for an activity row.
	 *
	 * @param item - Activity entry from the agent turn.
	 * @returns Icon key (`'read' | 'edit' | 'bash' | 'search' | 'web' | 'tool'`).
	 */
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

<div
	data-state={status}
	aria-busy={status === 'working'}
	class="w-full text-sm {className}"
>
	<button
		type="button"
		aria-expanded={isOpen}
		aria-controls={panelId}
		onclick={() => (isOpen = !isOpen)}
		class="group flex h-7 items-center gap-1.5 font-medium text-fg-light outline-none transition-colors hover:text-fg-main"
	>
		<span>
			{#if status === 'working'}
				<ThinkingShimmer label={resolvedTitle} />
			{:else}
				{resolvedTitle}
			{/if}
		</span>

		{#if errorCount > 0}
			<span
				class="inline-flex items-center gap-1 rounded-full bg-status-danger-subtle px-2 py-0.5 text-xs font-medium text-status-danger"
			>
				{errorCount} {errorCount === 1 ? 'error' : 'errors'}
			</span>
		{/if}

		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="size-4 shrink-0 text-fg-light transition-transform duration-150 group-hover:text-fg-main {isOpen
				? 'rotate-180'
				: ''}"
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	</button>

	<AgentDisclosure id={panelId} open={isOpen}>
		<ol class="mt-2 space-y-2.5 border-l border-canvas-border pl-3.5">
			{#each items as item (item.id)}
				<li
					animate:flip={{ duration: motionDuration(200), easing: cubicOut }}
					in:fly={{ y: 5, duration: motionDuration(170), easing: cubicOut }}
					class="text-sm leading-5"
				>
					{#if item.type === 'text'}
						<p class="leading-relaxed text-fg-light">{item.label}</p>
					{:else}
						{@const iconKind = resolveRowIcon(item)}
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
								{#if iconKind === 'read'}
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="size-4"
									>
										<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
										<path d="M14 2v4a2 2 0 0 0 2 2h4" />
										<path d="M10 9H8" />
										<path d="M16 13H8" />
										<path d="M16 17H8" />
									</svg>
								{:else if iconKind === 'edit'}
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="size-4"
									>
										<path d="M12 20h9" />
										<path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
									</svg>
								{:else if iconKind === 'bash'}
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="size-4"
									>
										<path d="m7 11 2-2-2-2" />
										<path d="M11 13h4" />
										<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
									</svg>
								{:else if iconKind === 'search'}
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="size-4"
									>
										<circle cx="11" cy="11" r="8" />
										<path d="m21 21-4.3-4.3" />
									</svg>
								{:else if iconKind === 'web'}
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="size-4"
									>
										<circle cx="12" cy="12" r="10" />
										<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
										<path d="M2 12h20" />
									</svg>
								{:else}
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="size-4"
									>
										<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
									</svg>
								{/if}
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
									class="inline-flex min-w-0 max-w-full items-center gap-2 rounded-lg bg-canvas-secondary px-2.5 py-1 font-mono text-xs text-fg-main"
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
