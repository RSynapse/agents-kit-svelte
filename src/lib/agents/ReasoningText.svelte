<script lang="ts">
	interface Props {
		phrases?: string[];
		interval?: number;
		class?: string;
	}

	const DEFAULT_PHRASES = [
		'Thinking',
		'Inspecting worktree files',
		'Tracing OAuth callback flow',
		'Verifying boundary constraints'
	];
	const MIN_INTERVAL_MS = 600;

	let {
		phrases = DEFAULT_PHRASES,
		interval = 1800,
		class: className = ''
	}: Props = $props();

	let currentIndex = $state(0);
	let safePhrases = $derived(phrases.length > 0 ? phrases : DEFAULT_PHRASES);
	let activePhrase = $derived(safePhrases[currentIndex % safePhrases.length] ?? 'Thinking');

	$effect(() => {
		if (safePhrases.length < 2) {
			return;
		}
		const timer = window.setInterval(() => {
			currentIndex = (currentIndex + 1) % safePhrases.length;
		}, Math.max(MIN_INTERVAL_MS, interval));

		return () => window.clearInterval(timer);
	});
</script>

<span
	role="status"
	aria-live="polite"
	class="inline-flex items-center gap-2 text-sm font-medium text-fg-light {className}"
>
	<span
		aria-hidden="true"
		class="inline-block size-2 rounded-full bg-accent-primary animate-ping"
	></span>
	<span class="ak-shimmer-text">{activePhrase}…</span>
</span>
