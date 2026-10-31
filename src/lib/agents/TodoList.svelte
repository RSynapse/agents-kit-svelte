<script lang="ts">
	import { buttonClass } from '../ui/styles';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { ChevronDown, CircleCheck, ListTodo } from '@lucide/svelte';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { fade, scale } from 'svelte/transition';
	import AgentDisclosure from './AgentDisclosure.svelte';
	import ThinkingShimmer from './ThinkingShimmer.svelte';
	import { summarizeTodos } from '../state/chat-helpers';
	import { motionDuration, rise } from '../state/motion.svelte';
	import type { TodoItem } from '../types';

	interface Props {
		title?: string;
		items: TodoItem[];
		defaultOpen?: boolean;
		class?: string;
	}

	let {
		title = 'Implementation plan',
		items,
		defaultOpen = true,
		class: className = ''
	}: Props = $props();

	let isOpen = $state(true);

	$effect(() => {
		isOpen = defaultOpen;
	});

	let summary = $derived(summarizeTodos(items));
	let panelId = $derived(`todo-list-${items[0]?.id ?? 'panel'}`);
	let completionRatio = $derived(
		summary.totalCount > 0 ? Math.round((summary.completedCount / summary.totalCount) * 100) : 0
	);

	const progressTween = new Tween(0, { duration: 280, easing: cubicOut });

	$effect(() => {
		void progressTween.set(completionRatio, {
			duration: prefersReducedMotion.current ? 0 : 280
		});
	});
</script>

<div class="w-full overflow-hidden rounded-card border border-card-border bg-card-bg text-sm {className}">
	<button
		type="button"
		aria-expanded={isOpen}
		aria-controls={panelId}
		onclick={() => (isOpen = !isOpen)}
		class="group flex h-11 w-full items-center gap-2.5 px-3.5 text-left text-fg-light outline-none transition-colors hover:text-fg-main"
	>
		{#key summary.allCompleted}
			<span
				in:fade={{ duration: motionDuration(140) }}
				aria-hidden="true"
				class="inline-flex size-4 shrink-0 items-center justify-center {summary.allCompleted
					? 'text-status-success'
					: 'text-fg-light group-hover:text-fg-main'}"
			>
				{#if summary.allCompleted}
					<CircleCheck class="size-4" />
				{:else}
					<ListTodo class="size-4" />
				{/if}
			</span>
		{/key}

		<span class="font-medium text-fg-main">{title}</span>

		{#if summary.inProgressItem && !isOpen}
			<span
				in:fade={{ duration: motionDuration(140) }}
				class="min-w-0 flex-1 truncate text-xs text-fg-light"
			>
				· {summary.inProgressItem.label}
			</span>
		{/if}

		<span class="ml-auto font-mono text-xs tabular-nums text-fg-light">
			{summary.completedCount}/{summary.totalCount}
		</span>

		<ChevronDown
			aria-hidden="true"
			class="size-3.5 shrink-0 text-fg-light transition-transform duration-200 group-hover:text-fg-main {isOpen
				? 'rotate-180'
				: ''}"
		/>
	</button>

	<!-- Svelte 5 Tween progress bar -->
	<div class="h-px w-full overflow-hidden bg-canvas-border">
		<div
			class="h-full transition-colors {summary.allCompleted
				? 'bg-status-success'
				: 'bg-accent-primary'}"
			style="width: {progressTween.current}%;"
		></div>
	</div>

	<AgentDisclosure id={panelId} open={isOpen}>
		<ol class="space-y-0.5 border-t border-canvas-border px-2 py-2">
			{#each items as item (item.id)}
				<li
					animate:flip={{ duration: motionDuration(220), easing: cubicOut }}
					in:rise
					class="flex min-h-9 items-start gap-2.5 rounded-md px-1.5 py-1 text-sm leading-5 transition-colors {item.status ===
					'in-progress'
						? 'bg-canvas-secondary/60'
						: ''}"
				>
					{#key item.status}
						<svg
							in:scale={{ start: 0.9, opacity: 0, duration: motionDuration(140), easing: cubicOut }}
							aria-hidden="true"
							viewBox="0 0 20 20"
							fill="none"
							class="size-5 shrink-0"
						>
							{#if item.status === 'pending'}
								<circle
									cx="10"
									cy="10"
									r="7"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-dasharray="2 3"
									stroke-linecap="round"
									class="text-fg-light/60"
								/>
							{:else if item.status === 'in-progress'}
								<circle
									cx="10"
									cy="10"
									r="7"
									stroke="currentColor"
									stroke-width="1.5"
									class="text-accent-primary/25"
								/>
								<circle
									cx="10"
									cy="10"
									r="7"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-dasharray="12 32"
									class="origin-center animate-spin text-accent-primary"
								/>
							{:else if item.status === 'completed'}
								<circle cx="10" cy="10" r="7" class="fill-fg-main" />
								<path
									d="M7 10.25L9 12.25L13.25 7.75"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-fg-inverse"
								/>
							{:else}
								<circle
									cx="10"
									cy="10"
									r="7"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-dasharray="2 3"
									stroke-linecap="round"
									class="text-fg-light/50"
								/>
								<path
									d="M7.5 12.5L12.5 7.5"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									class="text-fg-light"
								/>
							{/if}
						</svg>
					{/key}

					<div class="min-w-0 flex-1">
						<span
							class="block transition-colors {item.status === 'completed' ||
							item.status === 'cancelled'
								? 'line-through text-fg-light'
								: 'text-fg-main'}"
						>
							{#if item.status === 'in-progress'}
								<ThinkingShimmer label={item.label} />
							{:else}
								{item.label}
							{/if}
						</span>
						{#if item.detail}
							<span class="mt-0.5 block text-xs text-fg-light">{item.detail}</span>
						{/if}
					</div>
				</li>
			{/each}
		</ol>
	</AgentDisclosure>
</div>
