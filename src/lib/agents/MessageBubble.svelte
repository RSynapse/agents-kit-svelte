<script lang="ts">
	import { pillClass } from '../ui/styles';
	import { ChevronDown } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	export type MessageBubbleVariant = 'solid' | 'soft' | 'tint' | 'outline' | 'ghost' | 'danger';
	export type MessageBubbleAlign = 'start' | 'end';

	interface Props {
		id?: string;
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
		id,
		author = 'AK-S Agent',
		avatar = 'AK',
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
				return 'bg-fg-main text-fg-inverse border-transparent';
			case 'tint':
				return 'bg-chat-accent-subtle text-fg-main border-transparent';
			case 'outline':
				return 'bg-card-bg text-fg-main border-chat-border ak-shadow-soft-sm';
			case 'danger':
				return 'bg-status-danger-subtle text-status-danger border-status-danger/30';
			case 'ghost':
				return 'bg-transparent text-fg-main border-transparent px-0 py-0';
			case 'soft':
			default:
				return 'bg-chat-user text-fg-main border-transparent';
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
	{id}
	data-slot="message"
	data-from={align === 'end' ? 'user' : 'assistant'}
	data-align={align}
	data-variant={variant}
	class="flex w-full gap-2.5 {align === 'end' ? 'flex-row-reverse' : 'flex-row'} {className}"
>
	<div
		aria-hidden="true"
		class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full {align === 'end'
			? 'bg-chat-user text-fg-main'
			: 'bg-chat-accent-subtle text-chat-accent'} text-[11px] font-semibold"
	>
		{avatar}
	</div>

	<div class="flex min-w-0 max-w-[84%] flex-col {align === 'end' ? 'items-end' : 'items-start'}">
		<div class="mb-1 flex items-center gap-2 text-xs text-fg-light">
			<span class="font-medium text-fg-main">{author}</span>
			{#if timestamp}
				<span class="tabular-nums">{timestamp}</span>
			{/if}
			{#if status}
				<span
					class="rounded-full px-2 py-px text-[11px] {status === 'error'
						? 'bg-status-danger-subtle text-status-danger'
						: 'bg-chat-user text-fg-light'}"
				>
					{status}
				</span>
			{/if}
		</div>

		<div
			data-slot="message-bubble-content"
			class="relative rounded-bubble border px-4 py-2.5 text-[15px] leading-6 {align === 'end'
				? 'rounded-br-md'
				: 'rounded-bl-md'} {getVariantClasses(variant)}"
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
					class={pillClass('ghost', 'xs', '-ml-2 mt-1')}
				>
					<span>{isExpanded ? lessLabel : moreLabel}</span>
					<ChevronDown aria-hidden="true" class="size-3 transition-transform {isExpanded ? 'rotate-180' : ''}" />
				</button>
			{/if}
		</div>
	</div>
</div>
