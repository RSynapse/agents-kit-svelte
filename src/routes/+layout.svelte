<script lang="ts">
	import { buttonClass } from '$lib/ui/styles';
	import { Moon, Sun } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import '../app.css';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let isDark = $state(false);
	let ready = $state(false);

	const NAV_LINKS = [
		{ href: `${base}/`, match: `${base}/`, label: 'Components' },
		{ href: `${base}/claude-code/`, match: `${base}/claude-code`, label: 'AK-S Chat' },
		{ href: `${base}/github/`, match: `${base}/github`, label: 'GitHub Suite' },
		{ href: `${base}/intelligent-ui/`, match: `${base}/intelligent-ui`, label: 'Playground' }
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
	<header class="sticky top-0 z-40 border-b border-canvas-border bg-canvas-primary">
		<div class="mx-auto flex min-h-16 max-w-[1440px] flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2 sm:h-16 sm:flex-nowrap sm:px-6 sm:py-0">
			<div class="flex items-center gap-2.5 sm:gap-3">
				<a
					href="{base}/"
					class="flex items-center gap-2 text-sm font-semibold whitespace-nowrap text-fg-main no-underline"
				>
					<span
						class="inline-flex size-6 items-center justify-center rounded-md bg-fg-main font-mono text-[11px] font-bold text-fg-inverse"
					>
						AK
					</span>
					<span>Agents Kit</span>
					<span class="font-mono text-xs font-medium text-fg-light">Svelte</span>
				</a>
				<select
					aria-label="Library version"
					class="h-7 rounded-control border border-card-border bg-card-bg px-1.5 text-xs text-fg-light"
				>
					<option value="0.1">v0.1 · Svelte 5</option>
				</select>
			</div>

			<nav
				aria-label="Showcase primary navigation"
				class="order-last flex w-full items-center justify-between text-xs sm:order-none sm:ml-auto sm:w-auto sm:justify-start sm:gap-1 sm:text-sm"
			>
				{#each NAV_LINKS as item (item.href)}
					{@const normalizedPath = page.url.pathname.replace(/\/+$/, '') || '/'}
					{@const normalizedMatch = item.match.replace(/\/+$/, '') || '/'}
					{@const active = normalizedPath === normalizedMatch}
					<a
						href={item.href}
						aria-current={active ? 'page' : undefined}
						class="rounded-control px-2.5 py-1.5 font-medium no-underline transition-colors sm:px-3 {active
							? 'bg-canvas-secondary text-fg-main'
							: 'text-fg-light hover:bg-canvas-secondary hover:text-fg-main'}"
					>
						{item.label}
					</a>
				{/each}
				<a
					href="{base}/#svelte5-motion-lab"
					class="rounded-control px-2.5 py-1.5 font-medium text-fg-light no-underline transition-colors hover:bg-canvas-secondary hover:text-fg-main sm:px-3"
				>
					Motion Lab
				</a>
			</nav>

			<div class="flex items-center gap-2">
				<button
					type="button"
					disabled={!ready}
					aria-label="Toggle global color theme"
					onclick={() => (isDark = !isDark)}
					title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
					class={buttonClass('ghost', 'icon')}
				>
					{#if isDark}<Sun aria-hidden="true" />{:else}<Moon aria-hidden="true" />{/if}
				</button>
			</div>
		</div>
	</header>

	{@render children()}
</div>
