<script lang="ts">
	import { buttonClass } from '../ui/styles';
	export interface FineTuneField {
		id: string;
		label: string;
		value: string | number;
		options?: string[];
		min?: number;
		max?: number;
		step?: number;
		suffix?: string;
	}

	interface Props {
		title?: string;
		fields?: FineTuneField[];
		onChange?: (id: string, value: string | number) => void;
		onApply?: () => void;
		onReset?: () => void;
		class?: string;
	}

	const DEFAULT_FIELDS: FineTuneField[] = [
		{
			id: 'risk-tier',
			label: 'Risk Tier Policy',
			value: 'T2 · Worktree Isolated',
			options: ['T0 · Docs Only', 'T1 · Read-Only Probe', 'T2 · Worktree Isolated', 'T3 · Human Co-sign']
		},
		{
			id: 'thinking-budget',
			label: 'Thinking Token Budget',
			value: 16000,
			min: 2000,
			max: 64000,
			step: 2000,
			suffix: 'tokens per attempt'
		},
		{
			id: 'max-turns',
			label: 'Max Autonomous Tool Turns',
			value: 24,
			min: 4,
			max: 60,
			step: 2,
			suffix: 'turns before checkpoint'
		},
		{
			id: 'temperature',
			label: 'Sampling Temperature',
			value: 0.2,
			min: 0,
			max: 1,
			step: 0.05,
			suffix: 'deterministic bias'
		}
	];

	let {
		title = 'Agent Runtime Parameters',
		fields = DEFAULT_FIELDS,
		onChange,
		onApply,
		onReset,
		class: className = ''
	}: Props = $props();

	let internalFields = $state<FineTuneField[]>([]);
	let statusMessage = $state<string | null>(null);

	$effect(() => {
		internalFields = fields.map((field) => ({ ...field }));
	});

	/**
	 * Updates a single tuning field value and notifies the parent callback.
	 *
	 * @param id - Field identifier.
	 * @param nextValue - Updated string or numeric value.
	 */
	function updateFieldValue(id: string, nextValue: string | number): void {
		internalFields = internalFields.map((field) =>
			field.id === id ? { ...field, value: nextValue } : field
		);
		statusMessage = null;
		onChange?.(id, nextValue);
	}

	/**
	 * Restores all fields to the initial prop values.
	 */
	function handleReset(): void {
		internalFields = fields.map((field) => ({ ...field }));
		statusMessage = 'Defaults restored';
		onReset?.();
	}

	/**
	 * Applies the current parameter configuration.
	 */
	function handleApply(): void {
		statusMessage = 'Configuration applied';
		onApply?.();
	}
</script>

<section
	class="w-full max-w-md rounded-card border border-card-border bg-card-bg p-4 text-fg-main {className}"
>
	<div class="flex items-center justify-between gap-2">
		<h3 class="text-sm font-semibold text-fg-main">{title}</h3>
		{#if statusMessage}
			<span class="font-mono text-[11px] text-status-success">{statusMessage}</span>
		{/if}
	</div>

	<div class="mt-4 space-y-3.5">
		{#each internalFields as field (field.id)}
			<label class="block text-xs text-fg-light">
				<span class="flex items-center justify-between font-medium text-fg-main">
					<span>{field.label}</span>
					<span class="font-mono text-xs text-accent-primary tabular-nums">{field.value}</span>
				</span>

				{#if field.options}
					<select
						value={String(field.value)}
						onchange={(e) => updateFieldValue(field.id, e.currentTarget.value)}
						class="mt-1.5 h-9 w-full rounded-lg border border-card-border bg-canvas-primary px-2.5 text-xs text-fg-main focus:border-accent-primary focus:outline-none"
					>
						{#each field.options as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				{:else if typeof field.value === 'number' && field.min !== undefined && field.max !== undefined}
					<input
						type="range"
						value={field.value}
						min={field.min}
						max={field.max}
						step={field.step ?? 1}
						oninput={(e) => updateFieldValue(field.id, Number(e.currentTarget.value))}
						class="mt-2 w-full accent-accent-primary"
					/>
				{:else}
					<input
						type={typeof field.value === 'number' ? 'number' : 'text'}
						value={field.value}
						min={field.min}
						max={field.max}
						step={field.step}
						oninput={(e) =>
							updateFieldValue(
								field.id,
								typeof field.value === 'number'
									? Number(e.currentTarget.value)
									: e.currentTarget.value
							)}
						class="mt-1.5 h-9 w-full rounded-lg border border-card-border bg-canvas-primary px-2.5 text-xs text-fg-main focus:border-accent-primary focus:outline-none"
					/>
				{/if}

				{#if field.suffix}
					<span class="mt-0.5 block text-right font-mono text-[10px] text-fg-light">
						{field.suffix}
					</span>
				{/if}
			</label>
		{/each}
	</div>

	<div class="mt-5 flex items-center justify-end gap-2 border-t border-canvas-border pt-3">
		<button
			type="button"
			onclick={handleReset}
			class={buttonClass('secondary', 'md')}
		>
			Reset
		</button>
		<button
			type="button"
			onclick={handleApply}
			class={buttonClass('primary', 'md')}
		>
			Apply
		</button>
	</div>
</section>
