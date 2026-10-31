<script lang="ts">
	import { History, RefreshCw } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
	export type RouteStatus = 'selected' | 'available' | 'unavailable';

	export interface RouteClassification {
		intent: string;
		confidence: number;
		reasoning: string;
	}

	export interface AgentRoute {
		id: string;
		agentName: string;
		specialty: string;
		matchScore: number;
		status: RouteStatus;
		description: string;
	}

	export interface RoutingHistoryEntry {
		id: string;
		query: string;
		intent: string;
		agentName: string;
		timestamp: string;
	}

	interface Props {
		inputQuery?: string;
		classification?: RouteClassification;
		routes?: AgentRoute[];
		selectedRouteId?: string;
		routingHistory?: RoutingHistoryEntry[];
		isClassifying?: boolean;
		onReclassify?: () => void;
		onOverrideRoute?: (routeId: string) => void;
		onViewHistory?: () => void;
		class?: string;
	}

	const defaultRoutes: AgentRoute[] = [
		{
			id: 'claude-code',
			agentName: 'Claude Code 1.0',
			specialty: 'Multi-file TDD & Worktree Refactoring',
			matchScore: 96,
			status: 'selected',
			description:
				'Deep repository context, atomic database/outbox edits, and Svelte 5 Runes migration.'
		},
		{
			id: 'codex',
			agentName: 'Codex 0.42',
			specialty: 'Referee Verification & Contract Audits',
			matchScore: 78,
			status: 'available',
			description:
				'Fast deterministic static analysis, schema validation, and adversarial diff review.'
		},
		{
			id: 'gemini',
			agentName: 'Gemini 2.5 Pro',
			specialty: 'Long-Context Architecture & Spec Synthesis',
			matchScore: 64,
			status: 'available',
			description:
				'Cross-document ADR synthesis, large transcript analysis, and visual layout comparison.'
		}
	];

	const defaultClassification: RouteClassification = {
		intent: 'Multi-file TDD Implementation (Risk Tier T2)',
		confidence: 96,
		reasoning:
			'Task requires editing domain handlers and adding unit tests inside an isolated git worktree, matching Claude Code 1.0 capabilities.'
	};

	const defaultHistory: RoutingHistoryEntry[] = [
		{
			id: 'hist-1',
			query: 'Audit PR 204 against ENG-0001 boundary constraints',
			intent: 'Referee Review',
			agentName: 'Codex 0.42',
			timestamp: '3 min ago'
		},
		{
			id: 'hist-2',
			query: 'Compare G0 spec with M3 onboarding amendments',
			intent: 'Spec Synthesis',
			agentName: 'Gemini 2.5 Pro',
			timestamp: '14 min ago'
		}
	];

	let {
		inputQuery = 'Implement idempotent retry reauthorization before revision check in outbox handler',
		classification = defaultClassification,
		routes = defaultRoutes,
		selectedRouteId,
		routingHistory = defaultHistory,
		isClassifying = false,
		onReclassify,
		onOverrideRoute,
		onViewHistory,
		class: className = ''
	}: Props = $props();

	let activeRouteId = $state('claude-code');
	let showHistory = $state(false);

	$effect(() => {
		activeRouteId =
			selectedRouteId ?? routes.find((route) => route.status === 'selected')?.id ?? 'claude-code';
	});

	/**
	 * Overrides the selected agent route and notifies the parent callback.
	 *
	 * @param routeId - Identifier of the target route to select.
	 */
	function handleSelectRoute(routeId: string): void {
		activeRouteId = routeId;
		onOverrideRoute?.(routeId);
	}

	/**
	 * Toggles the recent routing history drawer and notifies the optional callback.
	 */
	function handleToggleHistory(): void {
		showHistory = !showHistory;
		onViewHistory?.();
	}
</script>

<section
	aria-label="Intent classifier and agent router"
	class="w-full overflow-hidden rounded-xl border border-card-border bg-card-bg text-sm {className}"
