<script lang="ts">
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
	class="w-full rounded-xl border border-card-border bg-card-bg p-2.5 transition-colors focus-within:border-fg-light/50 {className}"
>
	{#if attachedChips.length > 0}
		<div class="mb-2 flex flex-wrap items-center gap-1.5 px-1">
			{#each attachedChips as chip (chip)}
				<span
					class="inline-flex items-center gap-1.5 rounded-md border border-card-border bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] text-fg-main"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-3 text-fg-light"
					>
						<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
						<path d="M14 2v4a2 2 0 0 0 2 2h4" />
					</svg>
					<span>@{chip}</span>
					<button
						type="button"
						aria-label="Remove {chip}"
						onclick={() => removeContextChip(chip)}
						class="inline-flex size-3.5 items-center justify-center rounded text-fg-light hover:text-fg-main"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="size-3"
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
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
				class="inline-flex size-8 items-center justify-center rounded-lg text-fg-light transition-colors hover:bg-canvas-secondary hover:text-fg-main"
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-4"
				>
					<path d="M5 12h14" />
					<path d="M12 5v14" />
				</svg>
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
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.75"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="size-3.5 text-fg-light"
						>
							<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
							<path d="M14 2v4a2 2 0 0 0 2 2h4" />
						</svg>
						<span>Attach callback/+server.ts</span>
					</button>
					<button
						type="button"
						role="menuitem"
						onclick={() => addContextChip(`skill:${activeSkill}`)}
						class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-fg-main hover:bg-canvas-secondary"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.75"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="size-3.5 text-fg-light"
						>
							<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
						</svg>
						<span>Pin skill: {activeSkill}</span>
					</button>
					<button
						type="button"
						role="menuitem"
						onclick={() => addContextChip('gate:check-boundaries')}
						class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-fg-main hover:bg-canvas-secondary"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.75"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="size-3.5 text-fg-light"
						>
							<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
						</svg>
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
					class="inline-flex size-8 items-center justify-center rounded-lg bg-fg-main text-fg-inverse transition-opacity hover:opacity-90"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="size-3"
					>
						<rect width="14" height="14" x="5" y="5" rx="2" />
					</svg>
				</button>
			{:else}
				<button
					type="submit"
					disabled={!value.trim()}
					aria-label="Send prompt"
					class="inline-flex size-8 items-center justify-center rounded-lg bg-fg-main text-fg-inverse transition-opacity hover:opacity-90 disabled:opacity-35"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-4"
					>
						<path d="m5 12 7-7 7 7" />
						<path d="M12 19V5" />
					</svg>
				</button>
			{/if}
		</div>
	</div>
</form>
