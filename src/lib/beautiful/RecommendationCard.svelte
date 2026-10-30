<script lang="ts">
	export interface RecommendationOption {
		id: string;
		label: string;
		description?: string;
	}

	interface Props {
		title?: string;
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

	const DEFAULT_REASONING: string[] = [
		'Isolates database outbox writes and journal append inside a single transaction boundary.',
		'Preserves idempotency lookup before revision checks on retry attempts.',
		'Matches T2 referee verification rules with zero schema drift.'
	];

	const DEFAULT_ALTERNATIVES: RecommendationOption[] = [
		{
			id: 'alt-optimistic',
			label: 'Optimistic in-memory queue',
			description: 'Lower latency but requires manual replay on companion disconnect.'
		},
		{
			id: 'alt-polling',
			label: 'Periodic checkpoint polling',
			description: 'Simpler worker loop with higher idle read overhead.'
		}
	];

	let {
		title = 'Use atomic outbox + journal transaction for Run dispatch',
		description,
		summary = 'Ensures every dispatched workflow card records its state transition and companion payload atomically before notifying the worker stream.',
		confidence = 0.94,
		reasoning = DEFAULT_REASONING,
		acceptLabel = 'Accept recommendation',
		alternatives = DEFAULT_ALTERNATIVES,
		onAccept,
		onSelectAlternative,
		class: className = ''
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

<section
	class="rounded-xl border border-card-border bg-card-bg p-4 text-fg-main {className}"
>
	<div class="flex items-start justify-between gap-3">
		<div class="space-y-1">
			<span class="font-mono text-[10px] font-semibold tracking-wider text-accent-primary uppercase">
				Recommended Strategy
			</span>
			<h3 class="text-sm font-semibold text-fg-main">{title}</h3>
		</div>

		{#if confidencePercent !== undefined}
			<span
				class="shrink-0 rounded-full bg-status-success-subtle px-2.5 py-0.5 font-mono text-xs font-medium text-status-success tabular-nums"
			>
				{confidencePercent}% confidence
			</span>
		{/if}
	</div>

	{#if resolvedBody}
		<p class="mt-2 text-xs leading-5 text-fg-light">{resolvedBody}</p>
	{/if}

	{#if reasoning.length > 0}
		<ul class="mt-3 space-y-1.5 border-l-2 border-accent-primary pl-3 text-xs text-fg-main">
			{#each reasoning as point (point)}
				<li class="leading-5">{point}</li>
			{/each}
		</ul>
	{/if}

	{#if alternatives.length > 0}
		<div class="mt-4 divide-y divide-canvas-border border-y border-canvas-border">
			{#each alternatives as option (option.id)}
				{@const isSelected = selectedAlternativeId === option.id}
				<button
					type="button"
					onclick={() => handleSelectAlternative(option.id)}
					class="flex min-h-10 w-full flex-col items-start justify-center px-2 py-2 text-left transition-colors {isSelected
						? 'bg-accent-subtle text-accent-primary'
						: 'hover:bg-canvas-secondary'}"
				>
					<span class="text-xs font-medium text-fg-main">{option.label}</span>
					{#if option.description}
						<span class="mt-0.5 block text-[11px] text-fg-light">{option.description}</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<div class="mt-4 flex items-center justify-between gap-3">
		<span class="font-mono text-[11px] text-fg-light">
			{#if accepted}
				✓ Recommendation accepted
			{:else if selectedAlternativeId}
				Selected alternative: {selectedAlternativeId}
			{:else}
				Ready to apply
			{/if}
		</span>

		<button
			type="button"
			onclick={handleAccept}
			class="rounded-lg bg-accent-primary px-3.5 py-1.5 text-xs font-semibold text-fg-inverse transition-opacity hover:opacity-90"
		>
			{accepted ? 'Accepted' : acceptLabel}
		</button>
	</div>
</section>
