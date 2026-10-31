<script lang="ts">
	import { Plus, Search } from '@lucide/svelte';
	import { flip } from 'svelte/animate';
	import { scale } from 'svelte/transition';
	import { SvelteSet } from 'svelte/reactivity';
	import { motionDuration } from '../state/motion.svelte';
	import { SEGMENT_GROUP_CLASS, pillClass, segmentClass } from '../ui/styles';
	import SkillCard from './SkillCard.svelte';
	import { SAMPLE_SKILLS } from './fixtures';
	import { SKILL_SCOPE_META } from './scope';
	import type { AgentSkill, SkillScope } from './types';

	type ScopeFilter = 'all' | SkillScope;

	interface Props {
		skills?: AgentSkill[];
		title?: string;
		/** Skill to highlight, e.g. the one the router just picked. */
		activeSkillId?: string | null;
		/** Shows full cards with triggers, tools and files instead of compact ones. */
		detailed?: boolean;
		onToggle?: (skillId: string, enabled: boolean) => void;
		onInvoke?: (skill: AgentSkill) => void;
		onEdit?: (skill: AgentSkill) => void;
		onCreate?: () => void;
		class?: string;
	}

	let {
		skills = SAMPLE_SKILLS,
		title = 'Skills',
		activeSkillId = null,
		detailed = false,
		onToggle,
		onInvoke,
		onEdit,
		onCreate,
		class: className = ''
	}: Props = $props();

	const SCOPE_ORDER: ScopeFilter[] = ['all', 'personal', 'project', 'plugin', 'built-in'];

	let query = $state('');
	let scopeFilter = $state<ScopeFilter>('all');
	let ready = $state(false);
	const enabledIds = new SvelteSet<string>();

	$effect(() => {
		enabledIds.clear();
		for (const s of skills) if (s.enabled !== false) enabledIds.add(s.id);
	});

	$effect(() => {
		ready = true;
	});

	let visible = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return skills.filter(
			(s) =>
				(scopeFilter === 'all' || s.scope === scopeFilter) &&
				(!q ||
					`${s.name} ${s.description} ${(s.triggers ?? []).join(' ')}`.toLowerCase().includes(q))
		);
	});

	/** Count of skills per scope filter, for the segment labels. */
	function countFor(filter: ScopeFilter): number {
		return filter === 'all' ? skills.length : skills.filter((s) => s.scope === filter).length;
	}

	/** Keeps the enabled count in sync and forwards the change. */
	function handleToggle(skillId: string, enabled: boolean): void {
		if (enabled) enabledIds.add(skillId);
		else enabledIds.delete(skillId);
		onToggle?.(skillId, enabled);
	}
</script>

<section
	aria-label="{title} library"
	class="w-full overflow-hidden rounded-window border border-chat-border bg-chat-surface text-sm ak-shadow-soft-sm {className}"
>
	<header class="flex flex-col gap-3 px-4 pt-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="font-display text-xl font-normal tracking-[-0.01em] text-fg-main">{title}</h2>
			<p class="mt-0.5 text-xs text-fg-light">
				<span class="tabular-nums">{enabledIds.size}</span> of
				<span class="tabular-nums">{skills.length}</span> enabled · loaded only when a request matches
			</p>
		</div>
		<div class="flex items-center gap-2">
			<label
				class="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-full border border-chat-border bg-card-bg px-3 ak-soft-focus sm:w-56 sm:flex-none"
			>
				<Search aria-hidden="true" class="size-3.5 text-fg-light" />
				<input
					type="search"
					bind:value={query}
					placeholder="Search skills"
					aria-label="Search skills"
					class="min-w-0 flex-1 bg-transparent text-[13px] text-fg-main outline-none placeholder:text-fg-light"
				/>
			</label>
			{#if onCreate}
				<button type="button" disabled={!ready} onclick={() => onCreate?.()} class={pillClass('primary', 'md')}>
					<Plus aria-hidden="true" />
					New skill
				</button>
			{/if}
		</div>
	</header>

	<div class="overflow-x-auto px-4 [scrollbar-width:none]">
		<div role="group" aria-label="Filter skills by scope" class="{SEGMENT_GROUP_CLASS} w-max">
			{#each SCOPE_ORDER as filter (filter)}
				<button
					type="button"
					aria-pressed={scopeFilter === filter}
					disabled={!ready}
					onclick={() => (scopeFilter = filter)}
					class={segmentClass(scopeFilter === filter)}
				>
					{filter === 'all' ? 'All' : SKILL_SCOPE_META[filter].label}
					<span class="tabular-nums opacity-60">{countFor(filter)}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="p-4">
		{#if visible.length > 0}
			<ul class="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))]">
				{#each visible as skill (skill.id)}
					<li
						class="flex"
						animate:flip={{ duration: motionDuration(220) }}
						in:scale={{ start: 0.97, duration: motionDuration(160) }}
					>
						<SkillCard
							{skill}
							compact={!detailed}
							active={activeSkillId === skill.id}
							onToggle={handleToggle}
							{onInvoke}
							{onEdit}
						/>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="rounded-[16px] border border-dashed border-chat-border py-10 text-center text-[13px] text-fg-light">
				{query.trim() ? `No skills match “${query.trim()}”.` : 'No skills in this scope yet.'}
			</p>
		{/if}
	</div>
</section>
