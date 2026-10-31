<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Check, ChevronDown, Sparkles } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';

	export interface StackFrameItem {
		raw: string;
		functionName: string | null;
		filePath: string | null;
		lineNumber: number | null;
		columnNumber: number | null;
		isInternal: boolean;
	}

	export interface ParsedStackTraceData {
		errorType: string;
		errorMessage: string;
		frames: StackFrameItem[];
		raw: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'trace' | 'sourceSnippet' | 'defaultOpen' | 'defaultShowInternal' | 'onFilePathClick' | 'onSendToAgent'> {
		trace: string;
		sourceSnippet?: {
			filePath: string;
			startLine: number;
			highlightLine: number;
			lines: string[];
		};
		defaultOpen?: boolean;
		defaultShowInternal?: boolean;
		onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
		onSendToAgent?: (trace: string) => void;
		class?: string;
	}

	/**
	 * Matches stack frames formatted as `at fnName (filePath:line:col)`.
	 */
	const STACK_FRAME_WITH_PARENS_REGEX = /^at\s+(.+?)\s+\((.+):(\d+):(\d+)\)$/;

	/**
	 * Matches stack frames formatted as `at filePath:line:col`.
	 */
	const STACK_FRAME_WITHOUT_FN_REGEX = /^at\s+(.+):(\d+):(\d+)$/;

	/**
	 * Matches standard JavaScript error headers like `TypeError: message`.
	 */
	const ERROR_TYPE_REGEX = /^(\w+Error|Error):\s*(.*)$/;

	let {
		trace,
		sourceSnippet,
		defaultOpen = true,
		defaultShowInternal = false,
		onFilePathClick,
		onSendToAgent,
		class: className = '',
		...rest
	}: Props = $props();

	let isOpen = $state(true);
	let showInternalFrames = $state(false);
	let copied = $state(false);
	let sentToAgent = $state(false);

	$effect(() => {
		isOpen = defaultOpen;
		showInternalFrames = defaultShowInternal;
	});

	/**
	 * Parses a single raw stack frame line into structured file, line, column, and internal flags.
	 *
	 * @param line - Raw line from stack trace starting with `at `.
	 * @returns Structured StackFrameItem.
	 */
	function parseStackFrame(line: string): StackFrameItem {
		const trimmed = line.trim();
		const withParens = trimmed.match(STACK_FRAME_WITH_PARENS_REGEX);
		if (withParens) {
			const [, fnName, filePath, lineNum, colNum] = withParens;
			const isInternal =
				filePath.includes('node_modules') ||
				filePath.startsWith('node:') ||
				filePath.includes('internal/');
			return {
				raw: trimmed,
				functionName: fnName ?? null,
				filePath: filePath ?? null,
				lineNumber: lineNum ? Number.parseInt(lineNum, 10) : null,
				columnNumber: colNum ? Number.parseInt(colNum, 10) : null,
				isInternal
			};
		}

		const withoutFn = trimmed.match(STACK_FRAME_WITHOUT_FN_REGEX);
		if (withoutFn) {
			const [, filePath, lineNum, colNum] = withoutFn;
			const isInternal =
				filePath.includes('node_modules') ||
				filePath.startsWith('node:') ||
				filePath.includes('internal/');
			return {
				raw: trimmed,
				functionName: null,
				filePath: filePath ?? null,
				lineNumber: lineNum ? Number.parseInt(lineNum, 10) : null,
				columnNumber: colNum ? Number.parseInt(colNum, 10) : null,
				isInternal
			};
		}

		return {
			raw: trimmed,
			functionName: trimmed.replace(/^at\s+/, ''),
			filePath: null,
			lineNumber: null,
			columnNumber: null,
			isInternal:
				trimmed.includes('node_modules') ||
				trimmed.includes('node:') ||
				trimmed.includes('Promise.all')
		};
	}

	/**
	 * Parses an entire error stack string into error type, message, and frame list.
	 *
	 * @param rawTrace - Full multi-line stack trace string.
	 * @returns Structured ParsedStackTraceData.
	 */
	function parseStackTrace(rawTrace: string): ParsedStackTraceData {
		const lines = rawTrace
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean);

		if (lines.length === 0) {
			return {
				errorType: 'Error',
				errorMessage: rawTrace,
				frames: [],
				raw: rawTrace
			};
		}

		const firstLine = lines[0];
		const match = firstLine.match(ERROR_TYPE_REGEX);
		const errorType = match ? match[1] : 'RuntimeError';
		const errorMessage = match ? match[2] : firstLine;

		const frames = lines
			.slice(1)
			.filter((l) => l.startsWith('at '))
			.map(parseStackFrame);

		return {
			errorType,
			errorMessage,
			frames,
			raw: rawTrace
		};
	}

	let parsed = $derived(parseStackTrace(trace));
	let internalCount = $derived(parsed.frames.filter((f) => f.isInternal).length);
	let visibleFrames = $derived(
		showInternalFrames ? parsed.frames : parsed.frames.filter((f) => !f.isInternal)
	);

	/**
	 * Copies the raw stack trace to the system clipboard and sets temporary feedback state.
	 */
	async function handleCopy(): Promise<void> {
		if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(trace);
		}
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 1800);
	}

	/**
	 * Invokes the `onSendToAgent` callback with the raw trace and shows confirmation state.
	 */
	function handleSendToAgent(): void {
		onSendToAgent?.(trace);
		sentToAgent = true;
		setTimeout(() => {
			sentToAgent = false;
		}, 2000);
	}
