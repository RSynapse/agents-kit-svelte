import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { validateSvelte5ComponentSource } from '../src/lib/state/chat-helpers.ts';

/**
 * Recursively collects all `.svelte` files under a directory.
 *
 * @param dir - Directory path to walk.
 * @returns Array of absolute file paths ending in `.svelte`.
 */
function collectSvelteFiles(dir: string): string[] {
	const entries = readdirSync(dir);
	const files: string[] = [];
	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);
		if (stat.isDirectory()) {
			files.push(...collectSvelteFiles(fullPath));
		} else if (entry.endsWith('.svelte')) {
			files.push(fullPath);
		}
	}
	return files;
}

test('all Svelte components in src/ comply with Svelte 5 Runes, Props typing, and semantic token rules', () => {
	const srcDir = join(process.cwd(), 'src');
	const svelteFiles = collectSvelteFiles(srcDir);
	assert.ok(svelteFiles.length > 0, 'Expected at least one .svelte file in src/');

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
