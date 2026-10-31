<script lang="ts">
	import { Check, ChevronDown, FileText, LoaderCircle, Settings, Sparkles } from '@lucide/svelte';
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';
	import ThinkingShimmer from '../agents/ThinkingShimmer.svelte';

	export type ChainStepStatus = 'complete' | 'active' | 'pending';

	export interface ChainOfThoughtStepItem {
		id: string;
		label: string;
		description?: string;
		durationMs?: number;
		confidence?: number;
		tools?: string[];
		sources?: string[];
		status: ChainStepStatus;
	}

	interface Props {
		title?: string;
		steps?: ChainOfThoughtStepItem[];
		defaultOpen?: boolean;
		isStreaming?: boolean;
		totalDurationMs?: number;
		class?: string;
	}

	const DEFAULT_STEPS: ChainOfThoughtStepItem[] = [
		{
			id: 'cot-1',
			label: 'Inspecting workspace contract and route boundaries',
			description: 'Verified read-only repository session rules and G0 stream schema.',
			durationMs: 420,
			confidence: 0.98,
			tools: ['read_file', 'grep_search'],
			sources: ['contracts/g0/schema', 'src/lib/types.ts'],
			status: 'complete'
		},
		{
			id: 'cot-2',
			label: 'Synthesizing Svelte 5 Runes state transition graph',
			description: 'Mapped controllable disclosure state and derived token counters.',
			durationMs: 890,
			confidence: 0.94,
			tools: ['ast_check', 'svelte_compile'],
			sources: ['src/lib/state/chat-helpers.ts'],
			status: 'complete'
		},
		{
			id: 'cot-3',
			label: 'Validating semantic CSS token contrast in dark and light themes',
			description: 'Checking OKLCH surface contrast ratios and reduced-motion fallbacks.',
			durationMs: 310,
			confidence: 0.91,
			tools: ['audit_tokens'],
			status: 'active'
		}
	];

	let {
		title = 'Chain of Thought Reasoning',
		steps = DEFAULT_STEPS,
		defaultOpen = true,
		isStreaming = false,
		totalDurationMs,
		class: className = ''
	}: Props = $props();

	let isOpen = $state(true);
	let expandedStepIds = $state<Record<string, boolean>>({});

	$effect(() => {
		isOpen = defaultOpen;
	});

	let computedDurationMs = $derived(
		totalDurationMs ?? steps.reduce((sum, step) => sum + (step.durationMs ?? 0), 0)
	);

	let averageConfidence = $derived.by(() => {
		const withConfidence = steps.filter((step) => typeof step.confidence === 'number');
		if (withConfidence.length === 0) return null;
		const sum = withConfidence.reduce((acc, step) => acc + (step.confidence ?? 0), 0);
		return Math.round((sum / withConfidence.length) * 100);
	});

	/**
	 * Formats milliseconds into a compact human-readable duration label.
	 *
	 * @param ms - Duration in milliseconds.
	 * @returns Formatted duration string (e.g. `420ms` or `1.6s`).
	 */
	function formatDuration(ms: number): string {
		if (ms >= 1000) {
			return `${(ms / 1000).toFixed(1)}s`;
		}
		return `${ms}ms`;
	}

	/**
	 * Checks whether a step's detail section is expanded.
	 *
	 * @param stepId - Unique step identifier.
	 * @returns True if expanded (defaults to true).
	 */
	function isStepExpanded(stepId: string): boolean {
		return expandedStepIds[stepId] ?? true;
	}

	/**
	 * Toggles detail visibility for a specific reasoning step.
	 *
	 * @param stepId - Unique step identifier.
	 */
	function toggleStep(stepId: string): void {
		expandedStepIds = {
			...expandedStepIds,
			[stepId]: !isStepExpanded(stepId)
		};
	}

	/**
	 * Maps confidence percentage to semantic badge classes.
	 *
	 * @param confidence - Confidence ratio between 0 and 1.
	 * @returns Semantic Tailwind classes for background and text.
	 */
	function getConfidenceStyle(confidence: number): string {
		// 0.9+ is high confidence; 0.75+ is moderate; below is warning
		if (confidence >= 0.9) {
			return 'bg-status-success-subtle text-status-success';
		}
		if (confidence >= 0.75) {
			return 'bg-accent-subtle text-accent-primary';
		}
		return 'bg-status-warning-subtle text-status-warning';
	}
