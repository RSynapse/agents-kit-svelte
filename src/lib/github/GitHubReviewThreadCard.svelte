<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Check } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	import type { GitHubReviewThreadData } from '../types';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'thread' | 'currentUser' | 'onApplySuggestion' | 'onReply'> {
		thread: GitHubReviewThreadData;
		/** Author name shown on replies typed into the card. */
		currentUser?: string;
		onApplySuggestion?: (threadId: string) => void;
		onReply?: (threadId: string, body: string) => void;
		class?: string;
	}

	let {
		thread,
		currentUser = 'You',
		onApplySuggestion,
		onReply,
		class: className = '',
		...rest
	}: Props = $props();

	let isResolved = $state(false);
	let suggestionApplied = $state(false);
	let replyText = $state('');
	let extraReplies = $state<{ id: string; author: string; body: string }[]>([]);

	$effect(() => {
		isResolved = thread.resolved;
	});

	/**
	 * Submits an inline review reply comment.
	 */
	function submitReply(): void {
		const trimmed = replyText.trim();
		if (!trimmed) return;
		extraReplies = [
			...extraReplies,
			{ id: `rep-${Date.now()}`, author: currentUser, body: trimmed }
		];
		replyText = '';
		onReply?.(thread.id, trimmed);
	}
</script>

<div {...rest} class="overflow-hidden rounded-card border border-card-border bg-card-bg text-sm {className}">
	<div class="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border bg-canvas-secondary px-3.5 py-2 text-xs">
		<div class="flex items-center gap-2 font-mono">
			<code class="font-semibold text-fg-main">{thread.filePath}</code>
			<span class="text-fg-light">{thread.lineRange}</span>
		</div>
		<button
			type="button"
			onclick={() => (isResolved = !isResolved)}
			class="rounded-full px-2.5 py-0.5 font-medium {isResolved
				? 'bg-status-success-subtle text-status-success'
				: 'border border-card-border bg-card-bg text-fg-main hover:bg-canvas-primary'}"
		>
			{#if isResolved}<Check aria-hidden="true" />Resolved{:else}Resolve thread{/if}
		</button>
	</div>

	<div class="border-b border-canvas-border bg-terminal-bg px-3.5 py-2 font-mono text-xs leading-5 text-terminal-fg">
		<pre class="m-0 overflow-x-auto whitespace-pre">{thread.diffHunk}</pre>
	</div>

	<div class="space-y-3 p-3.5">
		{#each thread.comments as comment (comment.id)}
			<div class="space-y-2 text-xs">
				<div class="flex items-center gap-2">
					<span class="font-semibold text-fg-main">{comment.author}</span>
					<span class="rounded bg-accent-subtle px-1.5 py-0.5 font-mono text-[10px] text-accent-primary">
						{comment.role}
					</span>
					<span class="font-mono text-[11px] text-fg-light">{comment.timestamp}</span>
				</div>
				<p class="leading-relaxed text-fg-main">{comment.body}</p>

				{#if comment.suggestedPatch}
					<div class="rounded-lg border border-card-border bg-canvas-secondary p-2.5">
						<div class="flex items-center justify-between text-[11px]">
							<span class="font-mono font-semibold text-fg-light">Suggested change</span>
							<button
								type="button"
								onclick={() => {
									suggestionApplied = true;
									onApplySuggestion?.(thread.id);
								}}
								class={buttonClass('primary', 'sm')}
							>
								{#if suggestionApplied}<Check aria-hidden="true" />Committed to worktree{:else}Apply suggestion{/if}
							</button>
						</div>
						<pre class="mt-1.5 overflow-x-auto font-mono text-[11px] text-fg-main">{comment.suggestedPatch}</pre>
					</div>
				{/if}
			</div>
		{/each}

		{#each extraReplies as reply (reply.id)}
			<div class="rounded-lg border border-card-border bg-canvas-secondary p-2.5 text-xs">
				<span class="font-semibold text-fg-main">{reply.author}: </span>
				<span class="text-fg-main">{reply.body}</span>
			</div>
		{/each}

		<form
			onsubmit={(e) => {
				e.preventDefault();
				submitReply();
			}}
			class="flex gap-2 pt-1"
		>
			<input
				type="text"
				placeholder="Reply to review thread or instruct agent…"
				bind:value={replyText}
				aria-label="Reply to review thread"
				class="flex-1 rounded-md border border-card-border bg-canvas-primary px-2.5 py-1.5 text-xs text-fg-main placeholder:text-fg-light focus:border-accent-primary focus:outline-none"
			/>
			<button
				type="submit"
				disabled={!replyText.trim()}
				class={buttonClass('primary', 'md')}
			>
				Reply
			</button>
		</form>
	</div>
</div>
