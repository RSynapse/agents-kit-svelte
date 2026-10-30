<script lang="ts">
	import type { ApprovalCardAnswers, ApprovalQuestion } from '../types';

	interface Props {
		title: string;
		description?: string;
		questions: ApprovalQuestion[];
		submitLabel?: string;
		onSubmit?: (answers: ApprovalCardAnswers) => void;
		onCancel?: () => void;
		class?: string;
	}

	let {
		title,
		description,
		questions,
		submitLabel = 'Submit decision',
		onSubmit,
		onCancel,
		class: className = ''
	}: Props = $props();

	let currentStep = $state(0);
	let answers = $state<ApprovalCardAnswers>({});
	let customText = $state<Record<string, string>>({});
	let submitted = $state(false);
	let ready = $state(false);

	$effect(() => {
		ready = true;
	});

	let activeQuestion = $derived(questions[currentStep]);
	let currentSelected = $derived(
		activeQuestion ? (answers[activeQuestion.id] ?? []) : []
	);
	let currentCustom = $derived(
		activeQuestion ? (customText[activeQuestion.id] ?? '').trim() : ''
	);
	let canAdvance = $derived(
		!activeQuestion ||
			activeQuestion.required === false ||
			currentSelected.length > 0 ||
			currentCustom.length > 0
	);

	/**
	 * Toggles an option for the active question (radio single-select or checkbox multi-select).
	 *
	 * @param optionLabel - Option label to toggle.
	 */
	function selectOption(optionLabel: string): void {
		if (!activeQuestion || submitted) return;
		const qId = activeQuestion.id;
		if (activeQuestion.multiple) {
			const existing = answers[qId] ?? [];
			const next = existing.includes(optionLabel)
				? existing.filter((item) => item !== optionLabel)
				: [...existing, optionLabel];
			answers = { ...answers, [qId]: next };
		} else {
			answers = { ...answers, [qId]: [optionLabel] };
		}
	}

	/**
	 * Advances to the next question or finalizes the multi-step approval decision.
	 */
	function handleNextOrSubmit(): void {
		if (!activeQuestion || !canAdvance) return;
		const qId = activeQuestion.id;
		const merged = [...(answers[qId] ?? [])];
		if (currentCustom && !merged.includes(currentCustom)) {
			merged.push(currentCustom);
		}
		const updatedAnswers = { ...answers, [qId]: merged };
		answers = updatedAnswers;

		if (currentStep < questions.length - 1) {
			currentStep += 1;
		} else {
			submitted = true;
			onSubmit?.(updatedAnswers);
		}
	}
</script>

<div
	role="region"
	aria-label={title}
	class="w-full overflow-hidden rounded-lg border border-card-border bg-card-bg p-3.5 text-sm {className}"
>
	<div class="flex items-start justify-between gap-2">
		<div>
			<div class="flex items-center gap-2">
				<span
					class="inline-flex items-center rounded-full bg-accent-subtle px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent-primary"
				>
					Decision needed
				</span>
				{#if questions.length > 1 && !submitted}
					<span class="font-mono text-xs tabular-nums text-fg-light">
						Step {currentStep + 1} of {questions.length}
					</span>
				{/if}
			</div>
			<h4 class="mt-1.5 font-semibold text-fg-main">{title}</h4>
			{#if description}
				<p class="mt-0.5 text-xs text-fg-light">{description}</p>
			{/if}
		</div>
	</div>

	{#if submitted}
		<div
			role="status"
			aria-live="polite"
			class="mt-3 rounded-md border border-card-border bg-status-success-subtle px-3 py-2 text-xs text-status-success"
		>
			<p class="font-semibold">
				Decision recorded: {Object.values(answers)
					.flat()
					.join(' · ')}
			</p>
		</div>
	{:else if activeQuestion}
		<div class="mt-3 space-y-2">
			<p class="text-xs font-medium text-fg-main">{activeQuestion.question}</p>

			<div
				role={activeQuestion.multiple ? 'group' : 'radiogroup'}
				aria-label={activeQuestion.question}
				class="grid gap-1.5"
			>
				{#each activeQuestion.options as option, idx (option.id)}
					{@const isSelected = currentSelected.includes(option.label)}
					<button
						type="button"
						role={activeQuestion.multiple ? 'checkbox' : 'radio'}
						aria-checked={isSelected}
						disabled={!ready}
						onclick={() => selectOption(option.label)}
						class="flex w-full items-start gap-2.5 rounded-md border px-3 py-2 text-left text-xs transition-colors {isSelected
							? 'border-accent-primary bg-accent-subtle text-fg-main'
							: 'border-card-border bg-canvas-primary text-fg-main hover:bg-canvas-secondary'}"
					>
						<span
							aria-hidden="true"
							class="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded border font-mono text-[10px] {isSelected
								? 'border-accent-primary bg-accent-primary text-fg-inverse'
								: 'border-card-border bg-card-bg text-fg-light'}"
						>
							{isSelected ? '✓' : idx + 1}
						</span>
						<span class="min-w-0 flex-1">
							<span class="block font-medium text-fg-main">{option.label}</span>
							{#if option.description}
								<span class="mt-0.5 block text-fg-light">{option.description}</span>
							{/if}
						</span>
					</button>
				{/each}
			</div>

			{#if activeQuestion.allowCustom}
				<div class="pt-1">
					<label class="block text-xs text-fg-light">
						<span class="sr-only">Custom response</span>
						<input
							type="text"
							placeholder={activeQuestion.customPlaceholder ?? 'Or type custom guidance…'}
							value={customText[activeQuestion.id] ?? ''}
							oninput={(e) => {
								const target = e.currentTarget as HTMLInputElement;
								customText = { ...customText, [activeQuestion.id]: target.value };
							}}
							class="w-full rounded-md border border-card-border bg-canvas-primary px-2.5 py-1.5 text-xs text-fg-main placeholder:text-fg-light focus:border-accent-primary focus:outline-none"
						/>
					</label>
				</div>
			{/if}

			<div class="flex items-center justify-between gap-2 pt-2">
				<div class="flex items-center gap-1.5">
					{#if currentStep > 0}
						<button
							type="button"
							onclick={() => (currentStep -= 1)}
							class="rounded-md border border-card-border bg-canvas-secondary px-2.5 py-1 text-xs font-medium text-fg-main hover:bg-canvas-primary"
						>
							Back
						</button>
					{/if}
					{#if onCancel}
						<button
							type="button"
							onclick={onCancel}
							class="rounded-md px-2 py-1 text-xs font-medium text-fg-light hover:text-fg-main"
						>
							Skip
						</button>
					{/if}
				</div>

				<button
					type="button"
					disabled={!canAdvance}
					onclick={handleNextOrSubmit}
					class="rounded-md bg-fg-main px-3 py-1.5 text-xs font-medium text-fg-inverse transition-opacity hover:opacity-90 disabled:opacity-40"
				>
					{currentStep < questions.length - 1 ? 'Next question' : submitLabel}
				</button>
			</div>
		</div>
	{/if}
</div>