>
	<header
		class="flex flex-col gap-3 border-b border-canvas-border p-4 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<p class="font-mono text-xs font-medium text-fg-light">Intent Classifier & Model Router</p>
			<h2 class="mt-0.5 text-base font-semibold text-fg-main">{classification.intent}</h2>
			<p class="mt-1 rounded bg-canvas-primary px-2.5 py-1.5 font-mono text-xs text-fg-light">
				"{inputQuery}"
			</p>
		</div>

		<div class="flex shrink-0 items-center gap-2">
			<button
				type="button"
				disabled={isClassifying}
				onclick={() => onReclassify?.()}
				class={buttonClass('secondary', 'md')}
			>
				<RefreshCw aria-hidden="true" />
				{isClassifying ? 'Classifying…' : 'Reclassify'}
			</button>
			<button
				type="button"
				aria-expanded={showHistory}
				onclick={handleToggleHistory}
				class={buttonClass('secondary', 'md')}
			>
				<History aria-hidden="true" />
				History ({routingHistory.length})
			</button>
		</div>
	</header>

	<div class="border-b border-canvas-border bg-canvas-primary p-4">
		<div class="flex items-start justify-between gap-4">
			<div>
				<p class="text-xs font-semibold text-fg-main">Routing Reasoning</p>
				<p class="mt-1 text-xs leading-relaxed text-fg-light">{classification.reasoning}</p>
			</div>
			<span
				class="shrink-0 rounded-full bg-accent-subtle px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-accent-primary"
			>
				{classification.confidence}% confidence
			</span>
		</div>
		<div
			role="progressbar"
			aria-label="Classification confidence"
			aria-valuenow={classification.confidence}
			aria-valuemin={0}
			aria-valuemax={100}
			class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-canvas-secondary"
		>
			<span
				class="block h-full rounded-full bg-accent-primary"
				style="width: {classification.confidence}%;"
			></span>
		</div>
	</div>

	<div class="divide-y divide-canvas-border">
		{#each routes as route (route.id)}
			{@const isSelected = route.id === activeRouteId}
			<article
				class="flex items-start justify-between gap-3 px-4 py-3 transition-colors {isSelected
					? 'bg-accent-subtle/30'
					: ''}"
			>
				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-2">
						<h3 class="font-medium text-fg-main">{route.agentName}</h3>
						<span class="text-xs text-fg-light">· {route.specialty}</span>
						<span
							class="rounded-full px-2 py-0.5 text-[11px] font-medium {route.status ===
							'unavailable'
								? 'bg-status-danger-subtle text-status-danger'
								: isSelected
									? 'bg-status-success-subtle text-status-success'
									: 'bg-canvas-secondary text-fg-light'}"
						>
							{route.status === 'unavailable'
								? 'Unavailable'
								: isSelected
									? '✓ Routed'
									: 'Available'}
						</span>
					</div>

					<p class="mt-1 text-xs text-fg-light">{route.description}</p>

					<div class="mt-2 flex items-center gap-3">
						<div class="h-1.5 max-w-56 flex-1 overflow-hidden rounded-full bg-canvas-secondary">
							<span
								class="block h-full rounded-full {isSelected
									? 'bg-status-success'
									: 'bg-accent-primary'}"
								style="width: {route.matchScore}%;"
							></span>
						</div>
						<span class="font-mono text-xs tabular-nums text-fg-light">
							{route.matchScore}% match
						</span>
					</div>
				</div>

				{#if !isSelected && route.status !== 'unavailable'}
					<button
						type="button"
						onclick={() => handleSelectRoute(route.id)}
						class={buttonClass('secondary', 'sm', 'shrink-0')}
					>
						Route here
					</button>
				{/if}
			</article>
		{/each}
	</div>

	{#if showHistory}
		<div class="border-t border-canvas-border bg-canvas-primary p-4">
			<p class="text-xs font-semibold text-fg-main">Recent Routing Decisions</p>
			<div class="mt-2 divide-y divide-canvas-border rounded-lg border border-canvas-border bg-card-bg px-3">
				{#each routingHistory as item (item.id)}
					<div class="grid gap-1 py-2 text-xs sm:grid-cols-[1fr_8rem_5rem]">
						<span class="truncate text-fg-main">{item.query}</span>
						<span class="font-mono text-fg-light">{item.agentName}</span>
						<span class="text-right font-mono text-fg-light">{item.timestamp}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</section>
