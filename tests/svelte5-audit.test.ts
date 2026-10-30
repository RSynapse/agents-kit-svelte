import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { validateSvelte5ComponentSource } from '../src/lib/state/chat-helpers.ts';

/**
 * Recursively collects all `.svelte` and `.svelte.ts` files under a directory.
 *
 * @param dir - Directory path to walk.
 * @param ext - File suffix to match.
 * @returns Array of absolute file paths ending in `ext`.
 */
function collectFilesByExtension(dir: string, ext = '.svelte'): string[] {
	const entries = readdirSync(dir);
	const files: string[] = [];
	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);
		if (stat.isDirectory()) {
			files.push(...collectFilesByExtension(fullPath, ext));
		} else if (entry.endsWith(ext)) {
			files.push(fullPath);
		}
	}
	return files;
}

test('all Svelte components in src/ comply with Svelte 5 Runes, Props typing, and semantic token rules', () => {
	const srcDir = join(process.cwd(), 'src');
	const svelteFiles = collectFilesByExtension(srcDir, '.svelte');
	assert.ok(svelteFiles.length >= 68, `Expected at least 68 .svelte files in src/, found ${svelteFiles.length}`);

	for (const filePath of svelteFiles) {
		const source = readFileSync(filePath, 'utf8');
		const violations = validateSvelte5ComponentSource(source);
		assert.deepEqual(violations, [], `Violations in ${filePath}: ${violations.join(', ')}`);

		if (source.includes('$props()')) {
			assert.match(
				source,
				/\b(?:interface|type)\s+Props\b/,
				`Component ${filePath} uses $props() without defining Props interface/type`
			);
		}
	}
});

test('library deeply integrates Svelte 5 motion, transitions, flip animations, reactive collections, and snippets', () => {
	const libDir = join(process.cwd(), 'src', 'lib');
	const allSvelteFiles = [
		...collectFilesByExtension(libDir, '.svelte'),
		...collectFilesByExtension(libDir, '.svelte.ts')
	];
	const combined = allSvelteFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

	assert.match(combined, /from 'svelte\/motion'/, 'Expected svelte/motion imports');
	assert.match(combined, /\bnew Spring\b/, 'Expected Svelte 5 Spring class usage');
	assert.match(combined, /\bnew Tween\b/, 'Expected Svelte 5 Tween class usage');
	assert.match(combined, /\bprefersReducedMotion\b/, 'Expected prefersReducedMotion usage');
	assert.match(combined, /\bcrossfade\b/, 'Expected svelte/transition crossfade usage');
	assert.match(combined, /\banimate:flip\b/, 'Expected svelte/animate flip usage');
	assert.match(combined, /\btransition:slide\b/, 'Expected svelte/transition slide usage');
	assert.match(combined, /\bin:fly\b/, 'Expected svelte/transition fly usage');
	assert.match(combined, /\bin:scale\b/, 'Expected svelte/transition scale usage');
	assert.match(combined, /\bnew SvelteSet\b/, 'Expected svelte/reactivity SvelteSet usage');
	assert.match(combined, /\bnew SvelteMap\b/, 'Expected svelte/reactivity SvelteMap usage');
	assert.match(combined, /\{#snippet\s+\w+/, 'Expected Svelte 5 {#snippet} blocks');
	assert.match(combined, /\{@render\s+\w+/, 'Expected Svelte 5 {@render} calls');
});
