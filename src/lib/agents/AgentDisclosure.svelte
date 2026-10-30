<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		open: boolean;
		class?: string;
		children: Snippet;
	}

	let { id, open, class: className = '', children }: Props = $props();
</script>

<div
	{id}
	aria-hidden={!open}
	inert={!open}
	class="grid transition-all duration-200 ease-out {open
		? 'grid-rows-[1fr] opacity-100'
		: 'pointer-events-none grid-rows-[0fr] opacity-0'} {className}"
>
	<div class="min-h-0 overflow-hidden">
		{@render children()}
	</div>
</div>
