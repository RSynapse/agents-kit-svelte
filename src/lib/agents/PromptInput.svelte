<script lang="ts">
	import { buttonClass } from '../ui/styles';
	import { ArrowUp, FileIcon, Plus, Shield, Sparkles, Square, X } from '@lucide/svelte';
	import { isImeComposing } from '../state/chat-helpers';
	import type { SupportedAgentId, SupportedAgentOption } from '../types';

	interface Props {
		value?: string;
		placeholder?: string;
		busy?: boolean;
		agents: SupportedAgentOption[];
		selectedAgentId: SupportedAgentId;
		activeSkill?: string;
		onAgentChange?: (agentId: SupportedAgentId) => void;
		onSubmit?: (prompt: string) => void;
		onStop?: () => void;
		onQuickContext?: (contextTag: string) => void;
		class?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Ask Claude Code or guide the current run…',
		busy = false,
		agents,
		selectedAgentId,
		activeSkill = 'Backend v2',
		onAgentChange,
		onSubmit,
		onStop,
		onQuickContext,
		class: className = ''
	}: Props = $props();

	let menuOpen = $state(false);
	let attachedChips = $state<string[]>(['worktree:trailside/1210-auth-redirect']);
	let ready = $state(false);

	$effect(() => {
		ready = true;
	});

	/**
	 * Submits the current prompt text when non-empty and resets the composer input.
	 */
	function submitPrompt(): void {
		const trimmed = value.trim();
		if (!trimmed || busy) return;
		value = '';
		onSubmit?.(trimmed);
	}

	/**
	 * Handles Enter-to-submit while guarding against active IME composition (`isComposing` / `keyCode === 229`).
	 *
	 * @param event - KeyboardEvent from the prompt textarea.
	 */
	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key !== 'Enter' || event.shiftKey) {
			return;
		}
		if (isImeComposing(event)) {
			return;
		}
		event.preventDefault();
		submitPrompt();
	}

	/**
	 * Adds a context pill to the prompt composer from the `+` action menu.
	 *
	 * @param tag - Context identifier to attach.
	 */
	function addContextChip(tag: string): void {
		if (!attachedChips.includes(tag)) {
			attachedChips = [...attachedChips, tag];
		}
		menuOpen = false;
		onQuickContext?.(tag);
	}

	/**
	 * Removes an attached context pill from the composer.
	 *
	 * @param tag - Context identifier to remove.
	 */
	function removeContextChip(tag: string): void {
		attachedChips = attachedChips.filter((item) => item !== tag);
	}
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		submitPrompt();
	}}
	class="w-full rounded-card border border-card-border bg-card-bg p-2.5 transition-colors focus-within:border-fg-light/50 {className}"
>
	{#if attachedChips.length > 0}
		<div class="mb-2 flex flex-wrap items-center gap-1.5 px-1">
			{#each attachedChips as chip (chip)}
				<span
					class="inline-flex items-center gap-1.5 rounded-md border border-card-border bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] text-fg-main"
				>
					<FileIcon aria-hidden="true" class="size-3 text-fg-light" />
					<span>@{chip}</span>
					<button
						type="button"
						aria-label="Remove {chip}"
						onclick={() => removeContextChip(chip)}
						class={buttonClass('ghost', 'icon-sm')}
					><X aria-hidden="true" class="size-3" />
					</button>
				</span>
			{/each}
		</div>
	{/if}

	<label class="block">
		<span class="sr-only">{placeholder}</span>
		<textarea
			rows={2}
			bind:value
			{placeholder}
			disabled={!ready}
			aria-label={placeholder}
			onkeydown={handleKeyDown}
			class="w-full resize-none bg-transparent px-1.5 py-1 text-sm leading-6 text-fg-main placeholder:text-fg-light focus:outline-none disabled:opacity-50"
		></textarea>
	</label>

	<div class="mt-2 flex flex-wrap items-center justify-between gap-2 pt-1">
		<div class="relative flex flex-wrap items-center gap-1.5">
			<button
				type="button"
				aria-label="Add context or skill"
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
				class={buttonClass('ghost', 'icon')}
			>
				<Plus aria-hidden="true" class="size-4" />
			</button>

			{#if menuOpen}
				<div
					role="menu"
					aria-label="Context attachments"
					class="absolute bottom-10 left-0 z-20 w-60 rounded-lg border border-card-border bg-card-bg p-1.5 shadow-lg"
				>
					<button
						type="button"
						role="menuitem"
						onclick={() => addContextChip('file:apps/web/src/routes/auth/callback/+server.ts')}
						class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-fg-main hover:bg-canvas-secondary"
					>
						<FileIcon aria-hidden="true" class="size-3.5 text-fg-light" />
						<span>Attach callback/+server.ts</span>
					</button>
					<button
						type="button"
						role="menuitem"
						onclick={() => addContextChip(`skill:${activeSkill}`)}
						class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-fg-main hover:bg-canvas-secondary"
					>
						<Sparkles aria-hidden="true" class="size-3.5 text-fg-light" />
						<span>Pin skill: {activeSkill}</span>
					</button>
					<button
						type="button"
						role="menuitem"
						onclick={() => addContextChip('gate:check-boundaries')}
						class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-fg-main hover:bg-canvas-secondary"
					>
						<Shield aria-hidden="true" class="size-3.5 text-fg-light" />
						<span>Include boundary gate check</span>
					</button>
				</div>
			{/if}

			<label class="inline-flex items-center gap-1.5 text-xs text-fg-light">
				<span class="sr-only">Supported Agent</span>
				<select
					aria-label="Supported Agent"
					value={selectedAgentId}
					onchange={(e) => {
						const target = e.currentTarget as HTMLSelectElement;
						onAgentChange?.(target.value as SupportedAgentId);
					}}
					class="h-8 rounded-lg px-2 text-xs font-medium text-fg-light transition-colors hover:bg-canvas-secondary hover:text-fg-main focus:outline-none"
				>
					{#each agents as agentOpt (agentOpt.id)}
						<option value={agentOpt.id}>
							{agentOpt.label} ({agentOpt.version})
						</option>
					{/each}
				</select>
			</label>

			<span
				class="hidden rounded-lg bg-canvas-secondary px-2.5 py-1 text-xs font-medium text-fg-light sm:inline-block"
			>
				Skill: {activeSkill}
			</span>
		</div>

		<div class="flex items-center gap-2">
			{#if busy}
				<button
					type="button"
					onclick={onStop}
					aria-label="Stop run"
					class={buttonClass('primary', 'icon')}
				>
					<Square aria-hidden="true" class="size-3" />
				</button>
			{:else}
				<button
					type="submit"
					disabled={!value.trim()}
					aria-label="Send prompt"
					class={buttonClass('primary', 'icon')}
				>
					<ArrowUp aria-hidden="true" class="size-4" />
				</button>
			{/if}
		</div>
	</div>
</form>
