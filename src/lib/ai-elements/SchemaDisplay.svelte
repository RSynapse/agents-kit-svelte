<script lang="ts">
	import AgentDisclosure from '../agents/AgentDisclosure.svelte';

	export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'TOOL';

	export interface SchemaParameterItem {
		name: string;
		type: string;
		required?: boolean;
		description?: string;
		location?: 'path' | 'query' | 'header' | 'input';
	}

	export interface SchemaPropertyItem {
		name: string;
		type: string;
		required?: boolean;
		description?: string;
		properties?: SchemaPropertyItem[];
		items?: SchemaPropertyItem;
	}

	interface Props {
		method?: HttpMethod;
		path?: string;
		description?: string;
		parameters?: SchemaParameterItem[];
		requestBody?: SchemaPropertyItem[];
		responseBody?: SchemaPropertyItem[];
		class?: string;
	}

	const DEFAULT_PARAMETERS: SchemaParameterItem[] = [
		{
			name: 'workspaceId',
			type: 'string',
			location: 'path',
			required: true,
			description: 'Unique identifier of the connected workspace.'
		},
		{
			name: 'includeJournal',
			type: 'boolean',
			location: 'query',
			required: false,
			description: 'Include atomic outbox and journal replay entries.'
		}
	];

	const DEFAULT_REQUEST_BODY: SchemaPropertyItem[] = [
		{
			name: 'cardId',
			type: 'string',
			required: true,
			description: 'Target board card identifier for the dispatched workflow.'
		},
		{
			name: 'worktreeConfig',
			type: 'object',
			required: true,
			description: 'Isolated git worktree settings for the run.',
			properties: [
				{
					name: 'baseBranch',
					type: 'string',
					required: true,
					description: 'Base branch to fork the worktree from (e.g., main).'
				},
				{
					name: 'agentId',
					type: 'enum(claude-code | codex)',
					required: true,
					description: 'Qualified local agent binary to execute.'
				}
			]
		}
	];

	const DEFAULT_RESPONSE_BODY: SchemaPropertyItem[] = [
		{
			name: 'runId',
			type: 'string',
			required: true,
			description: 'Idempotent run session identifier.'
		},
		{
			name: 'status',
			type: 'enum(queued | running | complete)',
			required: true,
			description: 'Initial execution status.'
		}
	];

	let {
		method = 'POST',
		path = '/api/v1/workspaces/{workspaceId}/runs',
		description = 'Dispatches an isolated agent workflow run on a paired computer with idempotency verification.',
		parameters = DEFAULT_PARAMETERS,
		requestBody = DEFAULT_REQUEST_BODY,
		responseBody = DEFAULT_RESPONSE_BODY,
		class: className = ''
	}: Props = $props();

	let paramsOpen = $state(true);
	let requestOpen = $state(true);
	let responseOpen = $state(true);
	let expandedNested = $state<Record<string, boolean>>({});

	/**
	 * Maps an HTTP method or TOOL type to semantic badge classes.
	 *
	 * @param currentMethod - HTTP method or tool label.
	 * @returns Tailwind semantic class string.
	 */
	function getMethodBadgeStyle(currentMethod: HttpMethod): string {
		switch (currentMethod) {
			case 'GET':
				return 'bg-status-success-subtle text-status-success';
			case 'POST':
			case 'TOOL':
				return 'bg-accent-subtle text-accent-primary';
			case 'PUT':
			case 'PATCH':
				return 'bg-status-warning-subtle text-status-warning';
			case 'DELETE':
				return 'bg-status-danger-subtle text-status-danger';
		}
	}

	/**
	 * Splits a route path into static text and `{param}` segments for safe semantic highlighting.
	 *
	 * @param routePath - Endpoint path string.
	 * @returns Array of segments indicating whether each part is a parameter.
	 */
	function parseRouteSegments(routePath: string): { text: string; isParam: boolean }[] {
		const parts = routePath.split(/(\{[^}]+\})/g).filter(Boolean);
		return parts.map((text) => ({
			text,
			isParam: text.startsWith('{') && text.endsWith('}')
		}));
	}

	/**
	 * Checks whether a nested object property is expanded.
	 *
	 * @param propKey - Property path key.
	 * @returns True if expanded (defaults to true).
	 */
	function isPropertyExpanded(propKey: string): boolean {
		return expandedNested[propKey] ?? true;
	}

	/**
	 * Toggles expansion state for a nested object property.
	 *
	 * @param propKey - Property path key.
	 */
	function toggleProperty(propKey: string): void {
		expandedNested = {
			...expandedNested,
			[propKey]: !isPropertyExpanded(propKey)
		};
	}

	let routeSegments = $derived(parseRouteSegments(path));
</script>

