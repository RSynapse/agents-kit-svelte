<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { ChevronDown, Pause, Play, RefreshCw, RotateCcw, SkipForward } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	export type WorkflowStepStatus = 'waiting' | 'running' | 'completed' | 'failed' | 'skipped';

	export interface WorkflowStep {
		id: string;
		number: number;
		title: string;
		agentName: string;
		gateDependency?: string;
		inputSummary: string;
		outputSummary: string;
		status: WorkflowStepStatus;
		duration?: string;
		tokens?: number;
	}

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'workflowName' | 'description' | 'steps' | 'currentStepId' | 'totalDuration' | 'totalTokens' | 'isRunning' | 'onStart' | 'onPause' | 'onRetryStep' | 'onSkipStep' | 'onReset'> {
		workflowName?: string;
		description?: string;
		steps?: WorkflowStep[];
		currentStepId?: string;
		totalDuration?: string;
		totalTokens?: number;
		isRunning?: boolean;
		onStart?: () => void;
		onPause?: () => void;
		onRetryStep?: (stepId: string) => void;
		onSkipStep?: (stepId: string) => void;
		onReset?: () => void;
		class?: string;
	}

	const defaultSteps: WorkflowStep[] = [
		{
			id: 'spec-align',
			number: 1,
			title: 'Spec & ADR Gate Check',
			agentName: 'Claude Code Planner',
			gateDependency: 'Requires approved spec in docs/superpowers/specs',
			inputSummary: 'Card 191 requirements & ENG-0001 boundaries',
			outputSummary: 'Verified zero forbidden runtime capabilities; test plan locked.',
			status: 'completed',
			duration: '48s',
			tokens: 3820
		},
		{
			id: 'red-green-tdd',
			number: 2,
			title: 'Red-Green Worktree Implementation',
			agentName: 'Claude Code Builder',
			gateDependency: 'Depends on Step 01 · Spec & ADR Gate Check',
			inputSummary: 'Locked test plan and worktree branch',
			outputSummary: 'All 12 unit tests passing in isolated worktree.',
			status: 'completed',
			duration: '2m 14s',
			tokens: 9410
		},
		{
			id: 'contract-export',
			number: 3,
			title: 'Contract Schema Export & Verification',
			agentName: 'Companion Verifier',
			gateDependency: 'Depends on Step 02 · Red-Green Worktree Implementation',
			inputSummary: 'Updated domain and contract TypeScript definitions',
			outputSummary: 'Running corepack pnpm contracts:export and schema checksum check…',
			status: 'running',
			duration: '34s',
			tokens: 2150
		},
		{
			id: 'referee-review',
			number: 4,
			title: 'Independent Referee Scorecard',
			agentName: 'Codex Referee',
			gateDependency: 'Depends on Step 03 · Contract Schema Export',
			inputSummary: 'Worktree diff and verification evidence log',
			outputSummary: '',
			status: 'waiting'
		}
	];

	let {
		workflowName = 'Sequential Stage-Gate Pipeline',
		description = 'Each stage validates its gate dependency before handing structured output to the next stage.',
		steps = defaultSteps,
		currentStepId = 'contract-export',
		totalDuration = '3m 36s',
		totalTokens = 15380,
		isRunning = true,
		onStart,
		onPause,
		onRetryStep,
		onSkipStep,
		onReset,
		class: className = '',
		...rest
	}: Props = $props();

	let localSteps = $state<WorkflowStep[]>([]);
	let selectedStepId = $state('contract-export');
	let localRunning = $state(true);

	$effect(() => {
		localSteps = steps.map((step) => ({ ...step }));
		selectedStepId = currentStepId;
		localRunning = isRunning;
	});

	let completedCount = $derived(
		localSteps.filter((step) => step.status === 'completed').length
	);

	/**
	 * Maps a workflow step status to a display label.
	 *
	 * @param status - Step execution status.
	 * @returns Human-readable status string.
	 */
	function getStepStatusLabel(status: WorkflowStepStatus): string {
		switch (status) {
			case 'running':
				return 'Running';
			case 'completed':
				return 'Complete';
			case 'failed':
				return 'Failed';
			case 'skipped':
				return 'Skipped';
			default:
				return 'Waiting';
		}
	}

	/**
	 * Maps a workflow step status to semantic badge classes.
	 *
	 * @param status - Step execution status.
	 * @returns Tailwind class string.
	 */
	function getStepStatusClasses(status: WorkflowStepStatus): string {
		switch (status) {
			case 'running':
				return 'bg-accent-subtle text-accent-primary';
			case 'completed':
				return 'bg-status-success-subtle text-status-success';
			case 'failed':
				return 'bg-status-danger-subtle text-status-danger';
			default:
				return 'bg-canvas-secondary text-fg-light';
		}
	}

	/**
	 * Toggles pipeline running state and invokes the corresponding callback.
	 */
	function handleToggleRun(): void {
		if (localRunning) {
			localRunning = false;
			onPause?.();
		} else {
			localRunning = true;
			onStart?.();
		}
	}

	/**
	 * Resets all steps to initial state and invokes the optional callback.
	 */
	function handleReset(): void {
		localSteps = steps.map((step) => ({ ...step }));
		onReset?.();
	}

	/**
	 * Retries a specific step and invokes the optional callback.
	 *
	 * @param stepId - Identifier of the step to retry.
	 */
	function handleRetryStep(stepId: string): void {
		localSteps = localSteps.map((step) =>
			step.id === stepId ? { ...step, status: 'running' } : step
		);
		onRetryStep?.(stepId);
	}

	/**
	 * Marks a step as skipped and advances to the next waiting step.
	 *
	 * @param stepId - Identifier of the step to skip.
	 */
	function handleSkipStep(stepId: string): void {
		localSteps = localSteps.map((step) =>
			step.id === stepId ? { ...step, status: 'skipped' } : step
		);
		onSkipStep?.(stepId);
	}
