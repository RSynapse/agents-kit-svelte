<script lang="ts">
	import { SEGMENT_GROUP_CLASS, buttonClass, segmentClass } from '../ui/styles';
	export type ToolCategory = 'all' | 'worktree' | 'contracts' | 'companion' | 'verification';

	export interface AgentToolParameter {
		name: string;
		type: string;
		required: boolean;
		description?: string;
	}

	export interface AgentTool {
		id: string;
		name: string;
		description: string;
		category: Exclude<ToolCategory, 'all'>;
		enabled?: boolean;
		usageCount?: number;
		lastUsedLabel?: string;
		parameters?: AgentToolParameter[];
	}

	interface Props {
		tools?: AgentTool[];
		onToolClick?: (tool: AgentTool) => void;
		onToolToggle?: (toolId: string, enabled: boolean) => void;
		showUsageStats?: boolean;
		gridView?: boolean;
		class?: string;
	}

	const defaultTools: AgentTool[] = [
		{
			id: 'mcp-worktree-create',
			name: 'worktree.create_isolated',
			description: 'Creates an isolated git worktree branch for a dispatched card attempt.',
			category: 'worktree',
			enabled: true,
			usageCount: 42,
			lastUsedLabel: '2m ago',
			parameters: [
				{ name: 'cardId', type: 'string', required: true, description: 'Card identifier' },
				{ name: 'attemptNumber', type: 'number', required: true, description: 'Attempt counter' }
			]
		},
		{
			id: 'mcp-contracts-export',
			name: 'contracts.export_g0_schema',
			description: 'Exports TypeScript G0 contracts into canonical JSON schema artifacts.',
			category: 'contracts',
			enabled: true,
			usageCount: 28,
			lastUsedLabel: '6m ago',
			parameters: [
				{ name: 'verifyClean', type: 'boolean', required: false, description: 'Fail on drift' }
			]
		},
		{
			id: 'mcp-companion-probe',
			name: 'companion.probe_agents',
			description:
				'Runs fixed read-only direct argv version probe for Claude Code, Codex, and Gemini.',
			category: 'companion',
			enabled: true,
			usageCount: 19,
			lastUsedLabel: '14m ago',
			parameters: [
				{ name: 'timeoutMs', type: 'number', required: false, description: 'Bounded timeout' }
			]
		},
		{
			id: 'mcp-verify-svelte5',
			name: 'verify.audit_svelte5_runes',
			description:
				'Audits all .svelte files for Runes compliance, Props typing, and semantic CSS tokens.',
			category: 'verification',
			enabled: true,
			usageCount: 64,
			lastUsedLabel: 'Just now',
			parameters: [
				{ name: 'directory', type: 'string', required: true, description: 'Source directory' }
			]
		},
		{
			id: 'mcp-db-fixture',
			name: 'db.reset_disposable_fixture',
			description: 'Resets the local disposable SQLite database and outbox journal state.',
			category: 'verification',
			enabled: false,
			usageCount: 11,
			lastUsedLabel: '1h ago',
			parameters: [
				{ name: 'seedSample', type: 'boolean', required: false, description: 'Seed sample rows' }
			]
		}
	];

	const categories: { id: ToolCategory; label: string }[] = [
		{ id: 'all', label: 'All Tools' },
		{ id: 'worktree', label: 'Worktree' },
		{ id: 'contracts', label: 'Contracts' },
		{ id: 'companion', label: 'Companion' },
		{ id: 'verification', label: 'Verification' }
	];

	let {
		tools = defaultTools,
		onToolClick,
		onToolToggle,
		showUsageStats = true,
		gridView = true,
		class: className = ''
	}: Props = $props();

	let localTools = $state<AgentTool[]>([]);
	let searchQuery = $state('');
	let activeCategory = $state<ToolCategory>('all');
	let selectedToolId = $state<string>('mcp-verify-svelte5');
	let lastInvokedTool = $state<string | null>(null);

	$effect(() => {
		localTools = tools.map((t) => ({ ...t }));
	});

	let filteredTools = $derived(
		localTools.filter((tool) => {
			const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
			const q = searchQuery.trim().toLowerCase();
			const matchesQuery =
				!q || `${tool.name} ${tool.description}`.toLowerCase().includes(q);
			return matchesCategory && matchesQuery;
		})
	);

	let enabledCount = $derived(localTools.filter((t) => t.enabled !== false).length);

	let selectedTool = $derived(
		localTools.find((t) => t.id === selectedToolId) ?? filteredTools[0]
	);

	/**
	 * Toggles whether a tool is enabled in the palette and notifies the optional callback.
	 *
	 * @param toolId - Identifier of the tool to toggle.
	 */
	function handleToggleTool(toolId: string): void {
		localTools = localTools.map((tool) => {
			if (tool.id !== toolId) return tool;
			const nextEnabled = tool.enabled === false;
			onToolToggle?.(toolId, nextEnabled);
			return { ...tool, enabled: nextEnabled };
		});
	}

	/**
	 * Invokes a tool from the palette and records the invocation state.
	 *
	 * @param tool - Tool definition to invoke.
	 */
	function handleInvokeTool(tool: AgentTool): void {
		if (tool.enabled === false) return;
		selectedToolId = tool.id;
		lastInvokedTool = tool.name;
		onToolClick?.(tool);
	}
