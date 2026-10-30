<script lang="ts">
	export interface ToolStep {
		id: string;
		label: string;
		detail?: string;
		chip?: string;
		additions?: number;
		deletions?: number;
		status: 'running' | 'complete' | 'error';
	}

	export interface ToolDiff {
		file: string;
		additions: number;
		deletions: number;
		lines?: string[];
	}

	interface Props {
		steps?: ToolStep[];
		diffs?: ToolDiff[];
		expandedId?: string;
		visibleStepCount?: number;
		onToggle?: (id: string) => void;
		onDiffToggle?: (file: string, open: boolean) => void;
		class?: string;
	}

	const DEFAULT_STEPS: ToolStep[] = [
		{
			id: 'step-read',
			label: 'Read contract schema',
			chip: 'contracts/g0/schema/envelope.json',
			status: 'complete',
			detail: 'Validated 14 envelope fields against draft-2020-12 JSON Schema.'
		},
		{
			id: 'step-edit',
			label: 'Patch worktree dispatcher',
			chip: 'src/lib/runtime/dispatcher.ts',
			additions: 28,
			deletions: 6,
			status: 'complete',
			detail: 'Added idempotency lookup prior to revision check in dispatchRun().'
		},
		{
			id: 'step-test',
			label: 'Execute unit suite',
			chip: 'pnpm test',
			status: 'running',
			detail: 'Running 6 test files in isolated worker pool…'
		}
	];

	const DEFAULT_DIFFS: ToolDiff[] = [
		{
			file: 'src/lib/runtime/dispatcher.ts',
			additions: 28,
			deletions: 6,
			lines: [
				'@@ -41,4 +41,6 @@ export async function dispatchRun(ctx) {',
				'-  await assertRevision(ctx.revision);',
				'+  const existing = await findIdempotentResult(ctx.requestId);',
				'+  if (existing) return existing;',
				'+  await assertRevision(ctx.revision);'
			]
		},
		{
			file: 'tests/dispatcher.test.ts',
			additions: 19,
			deletions: 0,
			lines: [
				'@@ -1,3 +1,8 @@',
				'+test("reauthorizes before idempotency lookup", async () => {',
				'+  assert.equal(result.status, "accepted");',
				'+});'
			]
		}
	];

	let {
		steps = DEFAULT_STEPS,
		diffs = DEFAULT_DIFFS,
		expandedId,
		visibleStepCount,
		onToggle,
		onDiffToggle,
		class: className = ''
	}: Props = $props();

	let localExpanded = $state<string | undefined>('step-edit');
	let openDiff = $state<string | undefined>(undefined);

	/**
	 * Toggles the expanded state of a tool invocation step.
	 *
	 * @param id - Step identifier to toggle.
	 */
	function handleStepToggle(id: string): void {
		const current = expandedId ?? localExpanded;
		const next = current === id ? undefined : id;
		if (expandedId === undefined) {
			localExpanded = next;
		}
		onToggle?.(next ?? '');
	}

	/**
	 * Toggles the inline diff preview for a modified file chip.
	 *
	 * @param file - File path associated with the diff chip.
	 */
	function handleDiffChipToggle(file: string): void {
		const next = openDiff === file ? undefined : file;
		openDiff = next;
		onDiffToggle?.(file, next === file);
	}

	let selectedStepId = $derived(expandedId ?? localExpanded);
	let visibleSteps = $derived(
		visibleStepCount !== undefined ? steps.slice(0, visibleStepCount) : steps
	);
</script>

<div
	class="divide-y divide-canvas-border rounded-xl border border-card-border bg-card-bg text-fg-main {className}"
>
	{#each visibleSteps as step (step.id)}
		{@const isOpen = step.id === selectedStepId}
		<div>
			<button
				type="button"
				aria-expanded={isOpen}
				onclick={() => handleStepToggle(step.id)}
				class="flex min-h-9 w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-canvas-secondary"
			>
				<span
					aria-hidden="true"
					class="inline-flex size-4 shrink-0 items-center justify-center rounded font-mono text-[11px] {step.status ===
					'error'
						? 'bg-status-danger-subtle text-status-danger'
						: step.status === 'running'
							? 'bg-accent-subtle text-accent-primary'
							: 'bg-status-success-subtle text-status-success'}"
				>
					{step.status === 'error' ? '!' : step.status === 'running' ? '↻' : '✓'}
				</span>

				<span class="text-xs font-medium text-fg-main">{step.label}</span>

				{#if step.chip}
					<code
						class="min-w-0 flex-1 truncate rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px] text-fg-light"
					>
						{step.chip}
					</code>
				{:else}
					<span class="flex-1"></span>
				{/if}

				{#if step.additions !== undefined || step.deletions !== undefined}
					<span class="font-mono text-xs tabular-nums">
						<span class="text-diff-add-fg">+{step.additions ?? 0}</span>
						<span class="ml-1 text-diff-del-fg">-{step.deletions ?? 0}</span>
					</span>
				{/if}

				<span
					aria-hidden="true"
					class="text-xs text-fg-light transition-transform {isOpen ? 'rotate-180' : ''}"
				>
					▾
				</span>
			</button>

			{#if isOpen && step.detail}
				<div class="border-t border-canvas-border bg-canvas-secondary px-3 py-2.5">
					<pre class="overflow-x-auto font-mono text-xs leading-5 text-fg-light">{step.detail}</pre>
				</div>
			{/if}
		</div>
	{/each}

	{#if diffs.length > 0}
		<div class="flex flex-wrap gap-2 p-3">
			{#each diffs as diff (diff.file)}
				{@const isDiffOpen = openDiff === diff.file}
				<div class="rounded-lg border border-card-border bg-canvas-primary px-2.5 py-1.5 text-xs">
					<button
						type="button"
						aria-expanded={isDiffOpen}
						onclick={() => handleDiffChipToggle(diff.file)}
						class="flex items-center gap-1.5 font-mono text-xs text-fg-main"
					>
						<span>{diff.file}</span>
						<span class="text-diff-add-fg">+{diff.additions}</span>
						<span class="text-diff-del-fg">-{diff.deletions}</span>
					</button>

					{#if isDiffOpen && diff.lines?.length}
						<pre
							class="mt-2 max-w-md overflow-x-auto border-t border-canvas-border pt-2 font-mono text-[11px] leading-5 text-fg-light"
						>{diff.lines.join('\n')}</pre>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
