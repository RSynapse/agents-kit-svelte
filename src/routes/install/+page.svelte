<script lang="ts">
	import CodeBlock from '$lib/agents/CodeBlock.svelte';
	import ThinkingShimmer from '$lib/agents/ThinkingShimmer.svelte';
	import TodoList from '$lib/agents/TodoList.svelte';
	import type { TodoItem } from '$lib/types';

	type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';
	const MANAGERS: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun'];
	const INSTALL: Record<PackageManager, string> = {
		pnpm: 'pnpm add agents-kit-svelte',
		npm: 'npm install agents-kit-svelte',
		yarn: 'yarn add agents-kit-svelte',
		bun: 'bun add agents-kit-svelte'
	};

	let manager = $state<PackageManager>('pnpm');

	const TAILWIND_SETUP = `pnpm add -D tailwindcss @tailwindcss/vite`;

	const VITE_CONFIG = `// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});`;

	const APP_CSS = `/* src/app.css */
@import "tailwindcss";
@import "agents-kit-svelte/theme.css";

/* Let Tailwind see the utility classes the components use */
@source "../node_modules/agents-kit-svelte/dist";`;

	const USAGE = `<script lang="ts">
	import { ThinkingShimmer, TodoList, type TodoItem } from 'agents-kit-svelte';

	const items: TodoItem[] = [
		{ id: '1', label: 'Install agents-kit-svelte', status: 'completed' },
		{ id: '2', label: 'Import the theme', status: 'completed' },
		{ id: '3', label: 'Ship your agent UI', status: 'in-progress' }
	];
<\/script>

<ThinkingShimmer label="Planning the next step…" />
<TodoList title="Getting started" {items} />`;

	const DARK_MODE = `// Dark mode: add the "dark" class (or data-theme="dark") to <html>
document.documentElement.classList.toggle('dark', true);`;

	const demoItems: TodoItem[] = [
		{ id: '1', label: 'Install agents-kit-svelte', status: 'completed' },
		{ id: '2', label: 'Import the theme', status: 'completed' },
		{ id: '3', label: 'Ship your agent UI', status: 'in-progress' }
	];
</script>

<svelte:head>
	<title>Install · Agents Kit Svelte</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6">
	<header class="space-y-2 border-b border-canvas-border pb-6">
		<span class="font-mono text-xs font-semibold uppercase tracking-wider text-accent-primary">
			Get started
		</span>
		<h1 class="text-2xl font-bold text-fg-main">Install Agents Kit Svelte</h1>
		<p class="text-sm text-fg-light">
			Svelte 5 components for AI agent interfaces. Requires Svelte 5 and Tailwind CSS v4. Works in
			SvelteKit or any Vite + Svelte app.
		</p>
	</header>

	<section class="space-y-3" aria-labelledby="step-install">
		<h2 id="step-install" class="text-base font-semibold text-fg-main">1. Add the package</h2>
		<div role="tablist" aria-label="Package manager" class="flex w-fit rounded-lg border border-card-border bg-canvas-secondary p-1 text-xs">
			{#each MANAGERS as option (option)}
				<button
					type="button"
					role="tab"
					aria-selected={manager === option}
					onclick={() => (manager = option)}
					class="rounded-md px-3 py-1 font-mono font-medium transition-colors {manager === option
						? 'bg-card-bg text-fg-main'
						: 'text-fg-light hover:text-fg-main'}"
				>
					{option}
				</button>
			{/each}
		</div>
		<CodeBlock code={INSTALL[manager]} language="bash" />
	</section>

	<section class="space-y-3" aria-labelledby="step-tailwind">
		<h2 id="step-tailwind" class="text-base font-semibold text-fg-main">2. Set up Tailwind CSS v4</h2>
		<p class="text-sm text-fg-light">Skip this if your app already uses Tailwind v4.</p>
		<CodeBlock code={TAILWIND_SETUP} language="bash" />
		<CodeBlock code={VITE_CONFIG} language="ts" filename="vite.config.ts" />
	</section>

	<section class="space-y-3" aria-labelledby="step-theme">
		<h2 id="step-theme" class="text-base font-semibold text-fg-main">3. Import the theme</h2>
		<p class="text-sm text-fg-light">
			The theme adds the OKLCH design tokens, light and dark palettes, and the
			<code class="font-mono text-xs">@source</code> line lets Tailwind generate the classes the components use.
		</p>
		<CodeBlock code={APP_CSS} language="css" filename="src/app.css" />
		<CodeBlock code={DARK_MODE} language="ts" />
	</section>

	<section class="space-y-3" aria-labelledby="step-use">
		<h2 id="step-use" class="text-base font-semibold text-fg-main">4. Use a component</h2>
		<CodeBlock code={USAGE} language="svelte" filename="src/routes/+page.svelte" />
		<div class="space-y-3 rounded-xl border border-card-border bg-card-bg p-4">
			<span class="block font-mono text-[11px] font-semibold uppercase tracking-wider text-fg-light">Result</span>
			<ThinkingShimmer label="Planning the next step…" />
			<TodoList title="Getting started" items={demoItems} />
		</div>
	</section>
</div>
