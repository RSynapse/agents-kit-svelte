<script lang="ts">
	import { Check, Download, GitCompare, Pencil, Star } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	import type { ResultActionState } from '../types';

	interface Props {
		state?: ResultActionState;
		saved?: boolean;
		onExpand?: () => void;
		onEdit?: () => void;
		onCompare?: () => void;
		onSave?: () => void;
		onCopy?: () => void;
		onDownload?: () => void;
		class?: string;
	}

	let {
		state: actionState = 'view',
		saved = false,
		onExpand,
		onEdit,
		onCompare,
		onSave,
		onCopy,
		onDownload,
		class: className = ''
	}: Props = $props();

	let copied = $state(false);

	/**
	 * Triggers copy feedback and delegates to `onCopy`.
	 */
	function handleCopy(): void {
		copied = true;
		onCopy?.();
		window.setTimeout(() => {
			copied = false;
		}, 1400);
	}
</script>

<div
	role="toolbar"
	aria-label="Generated result actions"
	class="inline-flex flex-wrap items-center gap-1 rounded-xl border border-card-border bg-canvas-secondary p-1 text-xs {className}"
>
	<button
		type="button"
		aria-pressed={actionState === 'expanded'}
		onclick={onExpand}
		class="rounded-lg px-2.5 py-1 font-medium transition-colors {actionState === 'expanded'
			? 'bg-card-bg text-fg-main shadow-xs'
			: 'text-fg-light hover:text-fg-main'}"
	>
		{actionState === 'expanded' ? '↙ Collapse' : '↗ Expand'}
	</button>

	<button
		type="button"
		aria-pressed={actionState === 'editing'}
		onclick={onEdit}
		class="rounded-lg px-2.5 py-1 font-medium transition-colors {actionState === 'editing'
			? 'bg-card-bg text-fg-main shadow-xs'
			: 'text-fg-light hover:text-fg-main'}"
	>
		<Pencil aria-hidden="true" />
		Edit
	</button>

	<button
		type="button"
		aria-pressed={actionState === 'comparing'}
		onclick={onCompare}
		class="rounded-lg px-2.5 py-1 font-medium transition-colors {actionState === 'comparing'
			? 'bg-card-bg text-fg-main shadow-xs'
			: 'text-fg-light hover:text-fg-main'}"
	>
		<GitCompare aria-hidden="true" />
		Compare
	</button>

	<button
		type="button"
		aria-pressed={saved}
		onclick={onSave}
		class="rounded-lg px-2.5 py-1 font-medium transition-colors {saved
			? 'bg-accent-subtle text-accent-primary'
			: 'text-fg-light hover:text-fg-main'}"
	>
		{#if saved}<Star aria-hidden="true" />Saved{:else}<Star aria-hidden="true" />Save{/if}
	</button>

	<button
		type="button"
		onclick={handleCopy}
		class={buttonClass('ghost', 'sm')}
	>
		{#if copied}<Check aria-hidden="true" />Copied{:else}Copy{/if}
	</button>

	{#if onDownload}
		<button
			type="button"
			onclick={onDownload}
			class={buttonClass('ghost', 'sm')}
		>
			<Download aria-hidden="true" />
			.md
		</button>
	{/if}
</div>
