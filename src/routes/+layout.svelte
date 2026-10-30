<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import '../app.css';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let isDark = $state(false);
	let ready = $state(false);

	const NAV_LINKS = [
		{ href: '/', label: 'Component Catalogue (60+)' },
		{ href: '/claude-code', label: 'Claude Code Workbench' },
		{ href: '/github', label: 'GitHub Cards & Layouts' },
		{ href: '/intelligent-ui', label: 'Intelligent UI Engine' }
	];

	$effect(() => {
		ready = true;
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', isDark);
			document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
		}
	});
</script>

<div class="min-h-screen bg-canvas-primary text-fg-main">
	<nav
		aria-label="Showcase primary navigation"
		class="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-canvas-border bg-card-bg px-4 py-2.5 sm:px-6"
	>
		<div class="flex items-center gap-3">
			<a
				href="/"
				class="flex items-center gap-2 font-mono text-sm font-bold text-fg-main no-underline"
			>
				<span
					class="inline-flex size-6 items-center justify-center rounded-md bg-fg-main text-xs text-fg-inverse"
				>
					AK
				</span>
				<span>agents-kit-svelte</span>
			</a>
			<span
				class="hidden rounded-full border border-card-border bg-canvas-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-primary sm:inline-block"
			>
				Svelte 5 Runes · Intelligent UI · GitHub Suite
			</span>
		</div>

		<div class="flex flex-wrap items-center gap-1 text-xs">
			{#each NAV_LINKS as item (item.href)}
				{@const active = page.url.pathname === item.href}
				<a
					href={item.href}
					aria-current={active ? 'page' : undefined}
					class="rounded-lg px-3 py-1.5 font-semibold no-underline transition-colors {active
						? 'bg-accent-subtle text-accent-primary'
						: 'text-fg-light hover:bg-canvas-secondary hover:text-fg-main'}"
				>
					{item.label}
				</a>
			{/each}

			<button
				type="button"
				disabled={!ready}
				aria-label="Toggle global color theme"
				onclick={() => (isDark = !isDark)}
				class="ml-2 rounded-lg border border-card-border bg-canvas-secondary px-2.5 py-1.5 font-mono text-xs font-medium text-fg-main transition-colors hover:bg-canvas-primary"
			>
				{isDark ? '☀ Light' : '☾ Dark'}
			</button>
		</div>
	</nav>

	{@render children()}
</div>
