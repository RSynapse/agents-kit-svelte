<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { buttonClass } from '../ui/styles';
	import { Check, Sparkles } from '@lucide/svelte';
	export interface RecommendationOption {
		id: string;
		label: string;
		description?: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'title' | 'description' | 'summary' | 'confidence' | 'reasoning' | 'acceptLabel' | 'alternatives' | 'onAccept' | 'onSelectAlternative'> {
		title: string;
		description?: string;
		summary?: string;
		confidence?: number;
		reasoning?: string[];
		acceptLabel?: string;
		alternatives?: RecommendationOption[];
		onAccept?: () => void;
		onSelectAlternative?: (id: string) => void;
		class?: string;
	}

	let {
		title,
		description,
		summary,
		confidence,
		reasoning = [],
		acceptLabel = 'Accept recommendation',
		alternatives = [],
		onAccept,
		onSelectAlternative,
		class: className = '',
		...rest
	}: Props = $props();

	let accepted = $state(false);
	let selectedAlternativeId = $state<string | null>(null);

	/**
	 * Normalizes a confidence value (either 0..1 ratio or 0..100 integer) into a percentage integer.
	 *
	 * @param value - Confidence value to normalize.
	 * @returns Integer percentage between 0 and 100.
	 */
	function formatConfidencePercent(value: number): number {
		if (value <= 1) {
			return Math.round(value * 100);
		}
		return Math.round(Math.min(100, Math.max(0, value)));
	}

	/**
	 * Marks the primary recommendation as accepted and invokes the callback.
	 */
	function handleAccept(): void {
		accepted = true;
		selectedAlternativeId = null;
		onAccept?.();
	}

	/**
	 * Selects an alternative option and notifies the callback.
	 *
	 * @param id - Selected alternative option ID.
	 */
	function handleSelectAlternative(id: string): void {
		selectedAlternativeId = id;
		accepted = false;
		onSelectAlternative?.(id);
	}

	let resolvedBody = $derived(description ?? summary);
	let confidencePercent = $derived(
		confidence !== undefined ? formatConfidencePercent(confidence) : undefined
	);
</script>

<section {...rest}
	class="overflow-hidden rounded-card border border-card-border bg-card-bg text-fg-main {className}"
>
	<div class="flex items-start justify-between gap-3 border-b border-canvas-border px-4 py-3">
		<div class="space-y-1">
			<span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-accent-primary">
				<Sparkles aria-hidden="true" class="size-3.5" />
				Recommended Strategy
			</span>
			<h3 class="text-sm font-medium text-fg-main">{title}</h3>
		</div>

		{#if confidencePercent !== undefined}
			<span
				class="shrink-0 rounded-full bg-status-success-subtle px-2.5 py-0.5 font-mono text-xs font-medium text-status-success tabular-nums"
			>
				{confidencePercent}% confidence
			</span>
		{/if}
	</div>

	<div class="p-4">
		{#if resolvedBody}
			<p class="text-xs leading-relaxed text-fg-light">{resolvedBody}</p>
		{/if}

		{#if reasoning.length > 0}
			<ul class="mt-3 space-y-1.5 border-l-2 border-accent-primary/60 pl-3 text-xs text-fg-main">
				{#each reasoning as point (point)}
					<li class="leading-relaxed">{point}</li>
				{/each}
			</ul>
		{/if}

		{#if alternatives.length > 0}
			<div class="mt-4 divide-y divide-canvas-border overflow-hidden rounded-lg border border-card-border">
				{#each alternatives as option (option.id)}
					{@const isSelected = selectedAlternativeId === option.id}
					<button
						type="button"
						onclick={() => handleSelectAlternative(option.id)}
						class="flex min-h-10 w-full flex-col items-start justify-center px-3 py-2 text-left transition-colors {isSelected
							? 'bg-accent-subtle/60 text-accent-primary'
							: 'bg-canvas-secondary/30 hover:bg-canvas-secondary'}"
					>
						<span class="text-xs font-medium text-fg-main">{option.label}</span>
						{#if option.description}
							<span class="mt-0.5 block text-[11px] text-fg-light">{option.description}</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex items-center justify-between gap-3 border-t border-canvas-border bg-canvas-secondary/40 px-4 py-2.5">
		<span class="inline-flex items-center gap-1.5 text-xs text-fg-light">
			{#if accepted}
				<Check aria-hidden="true" class="size-3.5 text-status-success" />
				<span>Recommendation accepted</span>
			{:else if selectedAlternativeId}
				<span>Selected alternative: {selectedAlternativeId}</span>
			{:else}
				<span>Ready to apply</span>
			{/if}
		</span>

		<button
			type="button"
			onclick={handleAccept}
			class={buttonClass('primary', 'md')}
		>
			{accepted ? 'Accepted' : acceptLabel}
		</button>
	</div>
</section>
