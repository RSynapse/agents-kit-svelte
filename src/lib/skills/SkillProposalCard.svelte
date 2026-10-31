<script lang="ts">
	import { Check, Lightbulb, Sparkles, X } from '@lucide/svelte';
	import { scale } from 'svelte/transition';
	import { motionDuration } from '../state/motion.svelte';
	import { diffSkillLines } from '../state/skill-helpers';
	import { SEGMENT_GROUP_CLASS, badgeClass, pillClass, segmentClass } from '../ui/styles';
	import { SAMPLE_SKILL_PROPOSAL } from './fixtures';
	import type { SkillProposal, SkillProposalStatus } from './types';

	type View = 'changes' | 'file';

	interface Props {
		proposal?: SkillProposal;
		status?: SkillProposalStatus;
		onSave?: (proposal: SkillProposal) => void;
		onDismiss?: (proposal: SkillProposal) => void;
		class?: string;
	}

	let {
		proposal = SAMPLE_SKILL_PROPOSAL,
		status = 'pending',
		onSave,
		onDismiss,
		class: className = ''
	}: Props = $props();

	let localStatus = $state<SkillProposalStatus>('pending');
	let view = $state<View>('changes');
	let ready = $state(false);

	$effect(() => {
		localStatus = status;
	});

	$effect(() => {
		view = proposal.previousSkillMd ? 'changes' : 'file';
	});

	$effect(() => {
		ready = true;
	});

	let isUpdate = $derived(proposal.kind === 'improvement' && !!proposal.previousSkillMd);
	let diff = $derived(isUpdate ? diffSkillLines(proposal.previousSkillMd ?? '', proposal.skillMd) : []);
	let added = $derived(diff.filter((l) => l.kind === 'add').length);
	let removed = $derived(diff.filter((l) => l.kind === 'delete').length);

	/** Marks the proposal saved and reports it. */
	function save(): void {
		localStatus = 'saved';
		onSave?.(proposal);
	}

	/** Marks the proposal dismissed and reports it. */
	function dismiss(): void {
		localStatus = 'dismissed';
		onDismiss?.(proposal);
	}
</script>

<article
	aria-label="Skill proposal: {proposal.name}"
	data-state={localStatus}
	class="w-full overflow-hidden rounded-[20px] border border-chat-border bg-card-bg text-sm ak-shadow-soft {className}"
>
	<header class="flex items-start gap-3 p-4">
		<span aria-hidden="true" class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-chat-accent-subtle text-chat-accent [&_svg]:size-4">
			<Sparkles />
		</span>
		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-2">
				<p class="font-medium text-fg-main">
					{isUpdate ? 'Update' : 'Save'} <span class="font-mono">{proposal.name}</span>{isUpdate ? '?' : ' as a skill?'}
				</p>
				<span class={badgeClass(isUpdate ? 'warning' : 'accent')}>{isUpdate ? 'Improvement' : 'New skill'}</span>
			</div>
			<p class="mt-1 text-[13px] leading-5 text-fg-light">{proposal.description}</p>
		</div>
	</header>

	{#if proposal.evidence?.length}
		<ul class="mx-4 mb-3 space-y-1 rounded-[12px] bg-chat-surface px-3 py-2">
			{#each proposal.evidence as note (note)}
				<li class="flex items-start gap-2 text-xs text-fg-light">
					<Lightbulb aria-hidden="true" class="mt-px size-3.5 shrink-0 text-status-warning" />
					{note}
				</li>
			{/each}
		</ul>
	{/if}

	<div class="mx-4 mb-3 flex flex-wrap items-center justify-between gap-2">
		{#if isUpdate}
			<div role="group" aria-label="Proposal view" class={SEGMENT_GROUP_CLASS}>
				<button type="button" disabled={!ready} aria-pressed={view === 'changes'} onclick={() => (view = 'changes')} class={segmentClass(view === 'changes')}>
					Changes
				</button>
				<button type="button" disabled={!ready} aria-pressed={view === 'file'} onclick={() => (view = 'file')} class={segmentClass(view === 'file')}>
					Full SKILL.md
				</button>
			</div>
			<span class="font-mono text-xs">
				<span class="text-diff-add-fg">+{added}</span>
				<span class="text-diff-del-fg">−{removed}</span>
			</span>
		{:else}
			<span class="text-xs font-medium text-fg-light">SKILL.md</span>
		{/if}
	</div>

	<div class="mx-4 max-h-72 overflow-auto rounded-[14px] border border-chat-border bg-chat-surface font-mono text-[11.5px] leading-5">
		{#if view === 'changes' && isUpdate}
			<ol aria-label="Changes to SKILL.md" class="py-1.5">
				{#each diff as line, i (i)}
					<li
						class="flex gap-2 px-3 whitespace-pre-wrap {line.kind === 'add'
							? 'bg-diff-add-bg text-diff-add-fg'
							: line.kind === 'delete'
								? 'bg-diff-del-bg text-diff-del-fg'
								: 'text-fg-light'}"
					>
						<span aria-hidden="true" class="w-2 shrink-0 select-none">{line.kind === 'add' ? '+' : line.kind === 'delete' ? '−' : ' '}</span>
						<span class="sr-only">{line.kind === 'add' ? 'Added:' : line.kind === 'delete' ? 'Removed:' : ''}</span>
						<span class="min-w-0">{line.text || ' '}</span>
					</li>
				{/each}
			</ol>
		{:else}
			<pre class="p-3 whitespace-pre-wrap text-fg-main">{proposal.skillMd}</pre>
		{/if}
	</div>

	<footer class="mt-4 flex min-h-12 items-center justify-end gap-2 border-t border-chat-border/70 bg-chat-surface/60 px-4 py-2.5" aria-live="polite">
		{#if localStatus === 'pending'}
			<button type="button" disabled={!ready} onclick={dismiss} class={pillClass('ghost', 'sm')}>Not now</button>
			<button type="button" disabled={!ready} onclick={save} class={pillClass('accent', 'sm')}>
				<Check aria-hidden="true" />
				{isUpdate ? 'Save update' : 'Save skill'}
			</button>
		{:else if localStatus === 'saved'}
			<span in:scale={{ start: 0.9, duration: motionDuration(180) }} class="mr-auto flex items-center gap-1.5 text-xs font-medium text-status-success">
				<Check aria-hidden="true" class="size-3.5" />
				Saved. The agent will use <span class="font-mono">{proposal.name}</span> from now on.
			</span>
		{:else}
			<span in:scale={{ start: 0.9, duration: motionDuration(180) }} class="mr-auto flex items-center gap-1.5 text-xs text-fg-light">
				<X aria-hidden="true" class="size-3.5" />
				Dismissed. Nothing was saved.
			</span>
		{/if}
	</footer>
</article>
