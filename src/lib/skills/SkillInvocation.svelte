<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { BookOpenText, Check, ChevronDown, CircleDashed, LoaderCircle, X } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';
	import { motionDuration } from '../state/motion.svelte';
	import { PROGRESS_TRACK_CLASS, badgeClass, progressFillClass } from '../ui/styles';
	import { SAMPLE_SKILLS, SAMPLE_SKILL_STEPS } from './fixtures';
	import { SKILL_SCOPE_META } from './scope';
	import type { AgentSkill, SkillInvocationStatus, SkillInvocationStep } from './types';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'skill' | 'steps' | 'status' | 'durationSeconds' | 'defaultOpen' | 'result'> {
		skill?: AgentSkill;
		steps?: SkillInvocationStep[];
		status?: SkillInvocationStatus;
		/** Seconds the run took, shown once it completes. */
		durationSeconds?: number;
		defaultOpen?: boolean;
		/** Optional result rendered under the steps, such as a file preview. */
		result?: Snippet;
		class?: string;
	}

	let {
		skill = SAMPLE_SKILLS[0],
		steps = SAMPLE_SKILL_STEPS,
		status = 'complete',
		durationSeconds,
		defaultOpen = true,
		result,
		class: className = '',
		...rest
	}: Props = $props();

	let open = $state(true);
	let ready = $state(false);

	$effect(() => {
		open = defaultOpen;
	});

	$effect(() => {
		ready = true;
	});

	let done = $derived(steps.filter((s) => s.status === 'complete').length);
	let failed = $derived(status === 'error' || steps.some((s) => s.status === 'error'));
	let busy = $derived(status === 'loading' || status === 'running');
	let panelId = $derived(`skill-run-${skill.id}`);

	const progress = new Tween(0, { duration: 300, easing: cubicOut });

	$effect(() => {
		const target = status === 'complete' ? 100 : steps.length ? (done / steps.length) * 100 : 0;
		void progress.set(target, { duration: motionDuration(300) });
	});

	let title = $derived(
		status === 'loading'
			? 'Loading skill'
			: status === 'running'
				? 'Using skill'
				: status === 'error'
					? 'Skill stopped'
					: 'Used skill'
	);
</script>

<div {...rest}
	role="group"
	aria-label="{title} {skill.name}"
	aria-busy={busy}
	data-state={status}
	class="w-full overflow-hidden rounded-[20px] border border-chat-border bg-card-bg text-sm ak-shadow-soft-sm {className}"
>
	<button
		type="button"
		aria-expanded={open}
		aria-controls={panelId}
		disabled={!ready}
		onclick={() => (open = !open)}
		class="flex w-full items-center gap-3 px-4 py-3 text-left"
	>
		<span
			aria-hidden="true"
			class="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-chat-accent-subtle text-chat-accent [&_svg]:size-4 {busy
				? 'ak-breathe'
				: ''}"
		>
			{#if failed}
				<X class="text-status-danger" />
			{:else}
				<BookOpenText />
			{/if}
		</span>
		<span class="min-w-0 flex-1">
			<span class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
				<span class="text-fg-light {busy ? 'ak-shimmer-text' : ''}">{title}</span>
				<span class="font-mono font-semibold text-fg-main">{skill.name}</span>
				<span class={badgeClass(SKILL_SCOPE_META[skill.scope].tone)}>{SKILL_SCOPE_META[skill.scope].label}</span>
			</span>
			<span class="mt-0.5 block text-xs text-fg-light">
				<span class="tabular-nums">{done}</span>/<span class="tabular-nums">{steps.length}</span> steps
				{#if status === 'complete' && durationSeconds !== undefined}
					· {durationSeconds}s
				{/if}
			</span>
		</span>
		<ChevronDown
			aria-hidden="true"
			class="size-4 shrink-0 text-fg-light transition-transform duration-200 {open ? 'rotate-180' : ''}"
		/>
	</button>

	<div class="px-4 pb-1">
		<div class={PROGRESS_TRACK_CLASS}>
			<span class={progressFillClass(failed ? 'danger' : status === 'complete' ? 'success' : 'accent')} style:width="{progress.current}%"></span>
		</div>
	</div>

	<AgentDisclosure open={open} id={panelId}>
		<ol class="space-y-0.5 px-3 pt-2 pb-3" aria-label="{skill.name} steps">
			{#each steps as step (step.id)}
				<li
					in:fly={{ y: 4, duration: motionDuration(180) }}
					data-status={step.status}
					class="flex items-start gap-2.5 rounded-[12px] px-1.5 py-1.5"
				>
					<span aria-hidden="true" class="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center [&_svg]:size-3.5">
						{#if step.status === 'complete'}
							<Check class="text-status-success" />
						{:else if step.status === 'running'}
							<LoaderCircle class="animate-spin text-chat-accent motion-reduce:animate-none" />
						{:else if step.status === 'error'}
							<X class="text-status-danger" />
						{:else}
							<CircleDashed class="text-fg-light/70" />
						{/if}
					</span>
					<span class="min-w-0 flex-1">
						<span class="block text-[13px] {step.status === 'pending' ? 'text-fg-light' : 'text-fg-main'}">
							{step.label}
							<span class="sr-only">({step.status})</span>
						</span>
						{#if step.detail}
							<span class="block truncate font-mono text-[11px] text-fg-light">{step.detail}</span>
						{/if}
					</span>
				</li>
			{/each}
		</ol>
		{#if result}
			<div class="border-t border-chat-border/70 bg-chat-surface/60 p-3">
				{@render result()}
			</div>
		{/if}
	</AgentDisclosure>
</div>
