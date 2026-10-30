<script lang="ts">
	export type FormFieldType = 'text' | 'email' | 'select' | 'textarea' | 'number' | 'checkbox';

	export interface FormFieldValidation {
		minLength?: number;
		maxLength?: number;
		pattern?: string;
		min?: number;
		max?: number;
	}

	export interface FormField {
		id: string;
		label: string;
		type: FormFieldType;
		placeholder?: string;
		required?: boolean;
		options?: string[];
		defaultValue?: string | boolean | number;
		validation?: FormFieldValidation;
	}

	interface Props {
		formTitle?: string;
		formDescription?: string;
		fields?: FormField[];
		isGenerating?: boolean;
		showPreview?: boolean;
		onAddField?: () => void;
		onRemoveField?: (fieldId: string) => void;
		onRegenerate?: () => void;
		onExportSchema?: (payloadJson: string) => void;
		onFieldReorder?: (fieldIds: string[]) => void;
		onSubmitPayload?: (payload: Record<string, string | boolean | number>) => void;
		class?: string;
	}

	const defaultFields: FormField[] = [
		{
			id: 'worktreeBranch',
			label: 'Worktree Branch Name',
			type: 'text',
			placeholder: 'trailside/card-191-attempt-1',
			required: true,
			defaultValue: 'trailside/card-191-attempt-1',
			validation: { minLength: 5, maxLength: 80 }
		},
		{
			id: 'agentId',
			label: 'Target Supported Agent',
			type: 'select',
			required: true,
			options: ['claude-code', 'codex', 'gemini'],
			defaultValue: 'claude-code'
		},
		{
			id: 'riskTier',
			label: 'Risk Tier Gate',
			type: 'select',
			required: true,
			options: ['T0', 'T1', 'T2', 'T3', 'T4'],
			defaultValue: 'T2'
		},
		{
			id: 'tokenBudget',
			label: 'Max Token Budget',
			type: 'number',
			required: true,
			defaultValue: 40000,
			validation: { min: 1000, max: 200000 }
		},
		{
			id: 'verificationPrompt',
			label: 'Verification Acceptance Instructions',
			type: 'textarea',
			placeholder: 'Describe the test suite and contract checks required…',
			required: true,
			defaultValue: 'Run corepack pnpm test and verify zero uncommitted schema diffs.',
			validation: { minLength: 10, maxLength: 500 }
		},
		{
			id: 'isolatedDb',
			label: 'Use disposable SQLite fixture database',
			type: 'checkbox',
			defaultValue: true
		}
	];

	let {
		formTitle = 'Dispatch Worktree Run Tool Schema',
		formDescription = 'Dynamic schema-to-form generator for structured agent tool inputs with live validation and JSON payload preview.',
		fields = defaultFields,
		isGenerating = false,
		showPreview = true,
		onAddField,
		onRemoveField,
		onRegenerate,
		onExportSchema,
		onFieldReorder,
		onSubmitPayload,
		class: className = ''
	}: Props = $props();

	let localFields = $state<FormField[]>([]);
	let formValues = $state<Record<string, string | boolean | number>>({});
	let submitted = $state(false);

	$effect(() => {
		localFields = fields.map((f) => ({ ...f }));
		const initial: Record<string, string | boolean | number> = {};
		for (const f of fields) {
			if (f.defaultValue !== undefined) {
				initial[f.id] = f.defaultValue;
			} else if (f.type === 'checkbox') {
				initial[f.id] = false;
			} else if (f.type === 'select' && f.options?.length) {
				initial[f.id] = f.options[0];
			} else {
				initial[f.id] = '';
			}
		}
		formValues = initial;
	});

	/**
	 * Formats validation constraints of a field into a concise summary string.
	 *
	 * @param validation - Optional validation rules for the field.
	 * @returns Dot-separated human-readable constraint summary.
	 */
	function formatValidationRules(validation?: FormFieldValidation): string {
		if (!validation) return '';
		return [
			validation.minLength !== undefined ? `Min ${validation.minLength} chars` : null,
			validation.maxLength !== undefined ? `Max ${validation.maxLength} chars` : null,
			validation.min !== undefined ? `Min ${validation.min}` : null,
			validation.max !== undefined ? `Max ${validation.max}` : null,
			validation.pattern ? 'Regex pattern' : null
		]
			.filter(Boolean)
			.join(' · ');
	}

	/**
	 * Validates a single field against its required and length/range rules.
	 *
	 * @param field - Form field definition.
	 * @param value - Current value of the field.
	 * @returns Validation error message, or empty string when valid.
	 */
	function validateField(
		field: FormField,
		value: string | boolean | number | undefined
	): string {
		if (field.required) {
			if (value === undefined || value === '') {
				return `${field.label} is required`;
			}
		}
		if (typeof value === 'string' && field.validation) {
			if (
				field.validation.minLength !== undefined &&
				value.length < field.validation.minLength
			) {
				return `Minimum ${field.validation.minLength} characters required`;
			}
			if (
				field.validation.maxLength !== undefined &&
				value.length > field.validation.maxLength
			) {
				return `Maximum ${field.validation.maxLength} characters allowed`;
			}
		}
		if (typeof value === 'number' && field.validation) {
			if (field.validation.min !== undefined && value < field.validation.min) {
				return `Minimum value is ${field.validation.min}`;
			}
			if (field.validation.max !== undefined && value > field.validation.max) {
				return `Maximum value is ${field.validation.max}`;
			}
		}
		return '';
	}

	let validationErrors = $derived.by(() => {
		const errors: Record<string, string> = {};
		for (const field of localFields) {
			const message = validateField(field, formValues[field.id]);
			if (message) {
				errors[field.id] = message;
			}
		}
		return errors;
	});

	let isFormValid = $derived(Object.keys(validationErrors).length === 0);

	let jsonPayloadPreview = $derived(JSON.stringify(formValues, null, 2));

	/**
	 * Moves a field up or down in the schema field list.
	 *
	 * @param index - Current index of the field.
	 * @param delta - Direction offset (`-1` for up, `1` for down).
	 */
	function moveField(index: number, delta: number): void {
		const targetIndex = index + delta;
		if (targetIndex < 0 || targetIndex >= localFields.length) return;
		const copy = [...localFields];
		const temp = copy[index];
		copy[index] = copy[targetIndex];
		copy[targetIndex] = temp;
		localFields = copy;
		onFieldReorder?.(localFields.map((f) => f.id));
	}

	/**
	 * Removes a field from the local schema and notifies the optional callback.
	 *
	 * @param fieldId - Identifier of the field to remove.
	 */
	function handleRemoveField(fieldId: string): void {
		localFields = localFields.filter((f) => f.id !== fieldId);
		onRemoveField?.(fieldId);
	}

	/**
	 * Handles form submission when all live validation checks pass.
	 *
	 * @param event - Submit event from the generated form.
	 */
	function handleFormSubmit(event: SubmitEvent): void {
		event.preventDefault();
		if (!isFormValid) return;
		submitted = true;
		onSubmitPayload?.(formValues);
	}
