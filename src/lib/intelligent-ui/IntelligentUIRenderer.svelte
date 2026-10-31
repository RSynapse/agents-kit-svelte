<script lang="ts">
	import { cn } from '../ui/cn';
	import type { HTMLAttributes } from 'svelte/elements';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { motionDuration, rise } from '../state/motion.svelte';
	import type { DynamicUINode } from '../types';
	import { defaultUIRegistry, type UIRegistry } from './registry';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'nodes' | 'registry' | 'onIntent'> {
		nodes: DynamicUINode[];
		/**
		 * Extra or replacement node types, merged over the built-in ones. Build it with
		 * `defineUIRegistry()`.
		 */
		registry?: UIRegistry;
		onIntent?: (intent: { nodeId: string; action: string; detail?: string }) => void;
		class?: string;
	}

	let { nodes, registry, onIntent, class: className = '', ...rest }: Props = $props();

	let entries = $derived<UIRegistry>(registry ? { ...defaultUIRegistry, ...registry } : defaultUIRegistry);

	function resolve(node: DynamicUINode) {
		const entry = entries[node.component];
		if (!entry) return { kind: 'unknown' as const };
		const missing = entry.required?.find((name) => node.props[name] === undefined || node.props[name] === null);
		if (missing) return { kind: 'missing' as const, name: missing };
		const emit = (action: string, detail?: string) => onIntent?.({ nodeId: node.id, action, detail });
		return {
			kind: 'ok' as const,
			Component: entry.component,
			props: entry.props ? entry.props(node.props, emit) : node.props
		};
	}
</script>

{#snippet missingProp(name: string)}
	<p class="rounded-control border border-dashed border-card-border px-3 py-2 text-xs text-fg-light">
		This node needs a <code class="font-mono">{name}</code> prop.
	</p>
{/snippet}

<div {...rest} class={cn('space-y-4', className)}>
	{#each nodes as node (node.id)}
		{@const resolved = resolve(node)}
		<div
			animate:flip={{ duration: motionDuration(240), easing: cubicOut }}
			in:rise={{ y: 6, duration: 200 }}
			out:fade={{ duration: motionDuration(140) }}
			data-node-id={node.id}
			data-component={node.component}
			class="space-y-1.5"
		>
			{#if node.title}
				<div class="flex items-center justify-between text-xs">
					<span class="font-semibold text-fg-main">{node.title}</span>
					<code class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
						&lt;{node.component} /&gt;
					</code>
				</div>
			{/if}

			{#if resolved.kind === 'ok'}
				<resolved.Component {...resolved.props} />
			{:else if resolved.kind === 'missing'}
				{@render missingProp(resolved.name)}
			{:else}
				<p class="rounded-control border border-dashed border-card-border px-3 py-2 text-xs text-fg-light">
					No component is registered for <code class="font-mono">{node.component}</code>.
				</p>
			{/if}
		</div>
	{/each}
</div>
