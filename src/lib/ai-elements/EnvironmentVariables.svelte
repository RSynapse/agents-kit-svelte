<script lang="ts">
	export interface EnvVariableEntry {
		name: string;
		value: string;
		required?: boolean;
		scope?: 'runtime' | 'build' | 'secret';
		description?: string;
	}

	interface Props {
		title?: string;
		variables?: EnvVariableEntry[];
		defaultShowValues?: boolean;
		onShowValuesChange?: (show: boolean) => void;
		class?: string;
	}

	const DEFAULT_VARIABLES: EnvVariableEntry[] = [
		{
			name: 'TRAILSIDE_GATEWAY_URL',
			value: 'wss://gateway.trailside.dev/v1/stream',
			required: true,
			scope: 'runtime',
			description: 'WebSocket endpoint for Companion heartbeat and run events.'
		},
		{
			name: 'DATABASE_URL',
			value: 'postgres://neondb_owner:ep_fixture_token@ep-cool-meadow.us-east-2.aws.neon.tech/trailside',
			required: true,
			scope: 'secret',
			description: 'Disposable fixture Postgres connection string.'
		},
		{
			name: 'GITHUB_APP_ID',
			value: '948210',
			required: true,
			scope: 'runtime',
			description: 'Read-only GitHub App identifier for board synchronization.'
		},
		{
			name: 'TRAILSIDE_WORKTREE_ROOT',
			value: '/Users/shared/.trailside/worktrees',
			required: false,
			scope: 'build',
			description: 'Local directory where isolated run worktrees are checked out.'
		}
	];

	let {
		title = 'Environment Variables',
		variables = DEFAULT_VARIABLES,
		defaultShowValues = false,
		onShowValuesChange,
		class: className = ''
	}: Props = $props();

	let showAllValues = $state(false);
	let revealedNames = $state<Record<string, boolean>>({});
	let copiedName = $state<string | null>(null);

	$effect(() => {
		showAllValues = defaultShowValues;
	});

	/**
	 * Toggles global visibility for all environment variable values.
	 */
	function toggleAllValues(): void {
		showAllValues = !showAllValues;
		onShowValuesChange?.(showAllValues);
	}

	/**
	 * Checks whether a single environment variable's value should be shown in plain text.
	 *
	 * @param name - Variable name.
	 * @returns True if globally shown or individually revealed.
	 */
	function isValueVisible(name: string): boolean {
		return showAllValues || Boolean(revealedNames[name]);
	}

	/**
	 * Toggles visibility for an individual environment variable row.
	 *
	 * @param name - Variable name.
	 */
	function toggleSingleValue(name: string): void {
		revealedNames = {
			...revealedNames,
			[name]: !revealedNames[name]
		};
	}

	/**
	 * Masks a secret value into a bounded bullet string (capped at 20 dots).
	 *
	 * @param rawValue - Plaintext variable value.
	 * @returns Masked bullet string.
	 */
	function maskValue(rawValue: string): string {
		// Cap bullet length at 20 characters so long connection strings do not overflow
		const length = Math.min(Math.max(rawValue.length, 8), 20);
		return '•'.repeat(length);
	}

	/**
	 * Copies `export NAME="VALUE"` to the clipboard and sets temporary row feedback.
	 *
	 * @param entry - Environment variable item to copy.
	 */
	async function copyEnvEntry(entry: EnvVariableEntry): Promise<void> {
		const formatted = `${entry.name}=${entry.value}`;
		if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(formatted);
		}
		copiedName = entry.name;
		setTimeout(() => {
			if (copiedName === entry.name) {
				copiedName = null;
			}
		}, 1600);
	}
</script>

<div class="w-full overflow-hidden rounded-xl border border-card-border bg-card-bg text-sm {className}">
	<div class="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border px-4 py-3">
		<div class="flex items-center gap-2">
			<span
				aria-hidden="true"
				class="inline-flex size-5 items-center justify-center rounded bg-canvas-secondary font-mono text-xs text-fg-light"
			>
				⚙
			</span>
			<h3 class="font-medium text-fg-main">{title}</h3>
			<span class="rounded-full bg-canvas-secondary px-2 py-0.5 font-mono text-xs text-fg-light">
				{variables.length}
			</span>
		</div>

		<button
			type="button"
			aria-pressed={showAllValues}
			onclick={toggleAllValues}
			class="inline-flex items-center gap-1.5 rounded-md border border-card-border bg-canvas-primary px-2.5 py-1 font-mono text-xs text-fg-main transition-colors hover:bg-canvas-secondary"
		>
			<span>{showAllValues ? '🙈 Hide values' : '👁 Reveal values'}</span>
		</button>
	</div>

	<div class="divide-y divide-canvas-border">
		{#each variables as item (item.name)}
			{@const visible = isValueVisible(item.name)}
			<div class="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="min-w-0 space-y-1">
					<div class="flex flex-wrap items-center gap-2">
						<span class="font-mono text-xs font-semibold text-fg-main">{item.name}</span>
						{#if item.scope}
							<span
								class="rounded px-1.5 py-0.5 font-mono text-[10px] font-medium {item.scope ===
								'secret'
									? 'bg-status-warning-subtle text-status-warning'
									: item.scope === 'runtime'
										? 'bg-accent-subtle text-accent-primary'
										: 'bg-canvas-secondary text-fg-light'}"
							>
								{item.scope}
							</span>
						{/if}
						{#if item.required}
							<span
								class="rounded bg-status-danger-subtle px-1.5 py-0.5 font-mono text-[10px] font-medium text-status-danger"
							>
								required
							</span>
						{/if}
					</div>
					{#if item.description}
						<p class="text-xs text-fg-light">{item.description}</p>
					{/if}
				</div>

				<div class="flex shrink-0 items-center gap-2">
					<code
						class="max-w-[260px] truncate rounded border border-card-border bg-canvas-primary px-2 py-1 font-mono text-xs {visible
							? 'text-fg-main'
							: 'select-none text-fg-light'}"
					>
						{visible ? item.value : maskValue(item.value)}
					</code>

					<button
						type="button"
						aria-label={visible ? `Hide ${item.name}` : `Reveal ${item.name}`}
						onclick={() => toggleSingleValue(item.name)}
						class="rounded border border-card-border bg-canvas-primary px-2 py-1 font-mono text-xs text-fg-light transition-colors hover:bg-canvas-secondary hover:text-fg-main"
					>
						{visible ? 'Hide' : 'Show'}
					</button>

					<button
						type="button"
						aria-label={`Copy ${item.name}`}
						onclick={() => copyEnvEntry(item)}
						class="rounded border border-card-border bg-canvas-primary px-2 py-1 font-mono text-xs text-fg-main transition-colors hover:bg-canvas-secondary"
					>
						{copiedName === item.name ? '✓ Copied' : 'Copy'}
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
