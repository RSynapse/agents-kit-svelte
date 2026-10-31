<script lang="ts">
	import SkillEditor from '$lib/skills/SkillEditor.svelte';
	import SkillInvocation from '$lib/skills/SkillInvocation.svelte';
	import SkillLibrary from '$lib/skills/SkillLibrary.svelte';
	import SkillProposalCard from '$lib/skills/SkillProposalCard.svelte';
	import SkillRouter from '$lib/skills/SkillRouter.svelte';
	import { SAMPLE_SKILLS, SAMPLE_SKILL_BODY, SAMPLE_SKILL_PROPOSAL, SAMPLE_SKILL_STEPS } from '$lib/skills/fixtures';
	import { parseSkillManifest } from '$lib/state/skill-helpers';
	import { motionDuration } from '$lib/state/motion.svelte';
	import type {
		AgentSkill,
		SkillInvocationStep,
		SkillManifest,
		SkillMatch
	} from '$lib/skills/types';
	import { MessageCircle } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';

	interface Turn {
		id: number;
		prompt: string;
		skillId: string | null;
		steps: SkillInvocationStep[];
		done: boolean;
	}

	let skills = $state<AgentSkill[]>(SAMPLE_SKILLS.map((s) => ({ ...s })));
	let turns = $state<Turn[]>([]);
	let editing = $state<{ manifest: SkillManifest; title: string; id: string | null } | null>(null);
	let proposalShown = $state(false);
	let nextId = 1;

	let activeSkillId = $derived(turns.at(-1)?.skillId ?? null);
	let busy = $derived(turns.some((t) => !t.done));

	/** Builds the step plan for a skill from the files it bundles. */
	function planFor(skill: AgentSkill): SkillInvocationStep[] {
		if (skill.id === 'release-notes') return SAMPLE_SKILL_STEPS.map((s) => ({ ...s, status: 'pending' }));
		const files = skill.files ?? [];
		const steps: SkillInvocationStep[] = [
			{ id: 'read', label: 'Read SKILL.md', detail: `${skill.name} · ${files[0]?.size ?? 'instructions'}`, status: 'pending' }
		];
		for (const file of files.slice(1)) {
			steps.push({
				id: file.path,
				label: file.kind === 'script' ? `Run ${file.path}` : `Load ${file.path}`,
				detail: file.size,
				status: 'pending'
			});
		}
		steps.push({ id: 'answer', label: 'Answer with the skill’s guidance', status: 'pending' });
		return steps;
	}

	/** Adds a turn for the routed request and plays its steps. */
	function handleRoute(prompt: string, match: SkillMatch | null): void {
		const skill = match ? skills.find((s) => s.id === match.skillId) : undefined;
		const id = nextId++;
		turns = [...turns.slice(-3), { id, prompt, skillId: skill?.id ?? null, steps: skill ? planFor(skill) : [], done: !skill }];
		if (!skill) return;

		const advance = (): void => {
			const turn = turns.find((t) => t.id === id);
			if (!turn) return;
			const i = turn.steps.findIndex((s) => s.status !== 'complete');
			const steps = turn.steps.map((s, j) =>
				j < i || (j === i && s.status === 'running') ? { ...s, status: 'complete' as const } : j === i ? { ...s, status: 'running' as const } : s
			);
			const done = steps.every((s) => s.status === 'complete');
			turns = turns.map((t) => (t.id === id ? { ...t, steps, done } : t));
			if (done) {
				skills = skills.map((s) => (s.id === skill.id ? { ...s, invocations: (s.invocations ?? 0) + 1, lastUsedLabel: 'Just now' } : s));
				if (skill.id === 'release-notes') proposalShown = true;
			} else {
				window.setTimeout(advance, prefersReducedMotion.current ? 0 : 520);
			}
		};
		window.setTimeout(advance, motionDuration(300));
	}

	function handleToggle(id: string, enabled: boolean): void {
		skills = skills.map((s) => (s.id === id ? { ...s, enabled } : s));
	}

	function handleEdit(skill: AgentSkill): void {
		editing = {
			id: skill.id,
			title: `Edit ${skill.name}`,
			manifest: {
				name: skill.name,
				description: skill.description,
				allowedTools: skill.allowedTools ?? [],
				body: skill.id === 'release-notes' ? SAMPLE_SKILL_BODY : `# ${skill.name}\n\n1. Follow the steps in this skill.`
			}
		};
	}

	function handleCreate(): void {
		editing = {
			id: null,
			title: 'New skill',
			manifest: { name: 'standup-summary', description: '', allowedTools: ['Read'], body: '# Standup summary\n\n1. ' }
		};
	}

	function handleSave(manifest: SkillManifest): void {
		if (editing?.id) {
			const id = editing.id;
			skills = skills.map((s) =>
				s.id === id ? { ...s, description: manifest.description, allowedTools: manifest.allowedTools } : s
			);
		} else {
			skills = [
				{
					id: manifest.name,
					name: manifest.name,
					description: manifest.description,
					scope: 'personal',
					version: '0.1.0',
					author: 'You',
					enabled: true,
					allowedTools: manifest.allowedTools,
					files: [{ path: 'SKILL.md', kind: 'skill', size: '1 KB' }],
					invocations: 0,
					lastUsedLabel: 'New'
				},
				...skills.filter((s) => s.id !== manifest.name)
			];
		}
		editing = null;
	}

	function handleProposalSave(): void {
		const next = parseSkillManifest(SAMPLE_SKILL_PROPOSAL.skillMd);
		skills = skills.map((s) => (s.id === 'release-notes' ? { ...s, description: next.description, version: '1.3.0' } : s));
	}
