<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		role: 'user' | 'assistant' | 'system';
		author: string;
		badge?: string;
		timestamp?: string;
		class?: string;
		children: Snippet;
	}

	let {
		id,
		role,
		author,
		badge,
		timestamp,
		class: className = '',
		children
	}: Props = $props();
</script>

<article
	{id}
	data-role={role}
	class="flex w-full gap-3 {role === 'user' ? 'justify-end' : 'justify-start'} {className}"
>
	{#if role !== 'user'}
		<div
			aria-hidden="true"
			class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-card-border bg-accent-subtle font-mono text-xs font-bold text-accent-primary"
		>
			{author.slice(0, 2).toUpperCase()}
		</div>
	{/if}

	<div class="min-w-0 {role === 'user' ? 'max-w-[82%]' : 'flex-1'} space-y-2">
		<header
			class="flex items-center gap-2 text-xs {role === 'user' ? 'justify-end' : 'justify-start'}"
		>
			<span class="font-semibold text-fg-main">{author}</span>
			{#if badge}
				<span
					class="rounded-full border border-card-border bg-canvas-secondary px-2 py-0.5 font-mono text-[10px] text-fg-light"
				>
					{badge}
				</span>
			{/if}
			{#if timestamp}
				<span class="font-mono text-[11px] text-fg-light">{timestamp}</span>
			{/if}
		</header>

		{#if role === 'user'}
			<div
				class="rounded-2xl rounded-tr-sm border border-card-border bg-canvas-secondary px-3.5 py-2.5 text-sm leading-6 text-fg-main"
			>
				{@render children()}
			</div>
		{:else}
			<div class="space-y-3">
				{@render children()}
			</div>
		{/if}
	</div>
</article>
