<script lang="ts">
	export interface SelectionAction {
		id: string;
		label: string;
		tone?: 'default' | 'accent' | 'danger';
	}

	interface Props {
		selectedText?: string;
		selectedCount?: number;
		actions?: SelectionAction[];
		result?: string;
		isWorking?: boolean;
		onAction?: (id: string) => void;
		onReplace?: (value: string) => void;
		onClear?: () => void;
		class?: string;
	}

	const DEFAULT_ACTIONS: SelectionAction[] = [
		{ id: 'approve', label: 'Approve selected', tone: 'accent' },
		{ id: 'rerun', label: 'Re-run in worktree', tone: 'default' },
		{ id: 'export', label: 'Export patch', tone: 'default' },
		{ id: 'clear', label: 'Clear', tone: 'danger' }
	];

	let {
		selectedText = 'Retries must reauthorize before the idempotency lookup, and the lookup must precede new-intent revision checks.',
		selectedCount = 3,
		actions = DEFAULT_ACTIONS,
		result = undefined,
		isWorking = false,
		onAction,
		onReplace,
		onClear,
		class: className = ''
	}: Props = $props();

	let activeActionId = $state<string | null>(null);
	let localResult = $state<string | undefined>(undefined);

	$effect(() => {
		localResult = result;
	});

	/**
	 * Executes a selection action and generates a preview outcome when standalone.
	 *
	 * @param id - Action identifier triggered by the user.
	 */
	function triggerAction(id: string): void {
		activeActionId = id;
		onAction?.(id);
		if (id === 'clear') {
			localResult = undefined;
			onClear?.();
			return;
		}
		if (result === undefined) {
			localResult = `Action "${id}" queued for ${selectedCount} selected items with verified worktree state.`;
		}
	}
</script>

<section
	class="rounded-xl border border-card-border bg-card-bg p-4 text-fg-main shadow-xs {className}"
>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<span
				class="inline-flex size-5 items-center justify-center rounded-full bg-accent-primary font-mono text-[11px] font-bold text-fg-inverse tabular-nums"
			>
				{selectedCount}
			</span>
			<span class="text-xs font-semibold text-fg-main">Selected context & bulk actions</span>
		</div>

		{#if activeActionId}
			<span class="font-mono text-[11px] text-accent-primary">Last action: {activeActionId}</span>
		{/if}
	</div>

	{#if selectedText}
		<blockquote
			class="mt-2.5 border-l-2 border-accent-primary bg-canvas-secondary py-1.5 pr-3 pl-3 text-xs leading-5 text-fg-light"
		>
			{selectedText}
		</blockquote>
	{/if}

	<div class="mt-3 flex flex-wrap items-center gap-2">
		{#each actions as action (action.id)}
			<button
				type="button"
				disabled={isWorking}
				onclick={() => triggerAction(action.id)}
				class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 {action.tone ===
				'accent'
					? 'border-transparent bg-accent-primary text-fg-inverse hover:opacity-90'
					: action.tone === 'danger'
						? 'border-card-border bg-canvas-primary text-status-danger hover:bg-status-danger-subtle'
						: 'border-card-border bg-canvas-secondary text-fg-main hover:bg-accent-subtle hover:text-accent-primary'}"
			>
				{action.label}
			</button>
		{/each}
	</div>

	{#if isWorking}
		<p class="mt-3 font-mono text-xs text-fg-light">Applying selection action…</p>
	{/if}

	{#if localResult}
		<div class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-canvas-border bg-canvas-secondary p-3">
			<p class="text-xs leading-5 text-fg-main">{localResult}</p>
			<button
				type="button"
				onclick={() => onReplace?.(localResult ?? '')}
				class="rounded-lg bg-accent-primary px-2.5 py-1 text-xs font-semibold text-fg-inverse transition-opacity hover:opacity-90"
			>
				Apply result
			</button>
		</div>
	{/if}
</section>
