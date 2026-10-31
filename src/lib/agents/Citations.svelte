<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { pillClass } from '../ui/styles';
	import { ChevronDown, Globe } from '@lucide/svelte';
	import AgentDisclosure from './AgentDisclosure.svelte';
	import type { CitationItem } from '../types';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'citations' | 'title' | 'defaultOpen'> {
		citations: CitationItem[];
		title?: string;
		defaultOpen?: boolean;
		class?: string;
	}

	let {
		citations,
		title = 'Sources',
		defaultOpen = false,
		class: className = '',
		...rest
	}: Props = $props();

	let isOpen = $state(false);

	$effect(() => {
		isOpen = defaultOpen;
	});

	let panelId = $derived(`citations-${citations[0]?.id ?? 'panel'}`);
</script>

<div {...rest} class={cn('w-full text-xs', className)}>
	<button
		type="button"
		aria-expanded={isOpen}
		aria-controls={panelId}
		onclick={() => (isOpen = !isOpen)}
		class={pillClass('secondary', 'sm', 'group')}
	>
		<Globe aria-hidden="true" class="size-3.5 text-fg-light" />
		<span>{title}</span>
		<span class="rounded-full bg-chat-surface px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-fg-main">
			{citations.length}
		</span>
		<ChevronDown aria-hidden="true" class="size-3.5 transition-transform duration-150 {isOpen ? 'rotate-180' : ''}" />
	</button>

	<AgentDisclosure id={panelId} open={isOpen}>
		<ul class="mt-2 grid gap-1 rounded-soft border border-chat-border bg-card-bg ak-shadow-soft-sm p-1.5">
			{#each citations as citation, idx (citation.id)}
				<li>
					{#if citation.url}
						<a
							href={citation.url}
							target="_blank"
							rel="noreferrer noopener"
							class="flex items-center justify-between gap-2 rounded-[10px] px-2.5 py-1.5 text-fg-main transition-colors hover:bg-chat-surface"
						>
							<span class="truncate font-medium">{citation.title}</span>
							<span class="flex shrink-0 items-center gap-1.5 text-xs text-fg-light">
								{#if citation.domain}
									<span>{citation.domain}</span>
								{/if}
								<span class="rounded bg-chat-surface px-1.5 py-0.5">{idx + 1}</span>
							</span>
						</a>
					{:else}
						<div class="flex items-center justify-between gap-2 rounded-[10px] px-2.5 py-1.5 text-fg-main">
							<span class="truncate font-medium">{citation.title}</span>
							<span class="rounded bg-chat-surface px-1.5 py-0.5 font-mono text-[11px] text-fg-light">
								{idx + 1}
							</span>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	</AgentDisclosure>
</div>
