/**
 * Site-only audit used by the test suite: checks that every component uses Svelte 5
 * runes and semantic tokens. Not part of the published package.
 */

/**
 * Matches legacy Svelte 4 prop declarations (`export let ...`).
 */
const SVELTE4_EXPORT_LET_REGEX = /\bexport\s+let\s+/;
/**
 * Matches legacy Svelte 4 reactive declarations (`$: ...`) at the start of a line.
 */
const SVELTE4_REACTIVE_REGEX = /^\s*\$:\s+/m;
/**
 * Matches hardcoded hex color literals (`#fff`, `#0f172a`, `#11223344`) while ignoring URL anchors.
 */
const HARDCODED_HEX_COLOR_REGEX = /(?:^|[\s:"'=(])#[0-9a-fA-F]{3,8}\b/;

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
