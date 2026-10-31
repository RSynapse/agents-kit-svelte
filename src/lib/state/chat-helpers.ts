import type {
	ActivityItem,
	ActivityStatus,
	DiffLine,
	ParsedDiff,
	TodoItem
} from '../types';

/**
 * Matches unified diff hunk headers of the form `@@ -oldStart,oldCount +newStart,newCount @@`
 * so old and new line numbers can be tracked accurately across hunks.
 */
const HUNK_HEADER_REGEX = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

/**
 * Matches legacy Svelte 4 reactive declarations (`$: ...`) at the start of a line.
 */
const SVELTE4_REACTIVE_REGEX = /^\s*\$:\s+/m;

/**
 * Matches legacy Svelte 4 prop declarations (`export let ...`).
 */
const SVELTE4_EXPORT_LET_REGEX = /\bexport\s+let\s+/;

/**
 * Matches hardcoded hex color literals (`#fff`, `#0f172a`, `#11223344`) while ignoring URL anchors.
 */
const HARDCODED_HEX_COLOR_REGEX = /(?:^|[\s:"'=(])#[0-9a-fA-F]{3,8}\b/;

/**
 * Threshold ratios for context window token usage warnings (75% warning, 90% danger).
 */
const CONTEXT_WARNING_THRESHOLD = 0.75;
const CONTEXT_DANGER_THRESHOLD = 0.9;

/**
 * Parses a unified diff patch string into line-numbered diff entries and addition/deletion totals.
 *
 * @param patch - Raw unified diff string (`@@ ... @@`, `+`, `-`, ` ` lines).
 * @returns Structured lines with old/new line numbers and total additions/deletions.
 */
export function parseUnifiedDiff(patch: string): ParsedDiff {
	const rawLines = patch.replace(/\r\n/g, '\n').split('\n');
	if (rawLines.at(-1) === '') {
		rawLines.pop();
	}

	let oldLine = 1;
	let newLine = 1;
	let additions = 0;
	let deletions = 0;

	const lines: DiffLine[] = rawLines.map((line, index) => {
		const hunkMatch = line.match(HUNK_HEADER_REGEX);
		if (hunkMatch) {
			oldLine = Number(hunkMatch[1]);
			newLine = Number(hunkMatch[2]);
			return {
				id: `hunk-${index}`,
				kind: 'hunk',
				content: line
			};
		}

		if (line.startsWith('+') && !line.startsWith('+++')) {
			const currentNew = newLine;
			newLine += 1;
			additions += 1;
			return {
				id: `add-${index}-${currentNew}`,
				kind: 'add',
				newNumber: currentNew,
				content: line.slice(1)
			};
		}

		if (line.startsWith('-') && !line.startsWith('---')) {
			const currentOld = oldLine;
			oldLine += 1;
			deletions += 1;
			return {
				id: `del-${index}-${currentOld}`,
				kind: 'delete',
				oldNumber: currentOld,
				content: line.slice(1)
			};
		}

		const currentOld = oldLine;
		const currentNew = newLine;
		oldLine += 1;
		newLine += 1;
		return {
			id: `ctx-${index}-${currentOld}-${currentNew}`,
			kind: 'context',
			oldNumber: currentOld,
			newNumber: currentNew,
			content: line.startsWith(' ') ? line.slice(1) : line
		};
	});

	return {
		lines,
		additions,
		deletions
	};
}

/**
 * Summarizes an agent's reasoning, tool, search, and step items into a concise Claude Code header label.
 *
 * @param items - List of activity rows recorded in the current turn.
 * @param status - Whether the agent is actively `'working'` or `'complete'`.
 * @param durationSeconds - Optional elapsed seconds for thinking/reasoning summaries.
 * @param customTitle - Optional explicit override title.
 * @returns Human-readable activity summary string.
 */
export function summarizeActivity(
	items: ActivityItem[],
	status: ActivityStatus,
	durationSeconds?: number,
	customTitle?: string
): string {
	if (customTitle) {
		return customTitle;
	}
	if (status === 'working') {
		return 'Working';
	}

	const types = new Set(items.map((item) => item.type));
	const count = items.length;

	if (types.size === 1 && types.has('text')) {
		return durationSeconds ? `Thought for ${durationSeconds}s` : 'Thought';
	}
	if (types.size === 1 && types.has('tool')) {
		return `Ran ${count} ${count === 1 ? 'tool' : 'tools'}`;
	}
	if (types.size === 1 && types.has('search')) {
		return `Searched ${count} ${count === 1 ? 'source' : 'sources'}`;
	}
	return `Completed ${count} ${count === 1 ? 'step' : 'steps'}`;
}

/**
 * Computes completion metrics and the active in-progress item for a task checklist.
 *
 * @param items - Array of todo checklist items.
 * @returns Summary object with counts, active item, completion flag, and percentage.
 */
export function summarizeTodos(items: TodoItem[]): {
	completedCount: number;
	totalCount: number;
	allCompleted: boolean;
	inProgressItem: TodoItem | undefined;
	progressPercent: number;
} {
	const totalCount = items.length;
	const completedCount = items.filter((item) => item.status === 'completed').length;
	const inProgressItem = items.find((item) => item.status === 'in-progress');
	const allCompleted = totalCount > 0 && completedCount === totalCount;
	const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	return {
		completedCount,
		totalCount,
		allCompleted,
		inProgressItem,
		progressPercent
	};
}

/**
 * Checks whether a keyboard event is part of an active Input Method Editor (IME) composition session.
 * Uses `event.isComposing` with `keyCode === 229` fallback for Safari/WebKit compatibility.
 *
 * @param event - Keyboard event-like object containing `isComposing` and optional `keyCode`.
 * @returns True if Enter submission should be suppressed due to active IME composition.
 */
export function isImeComposing(event: { isComposing?: boolean; keyCode?: number }): boolean {
	// 229 is the standard W3C UI Events keyCode emitted by IMEs during composition
	return Boolean(event.isComposing) || event.keyCode === 229;
}

/**
 * Formats a token count into a compact human-readable label (e.g., `42500` -> `'42.5k'`).
 *
 * @param tokens - Token count to format.
 * @returns Compact string representation.
 */
export function formatCompactTokens(tokens: number): string {
	if (tokens >= 1_000_000) {
		const millions = tokens / 1_000_000;
		return `${Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)}M`;
	}
	if (tokens >= 1_000) {
		const thousands = tokens / 1_000;
		return `${Number.isInteger(thousands) ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
	}
	return `${tokens}`;
}

/**
 * Computes token window usage metrics and semantic status tone for `AgentContextMeter`.
 *
 * @param usedTokens - Currently consumed tokens in the session window.
 * @param maxTokens - Maximum context window capacity in tokens.
 * @returns Ratio, percentage, formatted strings, and semantic tone (`'normal' | 'warning' | 'danger'`).
 */
export function computeContextMeter(
	usedTokens: number,
	maxTokens: number
): {
	ratio: number;
	percent: number;
	formattedUsed: string;
	formattedMax: string;
	tone: 'normal' | 'warning' | 'danger';
} {
	const safeMax = Math.max(1, maxTokens);
	const ratio = Math.min(1, Math.max(0, usedTokens / safeMax));
	const percent = Math.round(ratio * 100);
	const tone =
		ratio >= CONTEXT_DANGER_THRESHOLD
			? 'danger'
			: ratio >= CONTEXT_WARNING_THRESHOLD
				? 'warning'
				: 'normal';

	return {
		ratio,
		percent,
		formattedUsed: formatCompactTokens(usedTokens),
		formattedMax: formatCompactTokens(safeMax),
		tone
	};
}

/**
 * Validates a Svelte component source string against Svelte 5 Runes and Semantic Token rules.
 *
 * @param source - Raw `.svelte` file contents.
 * @returns List of rule violation messages (empty array when compliant).
 */
export function validateSvelte5ComponentSource(source: string): string[] {
	const violations: string[] = [];
	if (SVELTE4_EXPORT_LET_REGEX.test(source)) {
		violations.push('Uses legacy Svelte 4 `export let` instead of `$props()`');
	}
	if (SVELTE4_REACTIVE_REGEX.test(source)) {
		violations.push('Uses legacy Svelte 4 `$:` reactive statement instead of `$derived()` or `$effect()`');
	}
	if (HARDCODED_HEX_COLOR_REGEX.test(source)) {
		violations.push('Contains hardcoded hex color literal instead of semantic CSS tokens');
	}
	return violations;
}
