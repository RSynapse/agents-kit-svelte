<script lang="ts">
	import { pillClass, SOFT } from '../ui/styles';
	import { fade } from 'svelte/transition';
	import { rise } from '../state/motion.svelte';
	import {
		ArrowUp,
		AtSign,
		Check,
		ChevronDown,
		FileIcon,
		GitBranch,
		Plus,
		Shield,
		Sparkle,
		Sparkles,
		Square,
		X
	} from '@lucide/svelte';
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
	let agentMenuOpen = $state(false);
	let formEl: HTMLFormElement | undefined = $state();
	let canSend = $derived(value.trim().length > 0);
	let selectedAgent = $derived(agents.find((agentOpt) => agentOpt.id === selectedAgentId));

	/**
	 * Picks a Lucide icon for a context chip based on its `kind:` prefix.
	 *
	 * @param chip - Chip tag such as `worktree:…` or `file:…`.
	 * @returns Icon component.
	 */
	function chipIcon(chip: string) {
		if (chip.startsWith('worktree:')) return GitBranch;
		if (chip.startsWith('skill:')) return Sparkles;
		if (chip.startsWith('gate:')) return Shield;
		if (chip.startsWith('file:')) return FileIcon;
		return AtSign;
	}

	/**
	 * Strips the `kind:` prefix for display.
	 *
	 * @param chip - Chip tag.
	 * @returns Human-readable label.
	 */
	function chipLabel(chip: string): string {
		const idx = chip.indexOf(':');
		return idx >= 0 ? chip.slice(idx + 1) : chip;
	}
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
	 * Selects an agent from the soft agent menu and closes it.
	 *
	 * @param agentId - Agent to run with.
	 */
	function pickAgent(agentId: SupportedAgentId): void {
		agentMenuOpen = false;
		if (agentId !== selectedAgentId) onAgentChange?.(agentId);
	}

	/**
	 * Arrow keys move between agent options; Escape closes the menu.
	 *
	 * @param event - KeyboardEvent from the listbox.
	 */
	function handleAgentMenuKey(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			agentMenuOpen = false;
			return;
		}
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		event.preventDefault();
		const options = Array.from(
			(event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)')
		);
		const current = options.indexOf(document.activeElement as HTMLButtonElement);
		const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
		options[(next + options.length) % options.length]?.focus();
	}

	// Close either menu on an outside click or Escape.
	$effect(() => {
		if (!menuOpen && !agentMenuOpen) return;
		const onPointer = (event: PointerEvent) => {
			if (formEl && !formEl.contains(event.target as Node)) {
				menuOpen = false;
				agentMenuOpen = false;
			}
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				menuOpen = false;
				agentMenuOpen = false;
			}
		};
		document.addEventListener('pointerdown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('pointerdown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	});

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
	bind:this={formEl}
	onsubmit={(e) => {
		e.preventDefault();
		submitPrompt();
	}}
	data-busy={busy}
	class="ak-soft-focus w-full rounded-composer border border-chat-border bg-card-bg px-3 pt-3 pb-2.5 focus-within:border-fg-light/35 {className}"