</script>

<div class="w-full rounded-card border border-card-border bg-card-bg text-sm {className}">
	<button
		type="button"
		aria-expanded={isOpen}
		onclick={() => (isOpen = !isOpen)}
		class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas-secondary"
	>
		<div class="flex min-w-0 items-center gap-2.5">
			<span
				aria-hidden="true"
				class="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-subtle font-mono text-xs text-accent-primary"
			>
				<Sparkles aria-hidden="true" />
			</span>
			<span class="truncate font-medium text-fg-main">
				{#if isStreaming}
					<ThinkingShimmer label={title} />
				{:else}
					{title}
				{/if}
			</span>
			<span class="rounded-full bg-canvas-secondary px-2 py-0.5 font-mono text-xs text-fg-light">
				{steps.length} {steps.length === 1 ? 'step' : 'steps'}
			</span>
		</div>

		<div class="flex shrink-0 items-center gap-2.5">
			{#if averageConfidence !== null}
				<span
					class="rounded-full bg-status-success-subtle px-2 py-0.5 font-mono text-xs font-medium text-status-success"
				>
					{averageConfidence}% conf
				</span>
			{/if}
			<span class="font-mono text-xs tabular-nums text-fg-light">
				{formatDuration(computedDurationMs)}
			</span>
			<ChevronDown
				aria-hidden="true"
				class="size-3.5 text-fg-light transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
			/>
		</div>
	</button>

	<AgentDisclosure open={isOpen}>
		<div class="border-t border-canvas-border px-4 py-3">
			<ol class="space-y-3">
				{#each steps as step, index (step.id)}
					{@const stepOpen = isStepExpanded(step.id)}
					<li class="relative flex gap-3">
						<div class="flex flex-col items-center">
							<span
								aria-hidden="true"
								class="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums {step.status ===
								'active'
									? 'bg-accent-subtle text-accent-primary'
									: step.status === 'complete'
										? 'bg-status-success-subtle text-status-success'
										: 'bg-canvas-secondary text-fg-light'}"
							>
								{#if step.status === 'complete'}
									<Check class="size-3" />
								{:else if step.status === 'active'}
									<LoaderCircle class="size-3 animate-spin" />
								{:else}
									{index + 1}
								{/if}
							</span>
							{#if index < steps.length - 1}
								<div class="mt-1 w-px flex-1 bg-canvas-border"></div>
							{/if}
						</div>

						<div class="min-w-0 flex-1 pb-2">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<button
									type="button"
									aria-expanded={stepOpen}
									onclick={() => toggleStep(step.id)}
									class="text-left font-medium text-fg-main transition-colors hover:text-accent-primary"
								>
									{step.label}
								</button>

								<div class="flex items-center gap-1.5">
									{#if typeof step.confidence === 'number'}
										<span
											class="rounded px-1.5 py-0.5 font-mono text-[11px] font-medium {getConfidenceStyle(
												step.confidence
											)}"
										>
											{Math.round(step.confidence * 100)}%
										</span>
									{/if}
									{#if step.durationMs !== undefined}
										<span class="font-mono text-xs tabular-nums text-fg-light">
											{formatDuration(step.durationMs)}
										</span>
									{/if}
								</div>
							</div>

							{#if stepOpen}
								{#if step.description}
									<p class="mt-1 text-xs leading-relaxed text-fg-light">
										{step.description}
									</p>
								{/if}

								{#if (step.tools && step.tools.length > 0) || (step.sources && step.sources.length > 0)}
									<div class="mt-2 flex flex-wrap items-center gap-1.5">
										{#if step.tools}
											{#each step.tools as tool (tool)}
												<span
													class="inline-flex items-center gap-1 rounded border border-card-border bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] text-fg-main"
												>
													<Settings aria-hidden="true" />
													{tool}
												</span>
											{/each}
										{/if}
										{#if step.sources}
											{#each step.sources as source (source)}
												<span
													class="inline-flex items-center gap-1 rounded bg-accent-subtle px-2 py-0.5 font-mono text-[11px] text-accent-primary"
												>
													<FileText aria-hidden="true" />
													{source}
												</span>
											{/each}
										{/if}
									</div>
								{/if}
							{/if}
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</AgentDisclosure>
</div>
