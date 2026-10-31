<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { SEGMENT_GROUP_CLASS, badgeClass, segmentClass } from '../ui/styles';
	import { ArrowRight, BadgeCheck, Check, Package } from '@lucide/svelte';
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

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'name' | 'currentVersion' | 'newVersion' | 'changeType' | 'license' | 'description' | 'verified' | 'scripts' | 'dependencies'> {
		name: string;
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

	let {
		name,
		currentVersion = '0.4.2',
		newVersion = '0.5.0',
		changeType = 'minor',
		license = 'MIT',
		description,
		verified = true,
		scripts = [],
		dependencies = [],
		class: className = '',
		...rest
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

<div {...rest} class="w-full rounded-card border border-card-border bg-card-bg p-4 text-sm {className}">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<span
					aria-hidden="true"
					class="inline-flex size-6 items-center justify-center rounded-md bg-accent-subtle font-mono text-xs text-accent-primary"
				>
					<Package aria-hidden="true" />
				</span>
				<span class="font-mono text-sm font-semibold text-fg-main">{name}</span>
				{#if verified}
					<span
						class={badgeClass('success')}
					>
						<BadgeCheck aria-hidden="true" />
						Verified
					</span>
				{/if}
			</div>

			{#if currentVersion || newVersion}
				<div class="flex items-center gap-2 font-mono text-xs text-fg-light">
					{#if currentVersion}
						<span>v{currentVersion}</span>
					{/if}
					{#if currentVersion && newVersion}
						<ArrowRight aria-hidden="true" class="size-3" />
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
				class="rounded-chip px-1.5 py-px font-mono text-[11px] font-medium capitalize {getChangeBadgeClasses(
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
		<div class="{SEGMENT_GROUP_CLASS} mb-2.5">
			<button
				type="button"
				onclick={() => (activeTab = 'dependencies')}
				class="{segmentClass(activeTab === 'dependencies')}"
			>
				Dependencies ({dependencies.length})
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'scripts')}
				class="{segmentClass(activeTab === 'scripts')}"
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