</script>

<section {...rest}
	aria-label="Sequential workflow pipeline"
	class="w-full overflow-hidden rounded-card border border-card-border bg-card-bg text-sm {className}"
>
	<header
		class="flex flex-col gap-3 border-b border-canvas-border p-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<p class="text-xs font-medium text-fg-light">Sequential Workflow</p>
			<h2 class="mt-0.5 text-base font-semibold text-fg-main">{workflowName}</h2>
			<p class="mt-0.5 text-xs text-fg-light">{description}</p>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={handleToggleRun}
				class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors {localRunning
					? 'border border-card-border bg-canvas-primary text-fg-main hover:bg-canvas-secondary'
					: 'bg-accent-primary text-fg-inverse'}"
			>
				{#if localRunning}<Pause aria-hidden="true" />Pause{:else}<Play aria-hidden="true" />Start{/if}
			</button>
			<button
				type="button"
				onclick={handleReset}
				class={buttonClass('secondary', 'md')}
			>
				<RotateCcw aria-hidden="true" />
				Reset
			</button>
		</div>
	</header>

	<ol class="divide-y divide-canvas-border">
		{#each localSteps as step, index (step.id)}
			{@const isSelected = selectedStepId === step.id}
			<li>
				<button
					type="button"
					aria-expanded={isSelected}
					onclick={() => (selectedStepId = isSelected ? '' : step.id)}
					class="grid w-full grid-cols-[2rem_1fr_auto] items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas-primary"
				>
					<span
						class="inline-flex size-6 items-center justify-center rounded-full bg-canvas-secondary font-mono text-xs font-medium tabular-nums text-fg-main"
					>
						{String(step.number || index + 1).padStart(2, '0')}
					</span>

					<span class="min-w-0">
						<span class="flex flex-wrap items-center gap-2">
							<strong class="font-medium text-fg-main">{step.title}</strong>
							<span class="text-xs text-fg-light">· {step.agentName}</span>
						</span>
						{#if step.gateDependency}
							<span class="mt-0.5 block font-mono text-[11px] text-fg-light">
								Gate: {step.gateDependency}
							</span>
						{/if}
					</span>

					<span class="flex items-center gap-2">
						{#if step.duration}
							<span class="font-mono text-xs tabular-nums text-fg-light">{step.duration}</span>
						{/if}
						<span
							class="rounded-chip px-1.5 py-px text-[11px] font-medium {getStepStatusClasses(
								step.status
							)}"
						>
							{getStepStatusLabel(step.status)}
						</span>
						<ChevronDown aria-hidden="true" class="size-3.5 transition-transform duration-200 {isSelected ? 'rotate-180' : ''}" />
					</span>
				</button>

				{#if isSelected}
					<div
						class="grid gap-3 border-t border-canvas-border px-4 py-3 text-xs sm:grid-cols-2"
					>
						<div>
							<p class="font-semibold text-fg-main">Stage Input</p>
							<p class="mt-1 text-fg-light">{step.inputSummary}</p>
						</div>
						<div>
							<p class="font-semibold text-fg-main">Stage Output</p>
							<p class="mt-1 text-fg-light">
								{step.outputSummary || 'Available once this stage completes.'}
							</p>
						</div>
						<div class="flex items-center gap-3 text-xs text-fg-light">
							{#if step.duration}
								<span>Duration: {step.duration}</span>
							{/if}
							{#if step.tokens !== undefined}
								<span>{step.tokens.toLocaleString()} tokens</span>
							{/if}
						</div>
						<div class="flex justify-end gap-2">
							<button
								type="button"
								onclick={() => handleRetryStep(step.id)}
								class={buttonClass('secondary', 'sm')}
							>
								<RefreshCw aria-hidden="true" />
								Retry stage
							</button>
							{#if step.status === 'waiting' || step.status === 'running'}
								<button
									type="button"
									onclick={() => handleSkipStep(step.id)}
									class={buttonClass('secondary', 'sm')}
								>
									<SkipForward aria-hidden="true" />
									Skip stage
								</button>
							{/if}
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ol>

	<footer
		class="flex flex-wrap items-center justify-between gap-3 border-t border-canvas-border px-4 py-3 text-xs text-fg-light"
	>
		<span>
			{completedCount} of {localSteps.length} stages complete
		</span>
		<span>{totalDuration} · {totalTokens.toLocaleString()} tokens</span>
	</footer>
</section>