</script>

<section
	aria-label="Dynamic schema-to-form generator"
	class="w-full overflow-hidden rounded-xl border border-card-border bg-card-bg text-sm {className}"
>
	<header
		class="flex flex-col gap-3 border-b border-canvas-border p-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<p class="font-mono text-xs font-medium text-fg-light">Structured Tool Input Builder</p>
			<h2 class="mt-0.5 text-base font-semibold text-fg-main">{formTitle}</h2>
			<p class="mt-0.5 text-xs text-fg-light">{formDescription}</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={() => onRegenerate?.()}
				class="rounded-lg border border-card-border bg-canvas-primary px-3 py-1.5 text-xs font-medium text-fg-main hover:bg-canvas-secondary"
			>
				↻ Regenerate
			</button>
			<button
				type="button"
				onclick={() => onExportSchema?.(jsonPayloadPreview)}
				class="rounded-lg border border-card-border bg-canvas-primary px-3 py-1.5 text-xs font-medium text-fg-main hover:bg-canvas-secondary"
			>
				{`{}`} Export JSON
			</button>
		</div>
	</header>

	{#if isGenerating}
		<div
			class="border-b border-canvas-border bg-accent-subtle px-4 py-2 font-mono text-xs text-accent-primary"
		>
			◎ Inferring tool input schema from contract definition…
		</div>
	{/if}

	<div class="grid {showPreview ? 'lg:grid-cols-2' : ''}">
		<div class="p-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-xs font-semibold text-fg-main">Schema Fields ({localFields.length})</h3>
					<p class="text-[11px] text-fg-light">Reorder or inspect validation rules</p>
				</div>
				<button
					type="button"
					onclick={() => onAddField?.()}
					class="rounded-lg border border-card-border bg-canvas-primary px-2.5 py-1 text-xs font-medium text-fg-main hover:bg-canvas-secondary"
				>
					+ Add Field
				</button>
			</div>

			<div class="mt-3 divide-y divide-canvas-border rounded-lg border border-canvas-border">
				{#each localFields as field, index (field.id)}
					{@const rulesText = formatValidationRules(field.validation)}
					<div class="flex items-start justify-between gap-3 px-3 py-2.5">
						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-2">
								<span class="font-medium text-fg-main">{field.label}</span>
								<span
									class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] text-fg-light"
								>
									{field.type}
								</span>
								{#if field.required}
									<span class="font-mono text-[10px] text-accent-primary">required</span>
								{/if}
							</div>
							{#if rulesText}
								<p class="mt-0.5 font-mono text-[11px] text-fg-light">{rulesText}</p>
							{/if}
						</div>

						<div class="flex shrink-0 items-center gap-1">
							<button
								type="button"
								disabled={index === 0}
								aria-label="Move {field.label} up"
								onclick={() => moveField(index, -1)}
								class="rounded border border-card-border bg-canvas-primary px-1.5 py-0.5 text-xs text-fg-light hover:bg-canvas-secondary disabled:opacity-30"
							>
								↑
							</button>
							<button
								type="button"
								disabled={index === localFields.length - 1}
								aria-label="Move {field.label} down"
								onclick={() => moveField(index, 1)}
								class="rounded border border-card-border bg-canvas-primary px-1.5 py-0.5 text-xs text-fg-light hover:bg-canvas-secondary disabled:opacity-30"
							>
								↓
							</button>
							<button
								type="button"
								aria-label="Remove {field.label}"
								onclick={() => handleRemoveField(field.id)}
								class="rounded border border-card-border bg-canvas-primary px-1.5 py-0.5 text-xs text-fg-light hover:bg-status-danger-subtle hover:text-status-danger"
							>
								✕
							</button>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-4">
				<div class="flex items-center justify-between text-xs">
					<span class="font-semibold text-fg-main">Live JSON Payload Preview</span>
					<span
						class="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold {isFormValid
							? 'bg-status-success-subtle text-status-success'
							: 'bg-status-danger-subtle text-status-danger'}"
					>
						{isFormValid ? '✓ Schema Valid' : '✕ Validation Error'}
					</span>
				</div>
				<pre
					class="mt-1.5 max-h-48 overflow-auto rounded-lg border border-canvas-border bg-canvas-primary p-3 font-mono text-xs leading-5 text-fg-main"><code>{jsonPayloadPreview}</code></pre>
			</div>
		</div>

		{#if showPreview}
			<aside class="border-t border-canvas-border bg-canvas-primary p-4 lg:border-t-0 lg:border-l">
				<h3 class="text-xs font-semibold text-fg-main">Interactive Tool Form</h3>
				<p class="mt-0.5 text-[11px] text-fg-light">
					Edit values below to test validation and update the JSON payload
				</p>

				<form onsubmit={handleFormSubmit} class="mt-3 space-y-3">
					{#each localFields as field (field.id)}
						{@const fieldError = validationErrors[field.id]}
						<div>
							{#if field.type === 'checkbox'}
								<label class="inline-flex cursor-pointer items-center gap-2 text-xs text-fg-main">
									<input
										type="checkbox"
										checked={Boolean(formValues[field.id])}
										onchange={(e) => {
											const target = e.currentTarget as HTMLInputElement;
											formValues = { ...formValues, [field.id]: target.checked };
										}}
										class="accent-current text-accent-primary"
									/>
									<span>{field.label}</span>
								</label>
							{:else if field.type === 'select'}
								<label class="block text-xs font-medium text-fg-main">
									{field.label}
									<select
										value={String(formValues[field.id] ?? '')}
										onchange={(e) => {
											const target = e.currentTarget as HTMLSelectElement;
											formValues = { ...formValues, [field.id]: target.value };
										}}
										class="mt-1 block w-full rounded-lg border border-card-border bg-card-bg px-3 py-1.5 text-xs text-fg-main"
									>
										{#each field.options ?? [] as opt (opt)}
											<option value={opt}>{opt}</option>
										{/each}
									</select>
								</label>
							{:else if field.type === 'textarea'}
								<label class="block text-xs font-medium text-fg-main">
									{field.label}
									<textarea
										rows="3"
										placeholder={field.placeholder}
										value={String(formValues[field.id] ?? '')}
										oninput={(e) => {
											const target = e.currentTarget as HTMLTextAreaElement;
											formValues = { ...formValues, [field.id]: target.value };
										}}
										class="mt-1 block w-full rounded-lg border border-card-border bg-card-bg p-2.5 text-xs text-fg-main"
									></textarea>
								</label>
							{:else}
								<label class="block text-xs font-medium text-fg-main">
									{field.label}
									<input
										type={field.type === 'number' ? 'number' : 'text'}
										placeholder={field.placeholder}
										value={formValues[field.id] ?? ''}
										oninput={(e) => {
											const target = e.currentTarget as HTMLInputElement;
											const val =
												field.type === 'number' ? Number(target.value) : target.value;
											formValues = { ...formValues, [field.id]: val };
										}}
										class="mt-1 block w-full rounded-lg border border-card-border bg-card-bg px-3 py-1.5 text-xs text-fg-main"
									/>
								</label>
							{/if}

							{#if fieldError}
								<p class="mt-1 text-[11px] text-status-danger">{fieldError}</p>
							{/if}
						</div>
					{/each}

					<div class="flex items-center justify-between border-t border-canvas-border pt-3">
						<span class="font-mono text-[11px] text-fg-light">
							{submitted ? '✓ Payload dispatched' : 'Ready to invoke'}
						</span>
						<button
							type="submit"
							disabled={!isFormValid}
							class="rounded-lg bg-accent-primary px-3.5 py-1.5 text-xs font-medium text-fg-inverse hover:opacity-90 disabled:opacity-40"
						>
							Invoke Tool with Payload
						</button>
					</div>
				</form>
			</aside>
		{/if}
	</div>
</section>
