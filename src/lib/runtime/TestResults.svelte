<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Check, ChevronDown, X } from '@lucide/svelte';
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';

	export interface SuiteTestItem {
		id: string;
		name: string;
		status: 'passed' | 'failed' | 'skipped' | 'running';
		durationMs: number;
		errorMessage?: string;
	}

	export interface SuiteGroup {
		id: string;
		name: string;
		status: 'passed' | 'failed' | 'running';
		tests: SuiteTestItem[];
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'suites' | 'durationMs'> {
		suites: SuiteGroup[];
		durationMs?: number;
		class?: string;
	}

	let { suites, durationMs = 1420, class: className = '', ...rest }: Props = $props();

	let openSuiteIds = $state<Record<string, boolean>>({});

	let counts = $derived.by(() => {
		let passed = 0;
		let failed = 0;
		let skipped = 0;
		for (const suite of suites) {
			for (const testItem of suite.tests) {
				if (testItem.status === 'passed') passed += 1;
				else if (testItem.status === 'failed') failed += 1;
				else if (testItem.status === 'skipped') skipped += 1;
			}
		}
		const total = passed + failed + skipped;
		const percent = total > 0 ? Math.round((passed / total) * 100) : 0;
		return { passed, failed, skipped, total, percent };
	});

	/**
	 * Checks whether a test suite is currently expanded (defaults to true).
	 *
	 * @param suiteId - Identifier of the suite.
	 * @returns True if expanded.
	 */
	function isSuiteOpen(suiteId: string): boolean {
		return openSuiteIds[suiteId] ?? true;
	}

	/**
	 * Toggles the expanded state of a test suite.
	 *
	 * @param suiteId - Identifier of the suite to toggle.
	 */
	function toggleSuite(suiteId: string): void {
		openSuiteIds = {
			...openSuiteIds,
			[suiteId]: !isSuiteOpen(suiteId)
		};
	}
</script>

<div {...rest} class={cn('w-full rounded-card border border-card-border bg-card-bg text-sm', className)}>
	<div class="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-border px-4 py-3">
		<div class="flex flex-wrap items-center gap-2">
			<span
				class="inline-flex items-center gap-1.5 rounded-full bg-status-success-subtle px-2.5 py-0.5 text-xs font-medium text-status-success"
			>
				<Check aria-hidden="true" class="size-3.5" />
				{counts.passed} passed
			</span>
			{#if counts.failed > 0}
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-status-danger-subtle px-2.5 py-0.5 text-xs font-medium text-status-danger"
				>
					<X aria-hidden="true" class="size-3.5" />
					{counts.failed} failed
				</span>
			{/if}
			{#if counts.skipped > 0}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-status-warning-subtle px-2.5 py-0.5 text-xs font-medium text-status-warning"
				>
					{counts.skipped} skipped
				</span>
			{/if}
		</div>

		<span class="font-mono text-xs tabular-nums text-fg-light">
			{(durationMs / 1000).toFixed(2)}s · {counts.percent}% passing
		</span>
	</div>

	<div class="space-y-2 p-4">
		{#each suites as suite (suite.id)}
			{@const open = isSuiteOpen(suite.id)}
			<div class="overflow-hidden rounded-lg border border-card-border bg-canvas-secondary/30">
				<button
					type="button"
					aria-expanded={open}
					onclick={() => toggleSuite(suite.id)}
					class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-fg-main transition-colors hover:bg-canvas-secondary"
				>
					<span class="flex items-center gap-2 font-mono">
						<span
							class="inline-flex size-4 items-center justify-center {suite.status === 'failed'
								? 'text-status-danger'
								: 'text-status-success'}"
						>
							{#if suite.status === 'failed'}
								<X aria-hidden="true" class="size-3.5" />
							{:else}
								<Check aria-hidden="true" class="size-3.5" />
							{/if}
						</span>
						<span>{suite.name}</span>
					</span>
					<span class="inline-flex items-center gap-1.5 text-xs text-fg-light">
						<span>{suite.tests.length} {suite.tests.length === 1 ? 'test' : 'tests'}</span>
						<ChevronDown aria-hidden="true" class="size-3.5 transition-transform duration-150 {open ? 'rotate-180' : ''}" />
					</span>
				</button>

				<AgentDisclosure open={open}>
					<ul class="divide-y divide-canvas-border border-t border-canvas-border bg-card-bg">
						{#each suite.tests as testItem (testItem.id)}
							<li class="px-3 py-2 text-xs">
								<div class="flex items-center justify-between gap-2">
									<span class="flex items-center gap-2 text-fg-main">
										<span
											class="inline-flex size-4 items-center justify-center {testItem.status ===
											'failed'
												? 'text-status-danger'
												: 'text-status-success'}"
										>
											{#if testItem.status === 'failed'}
												<X aria-hidden="true" class="size-3.5" />
											{:else}
												<Check aria-hidden="true" class="size-3.5" />
											{/if}
										</span>
										<span>{testItem.name}</span>
									</span>
									<span class="font-mono text-[11px] tabular-nums text-fg-light">
										{testItem.durationMs}ms
									</span>
								</div>
								{#if testItem.errorMessage}
									<pre
										class="mt-1.5 overflow-x-auto rounded bg-status-danger-subtle p-2 font-mono text-[11px] text-status-danger"
									>{testItem.errorMessage}</pre>
								{/if}
							</li>
						{/each}
					</ul>
				</AgentDisclosure>
			</div>
		{/each}
	</div>
</div>
