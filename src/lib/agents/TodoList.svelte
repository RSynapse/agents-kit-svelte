<script lang="ts">
	import { flip } from 'svelte/animate';
	import { backOut, cubicOut } from 'svelte/easing';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { fly, scale } from 'svelte/transition';
	import AgentDisclosure from './AgentDisclosure.svelte';
	import { summarizeTodos } from '../state/chat-helpers';
	import { motionDuration, pressScale } from '../state/motion.svelte';
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

<div class="w-full rounded-lg border border-card-border bg-card-bg px-3 py-2.5 text-sm {className}">
	<button
		type="button"
		use:pressScale={0.99}
		aria-expanded={isOpen}
		aria-controls={panelId}
		onclick={() => (isOpen = !isOpen)}
		class="flex w-full items-center gap-2 text-left text-fg-light outline-none transition-colors hover:text-fg-main"
	>
		{#key summary.allCompleted}
			<span
				in:scale={{ start: 0.85, duration: motionDuration(180), easing: backOut }}
				aria-hidden="true"
				class="inline-flex size-4 shrink-0 items-center justify-center rounded text-xs font-mono {summary.allCompleted
					? 'bg-status-success-subtle text-status-success'
					: 'bg-accent-subtle text-accent-primary'}"
			>
				{summary.allCompleted ? '✓' : '☰'}
			</span>
		{/key}

		<span class="font-medium text-fg-main">{title}</span>

		{#if summary.inProgressItem && !isOpen}
			<span
				in:fly={{ x: -6, duration: motionDuration(160), easing: cubicOut }}
				class="truncate text-xs text-fg-light"
			>
				· {summary.inProgressItem.label}
			</span>
		{/if}

		<span
			class="ml-auto rounded-full bg-canvas-secondary px-2 py-0.5 font-mono text-xs tabular-nums text-fg-light"
		>
			{summary.completedCount}/{summary.totalCount}
		</span>

		<span
			aria-hidden="true"
			class="text-xs text-fg-light transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
		>
			▾
		</span>
	</button>

	<!-- Svelte 5 Tween progress bar -->
	<div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-canvas-secondary">
		<div
			class="h-full rounded-full transition-colors {summary.allCompleted
				? 'bg-status-success'
				: 'bg-accent-primary'}"
			style="width: {progressTween.current}%;"
		></div>
	</div>

	<AgentDisclosure id={panelId} open={isOpen}>
		<ol class="mt-2.5 space-y-1.5">
			{#each items as item (item.id)}
				<li
					animate:flip={{ duration: motionDuration(220), easing: cubicOut }}
					in:fly={{ y: 6, duration: motionDuration(180), easing: cubicOut }}
					class="flex items-start gap-2.5 rounded-md px-2 py-1 text-xs leading-5 transition-colors {item.status ===
					'in-progress'
						? 'bg-accent-subtle'
						: ''}"
				>
					{#key item.status}
						<span
							in:scale={{ start: 0.8, duration: motionDuration(160), easing: backOut }}
							aria-hidden="true"
							class="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full font-mono text-[10px] {item.status ===
							'completed'
								? 'bg-status-success-subtle text-status-success'
								: item.status === 'in-progress'
									? 'bg-accent-primary text-fg-inverse'
									: item.status === 'cancelled'
										? 'bg-canvas-secondary text-fg-light'
										: 'border border-card-border text-fg-light'}"
						>
							{#if item.status === 'completed'}
								✓
							{:else if item.status === 'in-progress'}
								↻
							{:else if item.status === 'cancelled'}
								✕
							{:else}
								·
							{/if}
						</span>
					{/key}

					<div class="min-w-0 flex-1">
						<span
							class="block transition-colors {item.status === 'completed' ||
							item.status === 'cancelled'
								? 'line-through text-fg-light'
								: 'font-medium text-fg-main'}"
						>
							{item.label}
						</span>
						{#if item.detail}
							<span class="block text-fg-light">{item.detail}</span>
						{/if}
					</div>
				</li>
			{/each}
		</ol>
	</AgentDisclosure>
</div>
