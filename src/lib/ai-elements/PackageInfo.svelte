<script lang="ts">
	export type PackageChangeType = 'major' | 'minor' | 'patch' | 'added' | 'removed';

	export interface PackageDependencyItem {
		name: string;
		version: string;
		dev?: boolean;
	}

	export interface PackageScriptItem {
		name: string;
		command: string;
	}

	interface Props {
		name?: string;
		currentVersion?: string;
		newVersion?: string;
		changeType?: PackageChangeType;
		license?: string;
		description?: string;
		verified?: boolean;
		scripts?: PackageScriptItem[];
		dependencies?: PackageDependencyItem[];
		class?: string;
	}

	const DEFAULT_SCRIPTS: PackageScriptItem[] = [
		{ name: 'dev', command: 'vite dev' },
		{ name: 'check', command: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json' },
		{ name: 'test', command: 'node --experimental-strip-types --test tests/*.test.ts' }
	];

	const DEFAULT_DEPENDENCIES: PackageDependencyItem[] = [
		{ name: 'svelte', version: '^5.55.1' },
		{ name: '@sveltejs/kit', version: '^2.57.0' },
		{ name: 'tailwindcss', version: '^4.2.2', dev: true },
		{ name: 'typescript', version: '^6.0.2', dev: true }
	];

	let {
		name = '@trailside/agents-kit-svelte',
		currentVersion = '0.4.2',
		newVersion = '0.5.0',
		changeType = 'minor',
		license = 'MIT',
		description = 'Svelte 5 Runes agentic UI primitives, GitHub workflow cards, and generative surfaces.',
		verified = true,
		scripts = DEFAULT_SCRIPTS,
		dependencies = DEFAULT_DEPENDENCIES,
		class: className = ''
	}: Props = $props();

	let activeTab = $state<'dependencies' | 'scripts'>('dependencies');

	/**
	 * Maps a semantic version change type to semantic badge classes.
	 *
	 * @param kind - PackageChangeType value.
	 * @returns Tailwind class string for the badge.
	 */
	function getChangeBadgeClasses(kind: PackageChangeType): string {
		switch (kind) {
			case 'major':
				return 'bg-status-danger-subtle text-status-danger';
			case 'minor':
				return 'bg-status-warning-subtle text-status-warning';
			case 'patch':
				return 'bg-status-success-subtle text-status-success';
			case 'added':
				return 'bg-accent-subtle text-accent-primary';
			case 'removed':
				return 'bg-canvas-secondary text-fg-light';
		}
	}
</script>

<div class="w-full rounded-xl border border-card-border bg-card-bg p-4 text-sm {className}">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<span
					aria-hidden="true"
					class="inline-flex size-6 items-center justify-center rounded-md bg-accent-subtle font-mono text-xs text-accent-primary"
				>
					📦
				</span>
				<span class="font-mono text-sm font-semibold text-fg-main">{name}</span>
				{#if verified}
					<span
						class="rounded-full bg-status-success-subtle px-2 py-0.5 font-mono text-[11px] font-medium text-status-success"
					>
						✓ verified
					</span>
				{/if}
			</div>

			{#if currentVersion || newVersion}
				<div class="flex items-center gap-2 font-mono text-xs text-fg-light">
					{#if currentVersion}
						<span>v{currentVersion}</span>
					{/if}
					{#if currentVersion && newVersion}
						<span aria-hidden="true">→</span>
					{/if}
					{#if newVersion}
						<span class="font-semibold text-fg-main">v{newVersion}</span>
					{/if}
					{#if license}
						<span>· {license} License</span>
					{/if}
				</div>
			{/if}
		</div>

		{#if changeType}
			<span
				class="rounded-full px-2.5 py-0.5 font-mono text-xs font-medium capitalize {getChangeBadgeClasses(
					changeType
				)}"
			>
				{changeType} update
			</span>
		{/if}
	</div>

	{#if description}
		<p class="mt-2.5 text-xs leading-relaxed text-fg-light">{description}</p>
	{/if}

	<div class="mt-3 border-t border-canvas-border pt-3">
		<div class="mb-2.5 flex items-center gap-2">
			<button
				type="button"
				onclick={() => (activeTab = 'dependencies')}
				class="rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors {activeTab ===
				'dependencies'
					? 'bg-accent-subtle text-accent-primary'
					: 'text-fg-light hover:bg-canvas-secondary hover:text-fg-main'}"
			>
				Dependencies ({dependencies.length})
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'scripts')}
				class="rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors {activeTab ===
				'scripts'
					? 'bg-accent-subtle text-accent-primary'
					: 'text-fg-light hover:bg-canvas-secondary hover:text-fg-main'}"
			>
				Scripts ({scripts.length})
			</button>
		</div>

		{#if activeTab === 'dependencies'}
			<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
				{#each dependencies as dep (dep.name)}
					<div
						class="flex items-center justify-between rounded-lg border border-card-border bg-canvas-primary px-3 py-1.5 font-mono text-xs"
					>
						<span class="truncate text-fg-main">{dep.name}</span>
						<div class="flex items-center gap-1.5">
							{#if dep.dev}
								<span class="rounded bg-canvas-secondary px-1.5 py-0.5 text-[10px] text-fg-light">
									dev
								</span>
							{/if}
							<span class="text-fg-light">{dep.version}</span>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="space-y-1.5">
				{#each scripts as script (script.name)}
					<div
						class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-card-border bg-canvas-primary px-3 py-1.5 font-mono text-xs"
					>
						<span class="font-semibold text-accent-primary">pnpm {script.name}</span>
						<code class="truncate text-fg-light">{script.command}</code>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
