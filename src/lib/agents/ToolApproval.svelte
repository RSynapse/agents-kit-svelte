<script lang="ts">
	import { buttonClass } from '../ui/styles';
	import { Check, ChevronDown, ShieldCheck, X } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import AgentDisclosure from './AgentDisclosure.svelte';
	import { motionDuration, rise } from '../state/motion.svelte';
	import type { ToolApprovalParam, ToolApprovalStatus } from '../types';

	interface Props {
		tool: string;
		summary?: string;
		params?: ToolApprovalParam[];
		status?: ToolApprovalStatus;
		defaultOpen?: boolean;
		approveLabel?: string;
		alwaysApproveLabel?: string;
		denyLabel?: string;
		onApprove?: () => void;
		onAlwaysApprove?: () => void;
		onDeny?: () => void;
		class?: string;
	}

	const STATUS_LABELS: Record<ToolApprovalStatus, string> = {
		pending: 'Needs approval',
		approving: 'Approving',
		approved: 'Approved',
		running: 'Running',
		complete: 'Completed',
		denied: 'Denied',
		error: 'Failed'
	};

	let {
		tool,
		summary,
		params = [],
		status = 'pending',
		defaultOpen = true,
		approveLabel = 'Allow once',
		alwaysApproveLabel = 'Always allow',
		denyLabel = 'Deny',
		onApprove,
		onAlwaysApprove,
		onDeny,
		class: className = ''
	}: Props = $props();

	let internalStatus = $state<ToolApprovalStatus>('pending');
	let isOpen = $state(true);
	let ready = $state(false);

	$effect(() => {
		ready = true;
	});

	$effect(() => {
		internalStatus = status;
	});

	$effect(() => {
		isOpen = defaultOpen;
	});

	let activeStatus = $derived(internalStatus);
	let isWaiting = $derived(activeStatus === 'pending' || activeStatus === 'approving');
	let isBusy = $derived(activeStatus === 'approving' || activeStatus === 'running');
	let panelId = $derived(`tool-approval-${tool.replace(/[^a-zA-Z0-9_-]/g, '-')}`);

	/**
	 * Handles one-time approval for the requested tool command.
	 */
	function handleApprove(): void {
		internalStatus = 'approved';
		onApprove?.();
	}

	/**
	 * Handles session-wide approval for the requested tool scope.
	 */
	function handleAlwaysApprove(): void {
		internalStatus = 'approved';
		onAlwaysApprove?.();
	}

	/**
	 * Handles denial of the requested tool execution.
	 */
	function handleDeny(): void {
		internalStatus = 'denied';
		onDeny?.();
	}
</script>

<div
	role="group"
	aria-label="{tool} tool approval"
	data-state={activeStatus}
	aria-busy={isBusy}
	class="w-full overflow-hidden rounded-lg border border-card-border bg-card-bg text-sm {className}"
>
	<div class="flex items-start gap-3 p-4">
		{#key activeStatus}
			<span
				in:fade={{ duration: motionDuration(140) }}
				aria-hidden="true"
				class="flex size-8 shrink-0 items-center justify-center rounded-md border border-card-border bg-card-bg {activeStatus ===
					'approved' || activeStatus === 'complete'
					? 'text-status-success'
					: activeStatus === 'denied' || activeStatus === 'error'
						? 'text-status-danger'
						: 'text-fg-light'}"
			>
				{#if activeStatus === 'approved' || activeStatus === 'complete'}
					<Check class="size-4" />
				{:else if activeStatus === 'denied' || activeStatus === 'error'}
					<X class="size-4" />
				{:else}
					<ShieldCheck class="size-4" />
				{/if}
			</span>
		{/key}

		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div class="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
					<span class="font-medium text-fg-main">Allow {tool} execution?</span>
					<span class="font-mono text-xs text-fg-light">{tool}</span>
				</div>

				<span
					role="status"
					aria-live="polite"
					class="inline-flex shrink-0 items-center gap-1.5 rounded-chip px-1.5 py-px text-[11px] font-medium {activeStatus ===
						'approved' || activeStatus === 'complete'
						? 'bg-status-success-subtle text-status-success'
						: activeStatus === 'denied' || activeStatus === 'error'
							? 'bg-status-danger-subtle text-status-danger'
							: 'bg-canvas-secondary text-fg-light'}"
				>
					<span
						aria-hidden="true"
						class="size-1.5 rounded-full {activeStatus === 'approved' || activeStatus === 'complete'
							? 'bg-status-success'
							: activeStatus === 'denied' || activeStatus === 'error'
								? 'bg-status-danger'
								: 'bg-status-warning'}"
					></span>
					{STATUS_LABELS[activeStatus]}
				</span>
			</div>

			{#if summary}
				<p class="mt-1 leading-relaxed text-fg-light">
					<code class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-xs text-fg-main">
						{summary}
					</code>
				</p>
			{/if}

			{#if params.length > 0}
				<div class="mt-2.5">
					<button
						type="button"
						aria-expanded={isOpen}
						aria-controls={panelId}
						onclick={() => (isOpen = !isOpen)}
						class={buttonClass('ghost', 'sm', 'group')}
					>
						<span>{isOpen ? 'Hide details' : 'View details'}</span>
						<ChevronDown aria-hidden="true" class="size-3.5 transition-transform duration-150 {isOpen ? 'rotate-180' : ''}" />
					</button>

					<AgentDisclosure id={panelId} open={isOpen}>
						<dl
							class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-md border border-card-border bg-canvas-secondary/60 px-3 py-2 text-xs"
						>
							{#each params as param (param.label)}
								<dt class="font-medium text-fg-light">{param.label}</dt>
								<dd
									class="min-w-0 break-all text-fg-main {param.code ? 'font-mono' : ''}"
								>
									{param.value}
								</dd>
							{/each}
						</dl>
					</AgentDisclosure>
				</div>
			{/if}
		</div>
	</div>

	{#if isWaiting}
		<div
			in:rise
			class="flex flex-wrap items-center justify-end gap-2 border-t border-canvas-border bg-canvas-secondary/40 px-4 py-2.5"
		>
			<button
				type="button"
				disabled={!ready || activeStatus === 'approving'}
				onclick={handleDeny}
				class={buttonClass('secondary', 'md')}
			>
				{denyLabel}
			</button>
			<button
				type="button"
				disabled={!ready || activeStatus === 'approving'}
				onclick={handleAlwaysApprove}
				class={buttonClass('secondary', 'md')}
			>
				{alwaysApproveLabel}
			</button>
			<button
				type="button"
				disabled={!ready || activeStatus === 'approving'}
				onclick={handleApprove}
				class={buttonClass('primary', 'md')}
			>
				{approveLabel}
			</button>
		</div>
	{/if}
</div>
