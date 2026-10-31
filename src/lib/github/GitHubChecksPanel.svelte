<script lang="ts">
	import { Check, RefreshCw, X, Zap } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	import type { GitHubCheckItem } from '../types';

	interface Props {
		title?: string;
		checks?: GitHubCheckItem[];
		onFixWithAgent?: (checkId: string) => void;
		onRerunCheck?: (checkId: string) => void;
		class?: string;
	}

	const DEFAULT_CHECKS: GitHubCheckItem[] = [
		{
			id: 'ci-1',
			name: 'corepack pnpm check (svelte-check & tsc)',
			workflow: 'check-and-test',
			status: 'passed',
			duration: '18.4s',
			summary: '0 errors, 0 warnings across 6 packages'
		},
		{
			id: 'ci-2',
			name: 'node scripts/check-boundaries.ts',
			workflow: 'check-and-test',
			status: 'passed',
			duration: '2.1s',
			summary: 'All service, domain, and UI boundary rules satisfied'
		},
		{
			id: 'ci-3',
			name: 'Playwright mobile viewport tap-target gate (390x844)',
			workflow: 'browser-parity',
			status: 'failed',
			duration: '14.2s',
			summary: 'Expected action pill height >= 36px, measured 30px on /w/settings'
		},
		{
			id: 'ci-4',
			name: 'CSS growth ratchet & a11y baseline',
			workflow: 'static-review',
			status: 'passed',
			duration: '3.6s',
			summary: '32 static checks passed'
		}
	];

	let {
		title = 'GitHub Actions & Check Suites',
		checks = DEFAULT_CHECKS,
		onFixWithAgent,
		onRerunCheck,
		class: className = ''
	}: Props = $props();

	let fixingIds = $state<Record<string, boolean>>({});
	let rerunningIds = $state<Record<string, boolean>>({});

	/**
	 * Dispatches the agent to diagnose and fix a failing CI check.
	 *
	 * @param checkId - Identifier of the failing check item.
	 */
	function triggerAgentFix(checkId: string): void {
		fixingIds = { ...fixingIds, [checkId]: true };
		onFixWithAgent?.(checkId);
	}

	/**
	 * Triggers a check suite re-run.
	 *
	 * @param checkId - Identifier of the check item.
	 */
	function triggerRerun(checkId: string): void {
		rerunningIds = { ...rerunningIds, [checkId]: true };
		onRerunCheck?.(checkId);
	}
</script>

<section
	aria-label={title}
	class="rounded-card border border-card-border bg-card-bg p-4 text-sm {className}"
>
	<header class="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border pb-3">
		<div>
			<h3 class="font-semibold text-fg-main">{title}</h3>
			<p class="text-xs text-fg-light">
				Live Commit Statuses & Workflow Gates · Read-only GitHub App integration
			</p>
		</div>
		<span class="rounded-full bg-canvas-secondary px-2.5 py-0.5 font-mono text-xs text-fg-main">
			{checks.filter((c) => c.status === 'passed').length}/{checks.length} passing
		</span>
	</header>

	<ul class="mt-3 divide-y divide-canvas-border">
		{#each checks as check (check.id)}
			{@const isFixing = fixingIds[check.id] ?? false}
			{@const isRerunning = rerunningIds[check.id] ?? false}
			<li class="flex flex-wrap items-start justify-between gap-3 py-2.5 text-xs">
				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-2">
						<span
							class="inline-flex size-4 shrink-0 items-center justify-center rounded-full {isFixing ||
							isRerunning
								? 'bg-accent-subtle text-accent-primary'
								: check.status === 'passed'
									? 'bg-status-success-subtle text-status-success'
									: check.status === 'failed'
										? 'bg-status-danger-subtle text-status-danger'
										: 'bg-canvas-secondary text-fg-light'}"
						>
							{#if isFixing || isRerunning}
								<RefreshCw class="size-2.5 animate-spin" />
							{:else if check.status === 'passed'}
								<Check class="size-2.5" strokeWidth={3} />
							{:else}
								<X class="size-2.5" strokeWidth={3} />
							{/if}
						</span>
						<span class="font-medium text-fg-main">{check.name}</span>
						<span class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
							{check.workflow}
						</span>
						<span class="font-mono text-[11px] tabular-nums text-fg-light">{check.duration}</span>
					</div>
					{#if check.summary}
						<p class="mt-1 pl-6 text-fg-light">{check.summary}</p>
					{/if}
				</div>

				<div class="flex items-center gap-1.5">
					{#if check.status === 'failed'}
						<button
							type="button"
							onclick={() => triggerAgentFix(check.id)}
							class={buttonClass('primary', 'sm')}
						>
							{#if isFixing}<RefreshCw aria-hidden="true" />Claude Code Fixing…{:else}<Zap aria-hidden="true" />Fix with Claude Code{/if}
						</button>
					{/if}
					<button
						type="button"
						onclick={() => triggerRerun(check.id)}
						class={buttonClass('secondary', 'sm')}
					>
						{#if isRerunning}Re-running…{:else}<RefreshCw aria-hidden="true" />Re-run{/if}
					</button>
				</div>
			</li>
		{/each}
	</ul>
</section>
