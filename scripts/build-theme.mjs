// Emits dist/theme.css from src/app.css so the site and the npm package share one
// source of truth for design tokens. The `@import "tailwindcss"` line is dropped:
// consumers import Tailwind themselves, then this file.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const source = readFileSync(new URL('../src/app.css', import.meta.url), 'utf8');
const out = new URL('../dist/theme.css', import.meta.url);

if (!existsSync(new URL('../dist/', import.meta.url))) {
	console.error('dist/ is missing: run svelte-package first.');
	process.exit(1);
}

const body = source.replace(/^\s*@import\s+["']tailwindcss["'];?\s*$/m, '').trimStart();
if (/@import\s+["']tailwindcss["']/.test(body)) {
	console.error('Unexpected extra tailwindcss import in src/app.css.');
	process.exit(1);
}

const banner = `/*
 * agents-kit-svelte theme: OKLCH design tokens, light/dark variables and helper classes.
 * Usage (Tailwind v4), in your app's main CSS file:
 *   @import "tailwindcss";
 *   @import "agents-kit-svelte/theme.css";
 *   @source "../node_modules/agents-kit-svelte/dist";
 */
`;

writeFileSync(out, banner + body);
console.log('Wrote dist/theme.css');
