<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ChevronDown, FileIcon, PenLine, Terminal } from '@lucide/svelte';
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

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'steps' | 'diffs' | 'expandedId' | 'visibleStepCount' | 'onToggle' | 'onDiffToggle'> {
		steps?: ToolStep[];
		diffs?: ToolDiff[];
		expandedId?: string;
		visibleStepCount?: number;
		onToggle?: (id: string) => void;
		onDiffToggle?: (file: string, open: boolean) => void;
		class?: string;
	}

	let {
		steps = [],
		diffs = [],
		expandedId,
		visibleStepCount,
		onToggle,
		onDiffToggle,
		class: className = '',
		...rest
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

<div {...rest}
	class={cn('divide-y divide-canvas-border overflow-hidden rounded-card border border-card-border bg-card-bg text-fg-main', className)}
>
	<div class="flex items-center justify-between bg-canvas-secondary/40 px-3.5 py-2 text-xs">
		<span class="font-medium text-fg-main">{steps.length} tool calls · {diffs.length} files modified</span>
		<span class="font-mono text-[11px] text-fg-light">Click row to inspect</span>
	</div>

	{#each visibleSteps as step (step.id)}
		{@const isOpen = step.id === selectedStepId}
		<div>
			<button
				type="button"
				aria-expanded={isOpen}
				onclick={() => handleStepToggle(step.id)}
				class="group flex min-h-10 w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors hover:bg-canvas-secondary/60"
			>
				<span
					aria-hidden="true"
					class="inline-flex size-4 shrink-0 items-center justify-center {step.status === 'error'
						? 'text-status-danger'
						: step.status === 'running'
							? 'text-accent-primary'
							: 'text-fg-light'}"
				>
					{#if step.label.toLowerCase().includes('read')}
						<FileIcon class="size-4" />
					{:else if step.label.toLowerCase().includes('patch') || step.label.toLowerCase().includes('write')}
						<PenLine class="size-4" />
					{:else}
						<Terminal class="size-4" />
					{/if}
				</span>

				<span class="text-xs font-medium text-fg-main">{step.label}</span>

				{#if step.chip}
					<code
						class="min-w-0 truncate rounded-md border border-card-border bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] text-fg-main"
					>
						{step.chip}
					</code>
				{/if}

				<span class="ml-auto flex shrink-0 items-center gap-2">
					{#if step.additions !== undefined || step.deletions !== undefined}
						<span class="font-sans text-xs font-medium tabular-nums">
							<span class="text-diff-add-fg">+{step.additions ?? 0}</span>
							<span class="ml-1 text-diff-del-fg">−{step.deletions ?? 0}</span>
						</span>
					{/if}

					<ChevronDown aria-hidden="true" class="size-3.5 text-fg-light transition-transform duration-150 {isOpen
							? 'rotate-180'
							: ''}" />
				</span>
			</button>

			{#if isOpen && step.detail}
				<div class="border-t border-canvas-border bg-canvas-secondary/60 px-3.5 py-2.5">
					<pre class="overflow-x-auto font-mono text-xs leading-5 text-fg-light">{step.detail}</pre>
				</div>
			{/if}
		</div>
	{/each}

	{#if diffs.length > 0}
		<div class="flex flex-wrap gap-2 bg-canvas-secondary/30 p-3">
			{#each diffs as diff (diff.file)}
				{@const isDiffOpen = openDiff === diff.file}
				<div class="rounded-lg border border-card-border bg-card-bg px-2.5 py-1.5 text-xs">
					<button
						type="button"
						aria-expanded={isDiffOpen}
						onclick={() => handleDiffChipToggle(diff.file)}
						class="flex items-center gap-1.5 font-mono text-xs text-fg-main"
					>
						<FileIcon aria-hidden="true" class="size-3.5 text-fg-light" />
						<span>{diff.file}</span>
						<span class="font-sans font-medium text-diff-add-fg">+{diff.additions}</span>
						<span class="font-sans font-medium text-diff-del-fg">−{diff.deletions}</span>
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
