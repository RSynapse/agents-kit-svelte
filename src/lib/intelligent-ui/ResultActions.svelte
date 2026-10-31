<script lang="ts">
	import { Bookmark, Check, Columns2, Copy, Download, Maximize2, Minimize2, Pencil } from '@lucide/svelte';
	import { buttonClass, toggleButtonClass } from '../ui/styles';
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
	class="inline-flex flex-wrap items-center gap-0.5 rounded-control border border-card-border bg-card-bg p-0.5 ak-shadow-btn {className}"
>
	<button
		type="button"
		aria-pressed={actionState === 'expanded'}
		onclick={onExpand}
		class={toggleButtonClass(actionState === 'expanded')}
	>
		{#if actionState === 'expanded'}
			<Minimize2 aria-hidden="true" />
			Collapse
		{:else}
			<Maximize2 aria-hidden="true" />
			Expand
		{/if}
	</button>

	<button
		type="button"
		aria-pressed={actionState === 'editing'}
		onclick={onEdit}
		class={toggleButtonClass(actionState === 'editing')}
	>
		<Pencil aria-hidden="true" />
		Edit
	</button>

	<button
		type="button"
		aria-pressed={actionState === 'comparing'}
		onclick={onCompare}
		class={toggleButtonClass(actionState === 'comparing')}
	>
		<Columns2 aria-hidden="true" />
		Compare
	</button>

	<span aria-hidden="true" class="mx-0.5 h-4 w-px bg-canvas-border"></span>

	<button
		type="button"
		aria-pressed={saved}
		aria-label={saved ? 'Remove from saved' : 'Save result'}
		onclick={onSave}
		class={toggleButtonClass(saved, 'icon-sm')}
	>
		<Bookmark aria-hidden="true" class={saved ? 'fill-current' : ''} />
	</button>

	<button
		type="button"
		aria-label={copied ? 'Copied' : 'Copy result'}
		onclick={handleCopy}
		class={buttonClass('ghost', 'icon-sm')}
	>
		{#if copied}<Check aria-hidden="true" class="text-status-success" />{:else}<Copy aria-hidden="true" />{/if}
	</button>

	{#if onDownload}
		<button
			type="button"
			aria-label="Download as Markdown"
			onclick={onDownload}
			class={buttonClass('ghost', 'icon-sm')}
		>
			<Download aria-hidden="true" />
		</button>
	{/if}
</div>