{#snippet propertyRow(prop: SchemaPropertyItem, prefix: string)}
	{@const key = `${prefix}.${prop.name}`}
	{@const hasNested = Boolean(prop.properties && prop.properties.length > 0)}
	{@const open = isPropertyExpanded(key)}
	<div class="px-4 py-2.5">
		<div class="flex flex-wrap items-center gap-2">
			{#if hasNested}
				<button
					type="button"
					aria-expanded={open}
					onclick={() => toggleProperty(key)}
					class="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-fg-main hover:text-accent-primary"
				>
					<span class="text-[10px] text-fg-light transition-transform {open ? 'rotate-90' : ''}">
						▸
					</span>
					<span>{prop.name}</span>
				</button>
			{:else}
				<span class="pl-3.5 font-mono text-xs font-medium text-fg-main">{prop.name}</span>
			{/if}

			<span
				class="rounded border border-card-border bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px] text-fg-light"
			>
				{prop.type}
			</span>

			{#if prop.required}
				<span
					class="rounded bg-status-danger-subtle px-1.5 py-0.5 font-mono text-[10px] font-medium text-status-danger"
				>
					required
				</span>
			{/if}
		</div>

		{#if prop.description}
			<p class="mt-1 pl-3.5 text-xs text-fg-light">{prop.description}</p>
		{/if}

		{#if hasNested && open && prop.properties}
			<div class="mt-2 ml-3 divide-y divide-canvas-border rounded-control bg-canvas-secondary/70">
				{#each prop.properties as childProp (childProp.name)}
					{@render propertyRow(childProp, key)}
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

<div class="w-full overflow-hidden rounded-card border border-card-border bg-card-bg text-sm {className}">
	<div class="flex flex-wrap items-center gap-3 border-b border-canvas-border px-4 py-3">
		<span
			class="rounded-md px-2.5 py-0.5 font-mono text-xs font-bold {getMethodBadgeStyle(method)}"
		>
			{method}
		</span>
		<code class="font-mono text-xs text-fg-main">
			{#each routeSegments as seg, idx (idx)}
				{#if seg.isParam}
					<span class="rounded bg-accent-subtle px-1 py-0.5 font-semibold text-accent-primary">
						{seg.text}
					</span>
				{:else}
					<span>{seg.text}</span>
				{/if}
			{/each}
		</code>
	</div>

	{#if description}
		<p class="border-b border-canvas-border px-4 py-2.5 text-xs text-fg-light">
			{description}
		</p>
	{/if}

	<div class="divide-y divide-canvas-border">
		{#if parameters.length > 0}
			<div>
				<button
					type="button"
					aria-expanded={paramsOpen}
					onclick={() => (paramsOpen = !paramsOpen)}
					class="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold text-fg-main hover:bg-canvas-secondary"
				>
					<span class="flex items-center gap-2">
						<span class="text-fg-light transition-transform {paramsOpen ? 'rotate-90' : ''}">▸</span>
						<span>Parameters</span>
					</span>
					<span class="rounded-full bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] text-fg-light">
						{parameters.length}
					</span>
				</button>

				<AgentDisclosure open={paramsOpen}>
					<div class="divide-y divide-canvas-border border-t border-canvas-border">
						{#each parameters as param (param.name)}
							<div class="px-4 py-2.5 pl-8">
								<div class="flex flex-wrap items-center gap-2">
									<span class="font-mono text-xs font-medium text-fg-main">{param.name}</span>
									<span
										class="rounded border border-card-border bg-canvas-secondary px-1.5 py-0.5 font-mono text-[11px] text-fg-light"
									>
										{param.type}
									</span>
									{#if param.location}
										<span
											class="rounded bg-accent-subtle px-1.5 py-0.5 font-mono text-[10px] text-accent-primary"
										>
											{param.location}
										</span>
									{/if}
									{#if param.required}
										<span
											class="rounded bg-status-danger-subtle px-1.5 py-0.5 font-mono text-[10px] font-medium text-status-danger"
										>
											required
										</span>
									{/if}
								</div>
								{#if param.description}
									<p class="mt-1 text-xs text-fg-light">{param.description}</p>
								{/if}
							</div>
						{/each}
					</div>
				</AgentDisclosure>
			</div>
		{/if}

		{#if requestBody.length > 0}
			<div>
				<button
					type="button"
					aria-expanded={requestOpen}
					onclick={() => (requestOpen = !requestOpen)}
					class="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold text-fg-main hover:bg-canvas-secondary"
				>
					<span class="flex items-center gap-2">
						<span class="text-fg-light transition-transform {requestOpen ? 'rotate-90' : ''}">▸</span>
						<span>Request Body</span>
					</span>
					<span class="rounded-full bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] text-fg-light">
						{requestBody.length} fields
					</span>
				</button>

				<AgentDisclosure open={requestOpen}>
					<div class="divide-y divide-canvas-border border-t border-canvas-border">
						{#each requestBody as prop (prop.name)}
							{@render propertyRow(prop, 'req')}
						{/each}
					</div>
				</AgentDisclosure>
			</div>
		{/if}

		{#if responseBody.length > 0}
			<div>
				<button
					type="button"
					aria-expanded={responseOpen}
					onclick={() => (responseOpen = !responseOpen)}
					class="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold text-fg-main hover:bg-canvas-secondary"
				>
					<span class="flex items-center gap-2">
						<span class="text-fg-light transition-transform {responseOpen ? 'rotate-90' : ''}">▸</span>
						<span>Response Schema</span>
					</span>
					<span class="rounded-full bg-canvas-secondary px-2 py-0.5 font-mono text-[11px] text-fg-light">
						{responseBody.length} fields
					</span>
				</button>

				<AgentDisclosure open={responseOpen}>
					<div class="divide-y divide-canvas-border border-t border-canvas-border">
						{#each responseBody as prop (prop.name)}
							{@render propertyRow(prop, 'res')}
						{/each}
					</div>
				</AgentDisclosure>
			</div>
		{/if}
	</div>
</div>
