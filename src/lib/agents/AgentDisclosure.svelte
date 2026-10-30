<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { motionDuration } from '../state/motion.svelte';

	interface Props {
		id?: string;
		open: boolean;
		class?: string;
		children: Snippet;
	}

	let { id, open, class: className = '', children }: Props = $props();
</script>

{#if open}
	<div
		{id}
		transition:slide={{ duration: motionDuration(210), easing: cubicOut }}
		class="overflow-hidden {className}"
	>
		<div in:fade={{ duration: motionDuration(160) }}>
			{@render children()}
		</div>
	</div>
{:else}
	<div {id} aria-hidden="true" inert class="hidden"></div>
{/if}
