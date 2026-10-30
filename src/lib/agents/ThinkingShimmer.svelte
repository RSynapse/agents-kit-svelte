<script lang="ts">
	interface Props {
		label?: string;
		class?: string;
	}

	let { label = 'Thinking…', class: className = '' }: Props = $props();
</script>

<span class="ak-shimmer-text inline-block font-medium {className}">
	{label}
</span>
