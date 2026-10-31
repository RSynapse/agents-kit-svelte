<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Check, ChevronDown, Play, RotateCcw, TriangleAlert } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	export type EvalCriterionStatus = 'pass' | 'warn' | 'fail';

	export interface EvalCriterion {
		label: string;
		score: number;
		maxScore: number;
		weight?: number;
		status?: EvalCriterionStatus;
		note?: string;
	}

	export interface EvalIteration {
		id: string;
		number: number;
		output: string;
		score: number;
		feedback: string;
		criteria: EvalCriterion[];
		status: 'passed' | 'warning' | 'failed';
	}

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'taskDescription' | 'iterations' | 'currentIteration' | 'qualityThreshold' | 'maxIterations' | 'isRunning' | 'onRunNext' | 'onAccept' | 'onReset' | 'onAdjustThreshold'> {
		taskDescription?: string;
		iterations?: EvalIteration[];
		currentIteration?: number;
		qualityThreshold?: number;
		maxIterations?: number;
		isRunning?: boolean;
		onRunNext?: () => void;
		onAccept?: () => void;
		onReset?: () => void;
		onAdjustThreshold?: (threshold: number) => void;
		class?: string;
	}

	let {
		taskDescription,
		iterations = [],
		currentIteration,
		qualityThreshold = 85,
		maxIterations = 4,
		isRunning = false,
		onRunNext,
		onAccept,
		onReset,
		onAdjustThreshold,
		class: className = '',
		...rest
	}: Props = $props();

	let localThreshold = $state(85);
	let openIterationId = $state<string | undefined>(undefined);
	let accepted = $state(false);

	$effect(() => {
		localThreshold = qualityThreshold;
		openIterationId = iterations.at(-1)?.id;
	});

	let latest = $derived(iterations.at(-1));
	let passed = $derived(Boolean(latest && latest.score >= localThreshold));

	/**
	 * Determines the semantic status of an evaluation criterion.
	 *
	 * @param criterion - Rubric criterion item.
	 * @returns Resolved `'pass' | 'warn' | 'fail'` status.
	 */
	function resolveCriterionStatus(criterion: EvalCriterion): EvalCriterionStatus {
		if (criterion.status) {
			return criterion.status;
		}
		const ratio = criterion.maxScore > 0 ? (criterion.score / criterion.maxScore) * 100 : 0;
		if (ratio >= 85) return 'pass';
		if (ratio >= 65) return 'warn';
		return 'fail';
	}

	/**
	 * Maps a criterion status to semantic badge classes.
	 *
	 * @param status - Criterion status value.
	 * @returns Tailwind class string.
	 */
	function getCriterionBadgeClasses(status: EvalCriterionStatus): string {
		switch (status) {
			case 'pass':
				return 'bg-status-success-subtle text-status-success';
			case 'warn':
				return 'bg-status-warning-subtle text-status-warning';
			case 'fail':
				return 'bg-status-danger-subtle text-status-danger';
		}
	}

	/**
	 * Updates the quality threshold slider and notifies the optional callback.
	 *
	 * @param event - Native input event from the range control.
	 */
	function handleThresholdInput(event: Event): void {
		const target = event.currentTarget as HTMLInputElement;
		const nextValue = Number(target.value);
		localThreshold = nextValue;
		onAdjustThreshold?.(nextValue);
	}

	/**
	 * Accepts the evaluation result and invokes the optional callback.
	 */
	function handleAccept(): void {
		accepted = true;
		onAccept?.();
	}

	/**
	 * Resets the accepted flag and invokes the optional reset callback.
	 */
	function handleReset(): void {
		accepted = false;
		onReset?.();
	}
</script>

<section {...rest}
	aria-label="Referee evaluation scorecard"
	class={cn('w-full overflow-hidden rounded-card border border-card-border bg-card-bg text-sm', className)}
