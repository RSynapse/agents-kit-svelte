<script lang="ts">
	import AgentDisclosure from './AgentDisclosure.svelte';
	import type { CitationItem } from '../types';

	interface Props {
		citations: CitationItem[];
		title?: string;
		defaultOpen?: boolean;
		class?: string;
	}

	let {
		citations,
		title = 'Sources',
		defaultOpen = false,
		class: className = ''
	}: Props = $props();

	let isOpen = $state(false);

	$effect(() => {
		isOpen = defaultOpen;
	});

	let panelId = $derived(`citations-${citations[0]?.id ?? 'panel'}`);
</script>

<div class="w-full text-xs {className}">
	<button
		type="button"
		aria-expanded={isOpen}
		aria-controls={panelId}
		onclick={() => (isOpen = !isOpen)}
		class="inline-flex items-center gap-1.5 rounded-md border border-card-border bg-canvas-secondary px-2.5 py-1 font-medium text-fg-light transition-colors hover:text-fg-main"
	>
		<span>📚 {title}</span>
		<span class="rounded-full bg-card-bg px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-fg-main">
			{citations.length}
		</span>
		<span
			aria-hidden="true"
			class="transition-transform duration-150 {isOpen ? 'rotate-180' : ''}"
		>
			▾
		</span>
	</button>

	<AgentDisclosure id={panelId} open={isOpen}>
		<ul class="mt-2 grid gap-1 rounded-lg border border-card-border bg-card-bg p-2">
			{#each citations as citation, idx (citation.id)}
				<li>
					{#if citation.url}
						<a
							href={citation.url}
							target="_blank"
							rel="noreferrer noopener"
							class="flex items-center justify-between gap-2 rounded px-2 py-1 text-fg-main transition-colors hover:bg-canvas-secondary"
						>
							<span class="truncate font-medium">{citation.title}</span>
							<span class="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-fg-light">
								{#if citation.domain}
									<span>{citation.domain}</span>
								{/if}
								<span class="rounded bg-canvas-secondary px-1.5 py-0.5">[{idx + 1}]</span>
							</span>
						</a>
					{:else}
						<div class="flex items-center justify-between gap-2 rounded px-2 py-1 text-fg-main">
							<span class="truncate font-medium">{citation.title}</span>
							<span class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px] text-fg-light">
								[{idx + 1}]
							</span>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	</AgentDisclosure>
</div>