</script>

<div {...rest} class="w-full overflow-hidden rounded-xl border border-status-danger bg-card-bg text-sm {className}">
	<div class="flex flex-wrap items-center justify-between gap-2 bg-status-danger-subtle px-4 py-3">
		<button
			type="button"
			aria-expanded={isOpen}
			onclick={() => (isOpen = !isOpen)}
			class="flex min-w-0 flex-1 items-center gap-2.5 text-left"
		>
			<span
				aria-hidden="true"
				class="inline-flex size-5 shrink-0 items-center justify-center rounded bg-card-bg font-mono text-xs font-bold text-status-danger"
			>
				!
			</span>
			<span class="shrink-0 font-mono text-xs font-bold text-status-danger">
				{parsed.errorType}:
			</span>
			<span class="truncate font-mono text-xs text-fg-main">
				{parsed.errorMessage}
			</span>
		</button>

		<div class="flex shrink-0 items-center gap-1.5">
			<button
				type="button"
				onclick={handleCopy}
				class={buttonClass('secondary', 'sm')}
			>
				{#if copied}<Check aria-hidden="true" />Copied{:else}Copy trace{/if}
			</button>
			<button
				type="button"
				onclick={handleSendToAgent}
				class={buttonClass('primary', 'sm')}
			>
				{#if sentToAgent}<Check aria-hidden="true" />Sent to Agent{:else}<Sparkles aria-hidden="true" />Send to Agent{/if}
			</button>
			<button
				type="button"
				aria-label="Toggle stack trace frames"
				aria-expanded={isOpen}
				onclick={() => (isOpen = !isOpen)}
				class={buttonClass('ghost', 'icon-sm')}
			>
				<ChevronDown aria-hidden="true" class="transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
			</button>
		</div>
	</div>

	<AgentDisclosure open={isOpen}>
		{#if sourceSnippet}
			<div class="border-t border-canvas-border bg-terminal-bg px-4 py-3 font-mono text-xs text-terminal-fg">
				<div class="mb-2 flex items-center justify-between text-[11px] text-terminal-muted">
					<span>{sourceSnippet.filePath}</span>
					<span>Line {sourceSnippet.highlightLine}</span>
				</div>
				<div class="space-y-0.5 overflow-x-auto">
					{#each sourceSnippet.lines as lineText, idx (idx)}
						{@const lineNumber = sourceSnippet.startLine + idx}
						{@const isHighlighted = lineNumber === sourceSnippet.highlightLine}
						<div
							class="flex items-start gap-3 rounded px-2 py-0.5 {isHighlighted
								? 'bg-status-danger-subtle text-status-danger font-semibold'
								: ''}"
						>
							<span class="w-6 shrink-0 select-none text-right tabular-nums text-terminal-muted">
								{lineNumber}
							</span>
							<span class="whitespace-pre">{lineText}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="border-t border-canvas-border p-3 font-mono text-xs">
			<div class="mb-2 flex items-center justify-between px-1">
				<span class="text-[11px] capitalize text-fg-light font-medium">
					Stack Frames ({visibleFrames.length} shown)
				</span>
				{#if internalCount > 0}
					<button
						type="button"
						onclick={() => (showInternalFrames = !showInternalFrames)}
						class="rounded bg-canvas-secondary px-2 py-0.5 text-[11px] text-fg-light transition-colors hover:text-fg-main"
					>
						{showInternalFrames
							? `Hide ${internalCount} internal frames`
							: `Show ${internalCount} internal frames`}
					</button>
				{/if}
			</div>

			<div class="space-y-1">
				{#each visibleFrames as frame, index (`${frame.raw}-${index}`)}
					<div
						class="flex flex-wrap items-baseline gap-x-1.5 rounded px-2 py-1 {frame.isInternal
							? 'text-fg-light opacity-75'
							: 'bg-canvas-primary text-fg-main'}"
					>
						<span class="text-fg-light">at</span>
						{#if frame.functionName}
							<span class="font-medium text-fg-main">{frame.functionName}</span>
						{/if}
						{#if frame.filePath}
							<span class="text-fg-light">(</span>
							<button
								type="button"
								onclick={() =>
									frame.filePath &&
									onFilePathClick?.(
										frame.filePath,
										frame.lineNumber ?? undefined,
										frame.columnNumber ?? undefined
									)}
								class="underline decoration-dotted transition-colors hover:text-accent-primary"
							>
								{frame.filePath}{frame.lineNumber !== null
									? `:${frame.lineNumber}`
									: ''}{frame.columnNumber !== null ? `:${frame.columnNumber}` : ''}
							</button>
							<span class="text-fg-light">)</span>
						{/if}
						{#if frame.isInternal}
							<span class="ml-auto rounded bg-canvas-secondary px-1.5 py-0.5 text-[10px] text-fg-light">
								internal
							</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</AgentDisclosure>
</div>
