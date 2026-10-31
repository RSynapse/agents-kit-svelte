/**
 * Code samples shown on /install. They live in a plain module because Vite's dependency
 * scanner reads import statements inside a .svelte <script>, even in strings, and tried to
 * pre-bundle `@tailwindcss/vite` for the browser, which crashed the dev server.
 */

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';
export const MANAGERS: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun'];
export const INSTALL: Record<PackageManager, string> = {
	pnpm: 'pnpm add agents-kit-svelte',
	npm: 'npm install agents-kit-svelte',
	yarn: 'yarn add agents-kit-svelte',
	bun: 'bun add agents-kit-svelte'
};

export const TAILWIND_SETUP = `pnpm add -D tailwindcss @tailwindcss/vite`;

export const VITE_CONFIG = `// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});`;

export const APP_CSS = `/* src/app.css */
@import "tailwindcss";
@import "agents-kit-svelte/theme.css";

/* Let Tailwind see the utility classes the components use */
@source "../node_modules/agents-kit-svelte/dist";`;

export const USAGE = `<script lang="ts">
	import { ThinkingShimmer, TodoList, type TodoItem } from 'agents-kit-svelte';

	const items: TodoItem[] = [
		{ id: '1', label: 'Install agents-kit-svelte', status: 'completed' },
		{ id: '2', label: 'Import the theme', status: 'completed' },
		{ id: '3', label: 'Ship your agent UI', status: 'in-progress' }
	];
</script>

<ThinkingShimmer label="Planning the next step…" />
<TodoList title="Getting started" {items} />`;

export const DARK_MODE = `// Dark mode: add the "dark" class (or data-theme="dark") to <html>
document.documentElement.classList.toggle('dark', true);`;
