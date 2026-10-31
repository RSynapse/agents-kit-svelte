<script lang="ts">
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { Check, CircleAlert, ScrollText, TriangleAlert } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { motionDuration } from '../state/motion.svelte';
	import {
		SKILL_DESCRIPTION_MAX_LENGTH,
		SKILL_NAME_MAX_LENGTH,
		serializeSkillManifest,
		validateSkillManifest
	} from '../state/skill-helpers';
	import { INPUT_CLASS, pillClass } from '../ui/styles';
	import type { SkillManifest } from './types';

	interface Props extends Omit<HTMLFormAttributes, 'class' | 'children' | 'manifest' | 'title' | 'saveLabel' | 'onSave' | 'onCancel'> {
		manifest?: SkillManifest;
		title?: string;
		saveLabel?: string;
		onSave?: (manifest: SkillManifest, skillMd: string) => void;
		onCancel?: () => void;
		class?: string;
	}

	const EMPTY_MANIFEST: SkillManifest = { name: '', description: '', allowedTools: [], body: '' };

	let {
		manifest = EMPTY_MANIFEST,
		title = 'Edit skill',
		saveLabel = 'Save skill',
		onSave,
		onCancel,
		class: className = '',
		...rest
	}: Props = $props();

	let name = $state('');
	let description = $state('');
	let tools = $state('');
	let body = $state('');
	let savedAt = $state<string | null>(null);
	let ready = $state(false);

	$effect(() => {
		name = manifest.name;
		description = manifest.description;
		tools = (manifest.allowedTools ?? []).join(', ');
		body = manifest.body;
	});

	$effect(() => {
		ready = true;
	});

	let current = $derived<SkillManifest>({
		name,
		description,
		allowedTools: tools.split(',').map((t) => t.trim()).filter(Boolean),
		body
	});
	let skillMd = $derived(serializeSkillManifest(current));
	let issues = $derived(validateSkillManifest(current));
	let errorCount = $derived(issues.filter((i) => i.level === 'error').length);

	let nameError = $derived(issues.find((i) => i.field === 'name' && i.level === 'error')?.message);
	let descriptionError = $derived(
		issues.find((i) => i.field === 'description' && i.level === 'error')?.message
	);

	/** Saves the manifest when it has no errors. */
	function save(event: SubmitEvent): void {
		event.preventDefault();
		if (errorCount > 0) return;
		onSave?.(current, skillMd);
		savedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	$effect(() => {
		void skillMd;
		savedAt = null;
	});
</script>

<form {...rest}
	aria-label={title}
	onsubmit={save}
	class="@container w-full overflow-hidden rounded-window border border-chat-border bg-card-bg text-sm ak-shadow-soft-sm {className}"
>
	<header class="flex flex-wrap items-center justify-between gap-2 px-4 pt-3.5 pb-3">
		<div>
			<h2 class="text-[15px] font-semibold text-fg-main">{title}</h2>
			<p class="text-xs text-fg-light">The description decides when the agent reaches for this skill.</p>
		</div>
		<div class="flex items-center gap-1.5">
			{#if savedAt}
				<span in:fade={{ duration: motionDuration(140) }} class="flex items-center gap-1 text-xs text-status-success">
					<Check aria-hidden="true" class="size-3.5" />
					Saved {savedAt}
				</span>
			{/if}
			{#if onCancel}
				<button type="button" disabled={!ready} onclick={() => onCancel?.()} class={pillClass('ghost', 'sm')}>Cancel</button>
			{/if}
			<button type="submit" disabled={!ready || errorCount > 0} class={pillClass('accent', 'sm')}>{saveLabel}</button>
		</div>
	</header>

	<div class="grid gap-0 border-t border-chat-border/70 @3xl:grid-cols-2">
		<div class="space-y-3.5 p-4">
			<div>
				<div class="flex items-baseline justify-between">
					<label for="skill-name" class="text-xs font-medium text-fg-main">Name</label>
					<span class="font-mono text-[11px] tabular-nums text-fg-light">{name.length}/{SKILL_NAME_MAX_LENGTH}</span>
				</div>
				<input
					id="skill-name"
					bind:value={name}
					spellcheck="false"
					autocomplete="off"
					aria-invalid={nameError ? 'true' : undefined}
					aria-describedby={nameError ? 'skill-name-error' : undefined}
					class="{INPUT_CLASS} mt-1.5 font-mono"
				/>
				{#if nameError}
					<p id="skill-name-error" class="mt-1 text-xs text-status-danger">{nameError}</p>
				{/if}
			</div>

			<div>
				<div class="flex items-baseline justify-between">
					<label for="skill-description" class="text-xs font-medium text-fg-main">Description</label>
					<span
						class="font-mono text-[11px] tabular-nums {description.length > SKILL_DESCRIPTION_MAX_LENGTH
							? 'text-status-danger'
							: 'text-fg-light'}"
					>
						{description.length}/{SKILL_DESCRIPTION_MAX_LENGTH}
					</span>
				</div>
				<textarea
					id="skill-description"
					bind:value={description}
					rows="3"
					aria-invalid={descriptionError ? 'true' : undefined}
					aria-describedby={descriptionError ? 'skill-description-error' : undefined}
					class="{INPUT_CLASS} mt-1.5 h-auto resize-y py-2 leading-5"
				></textarea>
				{#if descriptionError}
					<p id="skill-description-error" class="mt-1 text-xs text-status-danger">{descriptionError}</p>
				{/if}
			</div>

			<div>
				<label for="skill-tools" class="text-xs font-medium text-fg-main">Allowed tools</label>
				<input
					id="skill-tools"
					bind:value={tools}
					spellcheck="false"
					placeholder="Read, Grep, Bash(git log:*)"
					class="{INPUT_CLASS} mt-1.5 font-mono"
				/>
				<p class="mt-1 text-[11px] text-fg-light">Comma separated. The skill can use these without asking.</p>
			</div>

			<div>
				<label for="skill-body" class="text-xs font-medium text-fg-main">Instructions</label>
				<textarea
					id="skill-body"
					bind:value={body}
					rows="7"
					spellcheck="false"
					class="{INPUT_CLASS} mt-1.5 h-auto resize-y py-2 font-mono text-xs leading-5"
				></textarea>
			</div>
		</div>

		<div class="flex min-w-0 flex-col border-t border-chat-border/70 bg-chat-surface/60 @3xl:border-t-0 @3xl:border-l">
			<p class="flex items-center gap-1.5 px-4 pt-3.5 text-xs font-medium text-fg-light">
				<ScrollText aria-hidden="true" class="size-3.5" />
				SKILL.md
			</p>
			<pre
				aria-label="SKILL.md preview"
				class="m-3 mb-0 max-h-80 flex-1 overflow-auto rounded-[14px] border border-chat-border bg-card-bg p-3 font-mono text-[11.5px] leading-5 whitespace-pre-wrap text-fg-main">{skillMd}</pre>

			<ul class="space-y-1 p-3" aria-label="Checks" aria-live="polite">
				{#each issues as issue (issue.field + issue.message)}
					<li class="flex items-start gap-2 text-xs {issue.level === 'error' ? 'text-status-danger' : 'text-status-warning'}">
						{#if issue.level === 'error'}
							<CircleAlert aria-hidden="true" class="mt-px size-3.5 shrink-0" />
						{:else}
							<TriangleAlert aria-hidden="true" class="mt-px size-3.5 shrink-0" />
						{/if}
						<span><span class="font-mono">{issue.field}</span> · {issue.message}</span>
					</li>
				{:else}
					<li class="flex items-center gap-2 text-xs text-status-success">
						<Check aria-hidden="true" class="size-3.5" />
						Ready to save
					</li>
				{/each}
			</ul>
		</div>
	</div>
</form>