</script>

<svelte:head>
	<title>Skills studio · Agents Kit Svelte</title>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
	<div class="max-w-2xl">
		<p class="text-xs font-medium text-accent-primary">Agentic Skills</p>
		<h1 class="mt-2 font-display text-[2.25rem] leading-tight font-normal tracking-[-0.02em] text-fg-main">
			Teach your agent once, and it remembers how.
		</h1>
		<p class="mt-3 text-sm leading-6 text-fg-light">
			Skills are folders of instructions the agent loads only when a request matches. Ask for
			something below to watch it pick a skill, run it, and suggest an improvement.
		</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]">
		<section aria-label="Session" class="flex min-w-0 flex-col gap-4">
			{#if turns.length === 0}
				<div class="rounded-window border border-dashed border-chat-border px-6 py-10 text-center text-[13px] text-fg-light">
					<MessageCircle aria-hidden="true" class="mx-auto mb-2 size-5" />
					Try “chart signups by region”, “merge these PDFs” or “what shipped this week”.
				</div>
			{/if}

			{#each turns as turn (turn.id)}
				{@const skill = skills.find((s) => s.id === turn.skillId)}
				<div class="space-y-2.5" in:fly={{ y: 6, duration: motionDuration(200) }}>
					<p class="ml-auto w-fit max-w-[85%] rounded-bubble bg-chat-user px-4 py-2 text-[13px] text-fg-main">{turn.prompt}</p>
					{#if skill}
						<SkillInvocation {skill} steps={turn.steps} status={turn.done ? 'complete' : 'running'} durationSeconds={turn.steps.length} />
					{:else}
						<p class="text-[13px] text-fg-light">No skill matched, so the agent answered directly.</p>
					{/if}
				</div>
			{/each}

			{#if proposalShown}
				<div in:fly={{ y: 6, duration: motionDuration(200) }}>
					<SkillProposalCard proposal={SAMPLE_SKILL_PROPOSAL} onSave={handleProposalSave} />
				</div>
			{/if}

			<SkillRouter {skills} prompt="" clearOnRoute={true} onRoute={handleRoute} class={busy ? 'opacity-90' : ''} />
		</section>

		<div class="min-w-0">
			{#if editing}
				<div in:fly={{ y: 8, duration: motionDuration(200) }}>
					{#key editing}
						<SkillEditor manifest={editing.manifest} title={editing.title} onSave={handleSave} onCancel={() => (editing = null)} />
					{/key}
				</div>
			{:else}
				<SkillLibrary
					{skills}
					{activeSkillId}
					onToggle={handleToggle}
					onEdit={handleEdit}
					onCreate={handleCreate}
					onInvoke={(skill) => handleRoute(skill.triggers?.[0] ?? skill.name, { skillId: skill.id, score: 1, matchedTerms: [] })}
				/>
			{/if}
		</div>
	</div>
</div>