>
	{#if attachedChips.length > 0}
		<div class="mb-1.5 flex flex-wrap items-center gap-1.5 px-1">
			{#each attachedChips as chip (chip)}
				{@const ChipIcon = chipIcon(chip)}
				<span in:rise={{ y: 2 }} class="{SOFT.chip} max-w-full pr-1">
					<ChipIcon aria-hidden="true" class="text-fg-light" />
					<span class="truncate font-mono text-[11px]">{chipLabel(chip)}</span>
					<button
						type="button"
						aria-label="Remove {chip}"
						onclick={() => removeContextChip(chip)}
						class="inline-flex size-4 items-center justify-center rounded-full text-fg-light transition-colors hover:bg-fg-main/10 hover:text-fg-main"
					><X aria-hidden="true" class="size-3" /></button>
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
			class="field-sizing-content max-h-60 min-h-12 w-full resize-none bg-transparent px-1.5 py-1 text-[15px] leading-6 text-fg-main placeholder:text-fg-light/80 focus:outline-none disabled:opacity-50"
		></textarea>
	</label>

	<div class="mt-1 flex items-center justify-between gap-2">
		<div class="relative flex min-w-0 items-center gap-1">
			<button
				type="button"
				aria-label="Add context or skill"
				aria-expanded={menuOpen}
				onclick={() => {
					menuOpen = !menuOpen;
					agentMenuOpen = false;
				}}
				class={pillClass('secondary', 'icon')}
			>
				<Plus aria-hidden="true" class="transition-transform duration-200 {menuOpen ? 'rotate-45' : ''}" />
			</button>

			{#if menuOpen}
				<div
					role="menu"
					aria-label="Context attachments"
					transition:rise={{ y: 4, duration: 140 }}
					class="absolute bottom-11 left-0 z-20 w-64 rounded-soft border border-chat-border bg-card-bg p-1.5 ak-shadow-soft"
				>
					<p class="px-2.5 pt-1 pb-1.5 text-[11px] font-medium text-fg-light">Add to context</p>
					<button
						type="button"
						role="menuitem"
						onclick={() => addContextChip('file:apps/web/src/routes/auth/callback/+server.ts')}
						class="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px] text-fg-main transition-colors hover:bg-chat-surface"
					>
						<FileIcon aria-hidden="true" class="size-4 text-fg-light" />
						<span>Attach callback/+server.ts</span>
					</button>
					<button
						type="button"
						role="menuitem"
						onclick={() => addContextChip(`skill:${activeSkill}`)}
						class="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px] text-fg-main transition-colors hover:bg-chat-surface"
					>
						<Sparkles aria-hidden="true" class="size-4 text-fg-light" />
						<span>Pin skill: {activeSkill}</span>
					</button>
					<button
						type="button"
						role="menuitem"
						onclick={() => addContextChip('gate:check-boundaries')}
						class="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px] text-fg-main transition-colors hover:bg-chat-surface"
					>
						<Shield aria-hidden="true" class="size-4 text-fg-light" />
						<span>Include boundary gate check</span>
					</button>
				</div>
			{/if}

			<div class="relative min-w-0">
				<button
					type="button"
					aria-label="Supported Agent: {selectedAgent?.label ?? 'none'}"
					aria-haspopup="listbox"
					aria-expanded={agentMenuOpen}
					onclick={() => {
						agentMenuOpen = !agentMenuOpen;
						menuOpen = false;
					}}
					class="inline-flex h-8 max-w-full min-w-0 items-center gap-1 rounded-full pr-2.5 pl-3 text-[13px] transition-colors hover:bg-chat-user/70 hover:text-fg-main {agentMenuOpen
						? 'bg-chat-user/70 text-fg-main'
						: 'text-fg-light'}"
				>
					<span class="truncate">{selectedAgent?.label ?? 'Agent'}</span>
					{#if selectedAgent?.version}
						<span class="hidden text-fg-light/70 sm:inline">{selectedAgent.version}</span>
					{/if}
					<ChevronDown
						aria-hidden="true"
						class="size-3.5 transition-transform duration-200 {agentMenuOpen ? 'rotate-180' : ''}"
					/>
				</button>

				{#if agentMenuOpen}
					<div
						role="listbox"
						tabindex="-1"
						aria-label="Supported Agent"
						transition:rise={{ y: 4, duration: 140 }}
						onkeydown={handleAgentMenuKey}
						class="absolute bottom-11 left-0 z-20 w-64 rounded-soft border border-chat-border bg-card-bg p-1.5 ak-shadow-soft"
					>
						<p class="px-2.5 pt-1 pb-1.5 text-[11px] font-medium text-fg-light">Run with</p>
						{#each agents as agentOpt (agentOpt.id)}
							{@const isSelected = agentOpt.id === selectedAgentId}
							<button
								type="button"
								role="option"
								aria-selected={isSelected}
								disabled={!agentOpt.signedIn}
								onclick={() => pickAgent(agentOpt.id)}
								class="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left transition-colors hover:bg-chat-surface focus-visible:bg-chat-surface disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-transparent {isSelected
									? 'bg-chat-surface'
									: ''}"
							>
								<span
									class="inline-flex size-7 shrink-0 items-center justify-center rounded-full [&_svg]:size-3.5 {isSelected
										? 'bg-chat-accent-subtle text-chat-accent'
										: 'bg-chat-user text-fg-light'}"
								>
									<Sparkle aria-hidden="true" class={isSelected ? 'fill-current' : ''} />
								</span>
								<span class="min-w-0 flex-1">
									<span class="block truncate text-[13px] font-medium text-fg-main">{agentOpt.label}</span>
									<span class="block text-[11px] text-fg-light">
										v{agentOpt.version.replace(/^v/, "")} · {agentOpt.signedIn ? 'Signed in' : 'Not signed in'}
									</span>
								</span>
								{#if isSelected}
									<Check aria-hidden="true" class="size-4 shrink-0 text-chat-accent" />
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<span class="hidden h-7 items-center gap-1.5 rounded-full px-2.5 text-xs text-fg-light sm:inline-flex">
				<Sparkles aria-hidden="true" class="size-3.5 text-chat-accent" />
				{activeSkill}
			</span>
		</div>

		<div class="flex shrink-0 items-center gap-2">
			{#if busy}
				<button
					in:fade={{ duration: 120 }}
					type="button"
					onclick={onStop}
					aria-label="Stop run"
					class={pillClass('primary', 'icon')}
				>
					<Square aria-hidden="true" class="size-3 fill-current" />
				</button>
			{:else}
				<button
					type="submit"
					disabled={!canSend}
					aria-label="Send prompt"
					class="inline-flex size-8 items-center justify-center rounded-full transition-colors duration-200 {canSend
						? 'bg-chat-accent text-white hover:bg-chat-accent/90'
						: 'bg-chat-user text-fg-light'}"
				>
					<ArrowUp aria-hidden="true" class="size-4" strokeWidth={2.25} />
				</button>
			{/if}
		</div>
	</div>
</form>
