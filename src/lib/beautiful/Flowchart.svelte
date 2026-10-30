<script lang="ts">
	export interface FlowchartNode {
		id: string;
		label: string;
		detail?: string;
		status: 'pending' | 'running' | 'complete';
		x?: number;
		y?: number;
		kind?: string;
		condition?: { field: string; operator: string; value: string };
	}

	export interface FlowchartEdge {
		from: string;
		to: string;
	}

	interface Props {
		nodes?: FlowchartNode[];
		edges?: FlowchartEdge[];
		selectedNodeId?: string;
		onSelect?: (id: string) => void;
		onNodeMove?: (id: string, position: { x: number; y: number }) => void;
		onConditionChange?: (id: string, condition: FlowchartNode['condition']) => void;
		class?: string;
	}

	const DEFAULT_NODES: FlowchartNode[] = [
		{
			id: 'node-auth',
			kind: 'Gate',
			label: 'Reauthorize Session',
			detail: 'Verify human session & companion consent',
			status: 'complete',
			x: 24,
			y: 28
		},
		{
			id: 'node-idem',
			kind: 'Lookup',
			label: 'Idempotency Check',
			detail: 'Check prior request outcome before revision guard',
			status: 'complete',
			x: 230,
			y: 28,
			condition: { field: 'tier', operator: '<=', value: 'T2' }
		},
		{
			id: 'node-run',
			kind: 'Worktree',
			label: 'Execute Agent Run',
			detail: 'Isolated git worktree + atomic journal write',
			status: 'running',
			x: 436,
			y: 28
		}
	];

	const DEFAULT_EDGES: FlowchartEdge[] = [
		{ from: 'node-auth', to: 'node-idem' },
		{ from: 'node-idem', to: 'node-run' }
	];

	let {
		nodes = DEFAULT_NODES,
		edges = undefined,
		selectedNodeId = undefined,
		onSelect,
		onConditionChange,
		class: className = ''
	}: Props = $props();

	let activeNodeId = $state<string>('node-run');

	$effect(() => {
		if (selectedNodeId !== undefined) {
			activeNodeId = selectedNodeId;
		}
	});

	/**
	 * Computes default coordinates for every node in the DAG.
	 *
	 * @param list - Flowchart nodes.
	 * @returns Map of node ID to `{ x, y }` coordinates.
	 */
	function buildNodePositions(list: FlowchartNode[]): Record<string, { x: number; y: number }> {
		const map: Record<string, { x: number; y: number }> = {};
		list.forEach((node, index) => {
			map[node.id] = {
				x: node.x ?? 24 + index * 206,
				y: node.y ?? 28
			};
		});
		return map;
	}

	/**
	 * Selects a workflow node for inspection.
	 *
	 * @param id - Node ID.
	 */
	function handleSelectNode(id: string): void {
		activeNodeId = id;
		onSelect?.(id);
	}

	let positions = $derived(buildNodePositions(nodes));
	let resolvedEdges = $derived(
		edges ??
			nodes.slice(0, -1).map((node, index) => ({
				from: node.id,
				to: nodes[index + 1]?.id ?? node.id
			}))
	);
	let activeNode = $derived(nodes.find((n) => n.id === activeNodeId) ?? nodes[0]);
</script>

<div
	class="overflow-hidden rounded-xl border border-card-border bg-card-bg text-fg-main {className}"
>
	<div class="overflow-x-auto bg-canvas-secondary p-4">
		<div class="relative h-48 min-w-[640px]">
			<svg class="pointer-events-none absolute inset-0 h-full w-full text-fg-light" aria-hidden="true">
				{#each resolvedEdges as edge (`${edge.from}-${edge.to}`)}
					{@const from = positions[edge.from]}
					{@const to = positions[edge.to]}
					{#if from && to}
						{@const x1 = from.x + 180}
						{@const y1 = from.y + 48}
						{@const x2 = to.x}
						{@const y2 = to.y + 48}
						<path
							d="M{x1},{y1} C{(x1 + x2) / 2},{y1} {(x1 + x2) / 2},{y2} {x2},{y2}"
							fill="none"
							stroke="currentColor"
							stroke-opacity="0.35"
							stroke-width="2"
						/>
					{/if}
				{/each}
			</svg>

			{#each nodes as node (node.id)}
				{@const pos = positions[node.id] ?? { x: 0, y: 0 }}
				{@const isSelected = activeNodeId === node.id}
				<article
					style="transform: translate({pos.x}px, {pos.y}px)"
					class="absolute w-[180px] rounded-xl border bg-card-bg shadow-xs transition-colors {isSelected
						? 'border-accent-primary'
						: 'border-card-border'}"
				>
					<button
						type="button"
						onclick={() => handleSelectNode(node.id)}
						class="flex min-h-8 w-full items-center justify-between gap-2 border-b border-canvas-border px-3 py-1.5 text-left"
					>
						<span class="font-mono text-[10px] font-semibold tracking-wider text-fg-light uppercase">
							{node.kind ?? 'Step'}
						</span>
						<span
							aria-hidden="true"
							class="inline-flex size-4 items-center justify-center rounded-full font-mono text-[10px] {node.status ===
							'complete'
								? 'bg-status-success-subtle text-status-success'
								: node.status === 'running'
									? 'bg-accent-subtle text-accent-primary'
									: 'bg-canvas-secondary text-fg-light'}"
						>
							{node.status === 'complete' ? '✓' : node.status === 'running' ? '↻' : '○'}
						</span>
					</button>

					<div class="p-2.5">
						<h3 class="text-xs font-semibold text-fg-main">{node.label}</h3>
						{#if node.detail}
							<p class="mt-1 line-clamp-2 text-[11px] leading-4 text-fg-light">{node.detail}</p>
						{/if}

						{#if node.condition}
							<div class="mt-2 flex items-center gap-1 font-mono text-[10px]">
								<input
									type="text"
									aria-label="Condition field"
									value={node.condition.field}
									 oninput={(e) =>
										onConditionChange?.(node.id, {
											...node.condition!,
											field: e.currentTarget.value
										})}
									class="w-12 rounded border border-card-border bg-canvas-secondary px-1 py-0.5 text-fg-main"
								/>
								<span class="text-fg-light">{node.condition.operator}</span>
								<input
									type="text"
									aria-label="Condition value"
									value={node.condition.value}
									oninput={(e) =>
										onConditionChange?.(node.id, {
											...node.condition!,
											value: e.currentTarget.value
										})}
									class="min-w-0 flex-1 rounded border border-card-border bg-canvas-secondary px-1 py-0.5 text-fg-main"
								/>
							</div>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</div>

	{#if activeNode}
		<footer class="flex items-center justify-between gap-3 border-t border-canvas-border px-4 py-2.5 text-xs">
			<div>
				<span class="font-semibold text-fg-main">{activeNode.label}</span>
				{#if activeNode.detail}
					<span class="ml-2 text-fg-light">— {activeNode.detail}</span>
				{/if}
			</div>
			<span class="font-mono text-[11px] text-accent-primary uppercase">{activeNode.status}</span>
		</footer>
	{/if}
</div>
