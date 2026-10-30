<script lang="ts">
	import type { Snippet } from 'svelte';

	export type MessageBubbleVariant = 'solid' | 'soft' | 'tint' | 'outline' | 'ghost' | 'danger';
	export type MessageBubbleAlign = 'start' | 'end';

	interface Props {
		author?: string;
		avatar?: string;
		timestamp?: string;
		status?: 'sending' | 'sent' | 'delivered' | 'streaming' | 'error';
		variant?: MessageBubbleVariant;
		align?: MessageBubbleAlign;
		text?: string;
		collapsible?: boolean;
		collapsedLines?: 2 | 3 | 4 | 5 | 6;
		defaultOpen?: boolean;
		moreLabel?: string;
		lessLabel?: string;
		onOpenChange?: (open: boolean) => void;
		children?: Snippet;
		class?: string;
	}

	const DEFAULT_TEXT =
		'Completed verification on the isolated worktree branch. All 19 unit and contract suites pass with zero regressions. Expanded logs include full unified diff hunks, schema validation traces, and referee sign-off details.';

	let {
		author = 'Claude Code',
		avatar = 'CC',
		timestamp = '14:32 UTC',
		status = 'delivered',
		variant = 'soft',
		align = 'start',
		text = DEFAULT_TEXT,
		collapsible = true,
		collapsedLines = 3,
		defaultOpen = false,
		moreLabel = 'Show more',
		lessLabel = 'Show less',
		onOpenChange,
		children,
		class: className = ''
	}: Props = $props();

	let isExpanded = $state(false);

	$effect(() => {
		isExpanded = defaultOpen;
	});

	/**
	 * Maps a variant name to semantic surface classes.
	 *
	 * @param currentVariant - Bubble visual variant.
	 * @returns Semantic Tailwind background, border, and text classes.
	 */
	function getVariantClasses(currentVariant: MessageBubbleVariant): string {
		switch (currentVariant) {
			case 'solid':
				return 'bg-accent-primary text-fg-inverse border-transparent';
			case 'tint':
				return 'bg-accent-subtle text-fg-main border-card-border';
			case 'outline':
				return 'bg-card-bg text-fg-main border-card-border';
			case 'danger':
				return 'bg-status-danger-subtle text-status-danger border-status-danger';
			case 'ghost':
				return 'bg-transparent text-fg-main border-transparent px-0 py-0';
			case 'soft':
			default:
				return 'bg-canvas-secondary text-fg-main border-card-border';
		}
	}

	/**
	 * Maps the configured line count to a Tailwind line-clamp utility class.
	 *
	 * @param lines - Number of lines to clamp when collapsed.
	 * @returns Tailwind line-clamp class string.
	 */
	function getClampClass(lines: 2 | 3 | 4 | 5 | 6): string {
		const map: Record<2 | 3 | 4 | 5 | 6, string> = {
			2: 'line-clamp-2',
			3: 'line-clamp-3',
			4: 'line-clamp-4',
			5: 'line-clamp-5',
			6: 'line-clamp-6'
		};
		return map[lines];
	}

	/**
	 * Toggles the collapsible disclosure state and notifies parent callback.
	 */
	function toggleCollapsible(): void {
		const next = !isExpanded;
		isExpanded = next;
		onOpenChange?.(next);
	}
</script>

<div
	data-slot="message-bubble"
	data-align={align}
	data-variant={variant}
	class="flex w-full gap-2.5 {align === 'end' ? 'flex-row-reverse' : 'flex-row'} {className}"
>
	<div
		aria-hidden="true"
		class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-card-border bg-accent-subtle font-mono text-xs font-bold text-accent-primary"
	>
		{avatar}
	</div>

	<div class="flex min-w-0 max-w-[84%] flex-col {align === 'end' ? 'items-end' : 'items-start'}">
		<div class="mb-1 flex items-center gap-2 text-xs text-fg-light">
			<span class="font-semibold text-fg-main">{author}</span>
			{#if timestamp}
				<span class="font-mono text-[11px]">{timestamp}</span>
			{/if}
			{#if status}
				<span
					class="rounded-full px-1.5 py-0.5 font-mono text-[10px] {status === 'error'
						? 'bg-status-danger-subtle text-status-danger'
						: 'bg-canvas-secondary text-fg-light'}"
				>
					{status}
				</span>
			{/if}
		</div>

		<div
			data-slot="message-bubble-content"
			class="relative rounded-2xl border px-3.5 py-2.5 text-sm leading-6 {getVariantClasses(variant)}"
		>
			<div class={!isExpanded && collapsible ? getClampClass(collapsedLines) : ''}>
				{#if children}
					{@render children()}
				{:else}
					<p>{text}</p>
				{/if}
			</div>

			{#if collapsible}
				<button
					type="button"
					aria-expanded={isExpanded}
					onclick={toggleCollapsible}
					class="mt-1.5 inline-flex items-center gap-1 rounded-full bg-card-bg px-2.5 py-0.5 font-mono text-[11px] font-medium text-fg-light transition-colors hover:text-fg-main"
				>
					<span>{isExpanded ? lessLabel : moreLabel}</span>
					<span aria-hidden="true" class="transition-transform {isExpanded ? 'rotate-180' : ''}">
						▾
					</span>
				</button>
			{/if}
		</div>
	</div>
</div>
