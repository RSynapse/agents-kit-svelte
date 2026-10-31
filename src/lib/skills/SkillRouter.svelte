<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { ArrowUp, CornerDownRight, Route } from '@lucide/svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { motionDuration } from '../state/motion.svelte';
	import { rankSkills } from '../state/skill-helpers';
	import { PROGRESS_TRACK_CLASS, badgeClass, pillClass, progressFillClass } from '../ui/styles';
	import { SKILL_SCOPE_META } from './scope';
	import type { AgentSkill, SkillMatch } from './types';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'skills' | 'prompt' | 'threshold' | 'limit' | 'readonly' | 'clearOnRoute' | 'onRoute'> {
		skills?: AgentSkill[];
		/** Prompt to route. The field stays editable unless `readonly` is set. */
		prompt?: string;
		/** Minimum score, from 0 to 1, for a skill to load. */
		threshold?: number;
		/** How many candidates to list. */
		limit?: number;
		readonly?: boolean;
		/** Empties the field after a request is routed, like a chat composer. */
		clearOnRoute?: boolean;
		/** Called when the user submits the prompt with the skill that will load, if any. */
		onRoute?: (prompt: string, match: SkillMatch | null) => void;
		class?: string;
	}

	let {
		skills = [],
		prompt = 'Write the release notes for everything that shipped this week',
		threshold = 0.45,
		limit = 4,
		readonly = false,
		clearOnRoute = false,
		onRoute,
		class: className = '',
		...rest
	}: Props = $props();

	let draft = $state('');
	let ready = $state(false);

	$effect(() => {
		draft = prompt;
	});

	$effect(() => {
		ready = true;
	});

	let ranked = $derived(rankSkills(draft, skills).filter((m) => m.score > 0).slice(0, limit));
	let winner = $derived(ranked[0] && ranked[0].score >= threshold ? ranked[0] : null);
	let byId = $derived(new Map(skills.map((s) => [s.id, s])));

	const confidence = new Tween(0, { duration: 420, easing: cubicOut });

	$effect(() => {
		void confidence.set((winner?.score ?? 0) * 100, { duration: motionDuration(420) });
	});

	/** Reports the routing decision for the current prompt. */
	function submit(event: SubmitEvent): void {
		event.preventDefault();
		if (!draft.trim()) return;
		onRoute?.(draft.trim(), winner);
		if (clearOnRoute) draft = '';
	}

	/** Enter routes the request; Shift+Enter keeps a newline. */
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Enter' || event.shiftKey || event.isComposing || readonly) return;
		event.preventDefault();
		(event.currentTarget as HTMLTextAreaElement).form?.requestSubmit();
	}
</script>

<section {...rest}
	aria-label="Skill router"
	class="w-full overflow-hidden rounded-[20px] border border-chat-border bg-card-bg text-sm ak-shadow-soft-sm {className}"
>
	<header class="flex items-center justify-between gap-3 px-4 pt-3.5 pb-3">
		<div class="flex items-center gap-2.5">
			<span class="inline-flex size-7 items-center justify-center rounded-full bg-chat-accent-subtle text-chat-accent [&_svg]:size-3.5">
				<Route aria-hidden="true" />
			</span>
			<div>
				<p class="text-[13px] font-semibold text-fg-main">Skill routing</p>
				<p class="text-xs text-fg-light">Matches the request against each skill’s description</p>
			</div>
		</div>
		<span class="font-mono text-xs tabular-nums text-fg-light" aria-hidden="true">
			{Math.round(confidence.current)}%
		</span>
	</header>

	<form onsubmit={submit} class="px-4">
		<div class="flex items-end gap-2 rounded-[18px] border border-chat-border bg-chat-surface p-2 pl-3.5 ak-soft-focus">
			<textarea
				bind:value={draft}
				{readonly}
				onkeydown={handleKeydown}
				rows="2"
				aria-label="Request to route"
				placeholder="Ask for something…"
				class="min-h-10 flex-1 resize-none bg-transparent py-1 text-[13px] leading-5 text-fg-main outline-none placeholder:text-fg-light"
			></textarea>
			{#if !readonly}
				<button
					type="submit"
					disabled={!ready || !draft.trim()}
					aria-label="Route request"
					class={pillClass('accent', 'icon-sm')}
				>
					<ArrowUp aria-hidden="true" />
				</button>
			{/if}
		</div>
	</form>

	{#if ranked.length > 0}
	<ol class="space-y-1 p-2 pt-3" aria-label="Candidate skills">
		{#each ranked as match, i (match.skillId)}
			{@const skill = byId.get(match.skillId)}
			{@const selected = winner?.skillId === match.skillId}
			{@const below = match.score < threshold}
			{#if skill}
				<li
					data-selected={selected}
					class="rounded-[14px] px-2.5 py-2 transition-colors duration-200 {selected ? 'bg-chat-accent-subtle/60' : ''}"
				>
					<div class="flex items-center gap-2">
						<span class="w-4 text-right font-mono text-[11px] text-fg-light tabular-nums">{i + 1}</span>
						<span class="min-w-0 flex-1 truncate font-mono text-[13px] {below ? 'text-fg-light' : 'font-medium text-fg-main'}">
							{skill.name}
						</span>
						<span class={badgeClass(SKILL_SCOPE_META[skill.scope].tone, 'hidden sm:inline-flex')}>
							{SKILL_SCOPE_META[skill.scope].label}
						</span>
						{#if selected}
							<span class={badgeClass('accent')}>Loads</span>
						{/if}
						<span class="w-9 text-right font-mono text-xs tabular-nums text-fg-light">
							{Math.round(match.score * 100)}%
						</span>
					</div>
					<div class="mt-1.5 ml-6 flex items-center gap-2">
						<div
							class="{PROGRESS_TRACK_CLASS} relative flex-1"
							role="meter"
							aria-label="{skill.name} match"
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={Math.round(match.score * 100)}
						>
							<span class={progressFillClass(selected ? 'accent' : below ? 'neutral' : 'success')} style:width="{match.score * 100}%"></span>
							<span
								aria-hidden="true"
								class="absolute inset-y-0 w-px bg-fg-light/50"
								style:left="{threshold * 100}%"
							></span>
						</div>
					</div>
					{#if match.matchedTerms.length > 0}
						<p class="mt-1 ml-6 flex flex-wrap items-center gap-1 text-[11px] text-fg-light">
							<CornerDownRight aria-hidden="true" class="size-3" />
							{#each match.matchedTerms as term (term)}
								<span class="rounded-full bg-chat-user px-1.5 font-mono text-fg-main">{term}</span>
							{/each}
						</p>
					{/if}
				</li>
			{/if}
		{/each}
	</ol>
	{:else}
		<div class="h-3"></div>
	{/if}

	<footer class="border-t border-chat-border/70 bg-chat-surface/60 px-4 py-2.5 text-xs text-fg-light" role="status" aria-live="polite">
		{#if winner}
			Loading <span class="font-mono font-medium text-fg-main">{byId.get(winner.skillId)?.name}</span> before answering.
		{:else if draft.trim() && ranked.length === 0}
			No skill matches this request, so the agent answers directly.
		{:else if draft.trim()}
			No skill clears the {Math.round(threshold * 100)}% bar, so the agent answers directly.
		{:else}
			Type a request to see which skill would load.
		{/if}
	</footer>
</section>
