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
	data-slot="message"
	data-from={role}
	data-role={role}
	class="flex w-full gap-3 {role === 'user' ? 'justify-end' : 'justify-start'} {className}"
>
	{#if role !== 'user'}
		<div
			aria-hidden="true"
			class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-card-border bg-card-bg font-mono text-[11px] font-semibold text-fg-main"
		>
			{author.slice(0, 2).toUpperCase()}
		</div>
	{/if}

	<div class="min-w-0 {role === 'user' ? 'max-w-[82%]' : 'flex-1'} space-y-2.5">
		<header
			class="flex items-center gap-2 text-xs {role === 'user' ? 'justify-end' : 'justify-start'}"
		>
			<span class="font-medium text-fg-main">{author}</span>
			{#if badge}
				<span
					class="rounded-md bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] text-fg-light"
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
				data-slot="message-content"
				class="rounded-2xl rounded-tr-sm border border-card-border bg-canvas-secondary px-3.5 py-2.5 text-sm leading-6 text-fg-main"
			>
				{@render children()}
			</div>
		{:else}
			<div data-slot="message-content" class="space-y-3.5">
				{@render children()}
			</div>
		{/if}
	</div>
</article>
