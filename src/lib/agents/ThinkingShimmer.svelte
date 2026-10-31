<script lang="ts">
	import { Sparkle } from '@lucide/svelte';

	interface Props {
		label?: string;
		/** Show the slowly turning accent spark before the label. */
		spark?: boolean;
		class?: string;
	}

	let { label = 'Thinking…', spark = false, class: className = '' }: Props = $props();
</script>

<span class="inline-flex items-center gap-2 {className}">
	{#if spark}
		<Sparkle aria-hidden="true" class="ak-spark size-3.5 fill-current text-chat-accent" />
	{/if}
	<span class="ak-shimmer-text font-medium">{label}</span>
</span>
