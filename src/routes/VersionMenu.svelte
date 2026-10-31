<script lang="ts">
	import { base } from '$app/paths';
	import { Check, ChevronDown, Download, GitBranch, ScrollText } from '@lucide/svelte';
	import { rise } from '$lib/state/motion.svelte';

	const REPO = 'https://github.com/RSynapse/agents-kit-svelte';
	const VERSION = 'v0.1';

	let open = $state(false);
	let root: HTMLDivElement | undefined = $state();
	let trigger: HTMLButtonElement | undefined = $state();

	const LINKS = [
		{ href: `${base}/install/`, label: 'Install guide', Icon: Download, external: false },
		{ href: `${REPO}/commits/main`, label: 'Recent changes', Icon: ScrollText, external: true },
		{ href: REPO, label: 'Source on GitHub', Icon: GitBranch, external: true }
	];

	function close(focusTrigger = false): void {
		open = false;
		if (focusTrigger) trigger?.focus();
	}

	/** Arrow keys move between items; Escape closes and returns focus to the trigger. */
	function onMenuKey(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			close(true);
			return;
		}
		if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();
		const items = Array.from(
			(event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="menuitem"]')
		);
		const current = items.indexOf(document.activeElement as HTMLElement);
		const next =
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? items.length - 1
					: event.key === 'ArrowDown'
						? (current + 1) % items.length
						: (current - 1 + items.length) % items.length;
		items[next]?.focus();
	}

	function onTriggerKey(event: KeyboardEvent): void {
		if (event.key !== 'ArrowDown') return;
		event.preventDefault();
		open = true;
		queueMicrotask(() => root?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
	}

	$effect(() => {
		if (!open) return;
		const onPointer = (event: PointerEvent) => {
			if (root && !root.contains(event.target as Node)) close();
		};
		document.addEventListener('pointerdown', onPointer);
		return () => document.removeEventListener('pointerdown', onPointer);
	});
</script>

<div bind:this={root} class="relative">
	<button
		bind:this={trigger}
		type="button"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label="Library version {VERSION}, Svelte 5"
		onclick={() => (open = !open)}
		onkeydown={onTriggerKey}
		class="inline-flex h-7 items-center gap-1 rounded-full border border-card-border bg-card-bg pr-2 pl-2.5 text-xs text-fg-light transition-colors hover:text-fg-main {open
			? 'text-fg-main'
			: ''}"
	>
		<span class="font-medium text-fg-main">{VERSION}</span>
		<span class="text-fg-light">· Svelte 5</span>
		<ChevronDown aria-hidden="true" class="size-3.5 transition-transform duration-200 {open ? 'rotate-180' : ''}" />
	</button>

	{#if open}
		<div
			role="menu"
			tabindex="-1"
			aria-label="Library version"
			transition:rise={{ y: 4, duration: 140 }}
			onkeydown={onMenuKey}
			class="absolute top-9 right-0 z-50 w-60 sm:right-auto sm:left-0 rounded-soft border border-card-border bg-card-bg p-1.5 ak-shadow-soft"
		>
			<p class="px-2.5 pt-1 pb-1.5 text-[11px] font-medium text-fg-light">Version</p>
			<div class="flex items-center gap-2.5 rounded-[10px] bg-canvas-secondary px-2.5 py-2">
				<span class="min-w-0 flex-1">
					<span class="block text-[13px] font-medium text-fg-main">{VERSION} · Svelte 5</span>
					<span class="block text-[11px] text-fg-light">Latest · Svelte 5 runes, Tailwind v4</span>
				</span>
				<Check aria-hidden="true" class="size-4 shrink-0 text-accent-primary" />
			</div>

			<div class="my-1.5 h-px bg-canvas-border" role="separator"></div>

			{#each LINKS as link (link.href)}
				<a
					role="menuitem"
					href={link.href}
					target={link.external ? '_blank' : undefined}
					rel={link.external ? 'noopener noreferrer' : undefined}
					onclick={() => close()}
					class="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-fg-main no-underline transition-colors outline-none hover:bg-canvas-secondary focus-visible:bg-canvas-secondary"
				>
					<link.Icon aria-hidden="true" class="size-3.5 text-fg-light" />
					{link.label}
				</a>
			{/each}
		</div>
	{/if}
</div>
