<script lang="ts">
	import { ChevronDown, MessageSquareQuote, Pencil, Play, Wrench } from '@lucide/svelte';
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';
	import { badgeClass, pillClass } from '../ui/styles';
	import { SKILL_FILE_ICON, SKILL_SCOPE_META, switchThumbClass, switchTrackClass } from './scope';
	import { SAMPLE_SKILLS } from './fixtures';
	import type { AgentSkill } from './types';

	interface Props {
		skill?: AgentSkill;
		/** Hides triggers, tools and files for dense grids. */
		compact?: boolean;
		/** Opens the bundled files list on first render. */
		defaultFilesOpen?: boolean;
		/** Highlights the card, e.g. when the skill was just matched. */
		active?: boolean;
		onToggle?: (skillId: string, enabled: boolean) => void;
		onInvoke?: (skill: AgentSkill) => void;
		onEdit?: (skill: AgentSkill) => void;
		class?: string;
	}

	let {
		skill = SAMPLE_SKILLS[0],
		compact = false,
		defaultFilesOpen = false,
		active = false,
		onToggle,
		onInvoke,
		onEdit,
		class: className = ''
	}: Props = $props();

	let enabled = $state(true);
	let filesOpen = $state(false);
	let ready = $state(false);

	$effect(() => {
		enabled = skill.enabled !== false;
	});

	$effect(() => {
		filesOpen = defaultFilesOpen;
	});

	$effect(() => {
		ready = true;
	});

	let scope = $derived(SKILL_SCOPE_META[skill.scope]);
	let filesId = $derived(`skill-files-${skill.id}`);

	/** Flips the enabled switch and reports the new value. */
	function toggle(): void {
		enabled = !enabled;
		onToggle?.(skill.id, enabled);
	}
</script>

<article
	aria-label="{skill.name} skill"
	data-enabled={enabled}
	class="flex w-full flex-col overflow-hidden rounded-[20px] border bg-card-bg text-sm transition-[border-color,box-shadow,opacity] duration-200 {active
		? 'border-chat-accent/60 ak-shadow-soft'
		: 'border-chat-border ak-shadow-soft-sm'} {className}"
>
	<div class="flex items-start gap-3 p-4 {enabled ? '' : 'opacity-60'}">
		<span
			aria-hidden="true"
			class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-chat-accent-subtle text-chat-accent [&_svg]:size-4"
		>
			<scope.icon />
		</span>

		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
				<h3 class="truncate font-mono text-[13px] font-semibold text-fg-main">{skill.name}</h3>
				{#if skill.version}
					<span class="font-mono text-[11px] text-fg-light">v{skill.version}</span>
				{/if}
				<span class={badgeClass(scope.tone)} title={scope.hint}>{scope.label}</span>
			</div>
			<p class="mt-1 text-[13px] leading-5 text-fg-light {compact ? 'line-clamp-2' : ''}">
				{skill.description}
			</p>
		</div>

		<button
			type="button"
			role="switch"
			aria-checked={enabled}
			aria-label="{enabled ? 'Disable' : 'Enable'} {skill.name}"
			disabled={!ready}
			onclick={toggle}
			class={switchTrackClass(enabled)}
		>
			<span aria-hidden="true" class={switchThumbClass(enabled)}></span>
		</button>
	</div>

	{#if !compact}
		<div class="space-y-3 px-4 pb-4 {enabled ? '' : 'opacity-60'}">
			{#if skill.triggers?.length}
				<div>
					<p class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-fg-light">
						<MessageSquareQuote aria-hidden="true" class="size-3.5" />
						Triggers on
					</p>
					<ul class="flex flex-wrap gap-1.5">
						{#each skill.triggers as trigger (trigger)}
							<li class="rounded-full bg-chat-user px-2.5 py-0.5 text-xs text-fg-main">“{trigger}”</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if skill.allowedTools?.length}
				<div>
					<p class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-fg-light">
						<Wrench aria-hidden="true" class="size-3.5" />
						Allowed tools
					</p>
					<ul class="flex flex-wrap gap-1.5">
						{#each skill.allowedTools as tool (tool)}
							<li class="rounded-full border border-chat-border px-2 py-px font-mono text-[11px] text-fg-light">
								{tool}
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if skill.files?.length}
				<div class="rounded-[12px] bg-chat-surface">
					<button
						type="button"
						aria-expanded={filesOpen}
						aria-controls={filesId}
						disabled={!ready}
						onclick={() => (filesOpen = !filesOpen)}
						class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-fg-light hover:text-fg-main"
					>
						<span>{skill.files.length} {skill.files.length === 1 ? 'file' : 'files'} in this skill</span>
						<ChevronDown
							aria-hidden="true"
							class="size-3.5 transition-transform duration-200 {filesOpen ? 'rotate-180' : ''}"
						/>
					</button>
					<AgentDisclosure open={filesOpen} id={filesId}>
						<ul class="space-y-0.5 px-2 pb-2">
							{#each skill.files as file (file.path)}
								{@const FileIcon = SKILL_FILE_ICON[file.kind]}
								<li class="flex items-center gap-2 rounded-lg px-1.5 py-1 font-mono text-xs text-fg-main">
									<FileIcon aria-hidden="true" class="size-3.5 text-fg-light" />
									<span class="min-w-0 flex-1 truncate">{file.path}</span>
									{#if file.size}<span class="text-[11px] text-fg-light">{file.size}</span>{/if}
								</li>
							{/each}
						</ul>
					</AgentDisclosure>
				</div>
			{/if}
		</div>
	{/if}

	<footer
		class="mt-auto flex items-center justify-between gap-2 border-t border-chat-border/70 bg-chat-surface/60 px-4 py-2.5"
	>
		<p class="min-w-0 truncate text-xs text-fg-light">
			{#if skill.invocations !== undefined}
				<span class="tabular-nums">{skill.invocations}</span> runs
			{/if}
			{#if skill.lastUsedLabel}
				<span aria-hidden="true">·</span> {skill.lastUsedLabel}
			{/if}
			{#if skill.author && !compact}
				<span aria-hidden="true">·</span> {skill.author}
			{/if}
		</p>
		<div class="flex shrink-0 items-center gap-1.5">
			{#if onEdit}
				<button type="button" disabled={!ready} onclick={() => onEdit?.(skill)} class={pillClass('ghost', 'xs')}>
					<Pencil aria-hidden="true" />
					Edit
				</button>
			{/if}
			<button
				type="button"
				disabled={!ready || !enabled}
				onclick={() => onInvoke?.(skill)}
				class={pillClass('secondary', 'xs')}
			>
				<Play aria-hidden="true" />
				Try it
			</button>
		</div>
	</footer>
</article>