</script>

<section
	aria-label="Interactive command and MCP tool palette"
	class="w-full overflow-hidden rounded-card border border-card-border bg-card-bg text-sm {className}"
>
	<header
		class="flex flex-col gap-3 border-b border-canvas-border p-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<p class="text-xs font-medium text-fg-light">Command & MCP Tool Registry</p>
			<h2 class="mt-0.5 text-base font-semibold text-fg-main">Available Agent Tools</h2>
			<p class="mt-0.5 font-mono text-xs text-fg-light">
				{enabledCount} enabled · {localTools.length} registered
				{#if lastInvokedTool}
					· <span class="text-accent-primary">Last invoked: {lastInvokedTool}</span>
				{/if}
			</p>
		</div>

		<div class="w-full sm:w-64">
			<input
				type="search"
				placeholder="Filter MCP tools…"
				aria-label="Filter MCP tools"
				value={searchQuery}
				oninput={(e) => {
					const target = e.currentTarget as HTMLInputElement;
					searchQuery = target.value;
				}}
				class="w-full rounded-lg border border-card-border bg-canvas-primary px-3 py-1.5 text-xs text-fg-main placeholder:text-fg-light"
			/>
		</div>
	</header>

	<div
		role="tablist"
		aria-label="Tool categories"
		class="{SEGMENT_GROUP_CLASS} mx-4 my-3 flex-wrap"
	>
		{#each categories as cat (cat.id)}
			<button
				type="button"
				role="tab"
				aria-selected={activeCategory === cat.id}
				onclick={() => (activeCategory = cat.id)}
				class="{segmentClass(activeCategory === cat.id)}"
			>
				{cat.label}
			</button>
		{/each}
	</div>

	<div class="p-4">
		{#if filteredTools.length > 0}
			<div class={gridView ? 'grid gap-3 sm:grid-cols-2' : 'space-y-2'}>
				{#each filteredTools as tool (tool.id)}
					{@const isEnabled = tool.enabled !== false}
					{@const isSelected = selectedTool?.id === tool.id}
					<article
						class="flex flex-col justify-between rounded-lg border p-3 transition-colors {isSelected
							? 'border-accent-primary bg-accent-subtle/20'
							: 'border-card-border bg-canvas-primary'} {!isEnabled ? 'opacity-60' : ''}"
					>
						<div>
							<div class="flex items-start justify-between gap-2">
								<button
									type="button"
									onclick={() => (selectedToolId = tool.id)}
									class="text-left font-mono text-xs font-semibold text-fg-main hover:text-accent-primary"
								>
									{tool.name}
								</button>
								<span
									class="rounded bg-canvas-secondary px-1.5 py-0.5 text-[11px] capitalize text-fg-light font-medium"
								>
									{tool.category}
								</span>
							</div>

							<p class="mt-1 text-xs leading-relaxed text-fg-light">{tool.description}</p>
						</div>

						<div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-canvas-border pt-2.5">
							<div class="font-mono text-[11px] text-fg-light">
								{#if showUsageStats}
									<span>{tool.usageCount ?? 0} calls</span>
									{#if tool.lastUsedLabel}
										<span>· {tool.lastUsedLabel}</span>
									{/if}
								{/if}
								{#if tool.parameters?.length}
									<span>· {tool.parameters.length} params</span>
								{/if}
							</div>

							<div class="flex items-center gap-1.5">
								<button
									type="button"
									onclick={() => handleToggleTool(tool.id)}
									class={buttonClass('secondary', 'sm')}
								>
									{isEnabled ? 'Disable' : 'Enable'}
								</button>
								<button
									type="button"
									disabled={!isEnabled}
									onclick={() => handleInvokeTool(tool)}
									class={buttonClass('primary', 'sm')}
								>
									Invoke
								</button>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<p class="py-8 text-center text-xs text-fg-light">
				No tools match the current filter criteria.
			</p>
		{/if}

		{#if selectedTool && selectedTool.parameters && selectedTool.parameters.length > 0}
			<div class="mt-4 rounded-control bg-canvas-secondary/70 p-3">
				<p class="font-mono text-xs font-semibold text-fg-main">
					Parameter Preview · {selectedTool.name}
				</p>
				<div class="mt-2 divide-y divide-canvas-border">
					{#each selectedTool.parameters as param (param.name)}
						<div class="flex flex-wrap items-center justify-between gap-2 py-1.5 text-xs">
							<div class="flex items-center gap-2 font-mono">
								<span class="font-medium text-fg-main">{param.name}</span>
								<span class="rounded bg-canvas-secondary px-1.5 py-0.5 text-[10px] text-fg-light">
									{param.type}
								</span>
								{#if param.required}
									<span class="text-[10px] text-accent-primary">required</span>
								{/if}
							</div>
							{#if param.description}
								<span class="text-fg-light">{param.description}</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>