>
	<header
		class="flex flex-col gap-3 border-b border-canvas-border p-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<div class="flex flex-wrap items-center gap-2">
				<span
					class="rounded bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] font-medium text-fg-light"
				>
					Referee Scorecard
				</span>
				<span
					class="rounded-chip px-1.5 py-px text-[11px] font-medium {passed
						? 'bg-status-success-subtle text-status-success'
						: 'bg-status-warning-subtle text-status-warning'}"
				>
					{#if passed}<Check aria-hidden="true" />Gate Passed{:else}<TriangleAlert aria-hidden="true" />Send-Back / Below Threshold{/if}
				</span>
			</div>
			<h2 class="mt-1.5 text-base font-semibold text-fg-main">Rubric & Red-Team Evaluation</h2>
			{#if taskDescription}<p class="mt-0.5 text-xs text-fg-light">{taskDescription}</p>{/if}
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={handleReset}
				class={buttonClass('secondary', 'md')}
			>
				<RotateCcw aria-hidden="true" />
				Reset
			</button>
			{#if passed}
				<button
					type="button"
					onclick={handleAccept}
					class="rounded-lg bg-status-success px-3 py-1.5 text-xs font-medium text-fg-inverse transition-opacity hover:opacity-90"
				>
					{#if accepted}<Check aria-hidden="true" />Accepted{:else}<Check aria-hidden="true" />Accept Result{/if}
				</button>
			{:else}
				<button
					type="button"
					disabled={isRunning}
					onclick={() => onRunNext?.()}
					class={buttonClass('primary', 'md')}
				>
					<Play aria-hidden="true" />
					Run Next Attempt
				</button>
			{/if}
		</div>
	</header>

	{#if latest}
		<div class="grid gap-5 border-b border-canvas-border p-4 lg:grid-cols-[210px_1fr]">
			<div class="rounded-control bg-canvas-secondary/70 p-3.5">
				<p class="font-mono text-xs text-fg-light">Weighted Score</p>
				<p class="mt-1 font-mono text-3xl font-bold tabular-nums text-fg-main">
					{latest.score}
					<span class="text-xs font-normal text-fg-light">/ 100</span>
				</p>

				<div class="mt-4">
					<label
						for="eval-threshold-slider"
						class="flex items-center justify-between text-xs text-fg-light"
					>
						<span>Pass threshold</span>
						<span class="font-mono font-medium text-fg-main">{localThreshold}</span>
					</label>
					<input
						id="eval-threshold-slider"
						type="range"
						min="50"
						max="100"
						value={localThreshold}
						oninput={handleThresholdInput}
						class="mt-1.5 w-full accent-current text-accent-primary"
					/>
				</div>

				<p class="mt-3 font-mono text-[11px] text-fg-light">
					Attempt {currentIteration ?? latest.number} of {maxIterations}
				</p>
			</div>

			<div>
				<div class="rounded-control bg-canvas-secondary/70 p-3">
					<p class="text-xs font-semibold text-fg-main">Referee Verdict & Notes</p>
					<p class="mt-1 text-xs leading-relaxed text-fg-light">{latest.feedback}</p>
				</div>

				<div class="mt-3 space-y-2.5">
					{#each latest.criteria as criterion (criterion.label)}
						{@const status = resolveCriterionStatus(criterion)}
						{@const percent =
							criterion.maxScore > 0
								? Math.round((criterion.score / criterion.maxScore) * 100)
								: 0}
						<div class="rounded-control bg-canvas-secondary/70 p-2.5">
							<div class="flex flex-wrap items-center justify-between gap-2 text-xs">
								<div class="flex items-center gap-2">
									<span class="font-medium text-fg-main">{criterion.label}</span>
									{#if criterion.weight}
										<span class="font-mono text-[11px] text-fg-light">
											({criterion.weight}% weight)
										</span>
									{/if}
								</div>
								<div class="flex items-center gap-2">
									<span
										class="rounded-chip px-1.5 py-px text-[11px] font-medium capitalize {getCriterionBadgeClasses(
											status
										)}"
									>
										{status}
									</span>
									<span class="font-mono text-xs tabular-nums text-fg-main">
										{criterion.score}/{criterion.maxScore}
									</span>
								</div>
							</div>
							<div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas-secondary">
								<span
									class="block h-full rounded-full {status === 'pass'
										? 'bg-status-success'
										: status === 'warn'
											? 'bg-status-warning'
											: 'bg-status-danger'}"
									style="width: {percent}%;"
								></span>
							</div>
							{#if criterion.note}
								<p class="mt-1.5 text-[11px] text-fg-light">{criterion.note}</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<div class="p-4">
		<h3 class="text-xs font-semibold text-fg-main">Attempt History ({iterations.length})</h3>
		<div class="mt-2 divide-y divide-canvas-border rounded-lg border border-canvas-border">
			{#each iterations as item (item.id)}
				{@const isOpen = openIterationId === item.id}
				<div>
					<button
						type="button"
						aria-expanded={isOpen}
						onclick={() => (openIterationId = isOpen ? undefined : item.id)}
						class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors hover:bg-canvas-primary"
					>
						<span class="w-20 shrink-0 font-mono text-fg-light">Attempt {item.number}</span>
						<span class="min-w-0 flex-1 truncate text-fg-main">{item.output}</span>
						<span
							class="rounded-chip px-1.5 py-px font-mono text-[11px] font-semibold tabular-nums {item.score >=
							localThreshold
								? 'bg-status-success-subtle text-status-success'
								: 'bg-status-warning-subtle text-status-warning'}"
						>
							{item.score}/100
						</span>
						<ChevronDown aria-hidden="true" class="size-3.5 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
					</button>

					{#if isOpen}
						<div class="border-t border-canvas-border px-3 py-2.5 text-xs">
							<p class="font-medium text-fg-main">Summary</p>
							<p class="mt-0.5 text-fg-light">{item.output}</p>
							<p class="mt-2 font-medium text-fg-main">Referee Feedback</p>
							<p class="mt-0.5 text-fg-light">{item.feedback}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
