<script lang="ts">
	import { pillClass } from '../ui/styles';
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
	class="w-full overflow-hidden rounded-[20px] border border-chat-border bg-card-bg ak-shadow-soft text-sm {className}"
>
	<div class="flex items-start gap-3 p-4">
		{#key activeStatus}
			<span
				in:fade={{ duration: motionDuration(140) }}
				aria-hidden="true"
				class="flex size-9 shrink-0 items-center justify-center rounded-full bg-chat-surface max-sm:hidden {activeStatus ===
					'approved' || activeStatus === 'complete'
					? 'text-status-success'
					: activeStatus === 'denied' || activeStatus === 'error'
						? 'text-status-danger'
						: 'text-chat-accent'}"
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
					class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium {activeStatus ===
						'approved' || activeStatus === 'complete'
						? 'bg-status-success-subtle text-status-success'
						: activeStatus === 'denied' || activeStatus === 'error'
							? 'bg-status-danger-subtle text-status-danger'
							: 'bg-chat-surface text-fg-light'}"
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
					<code class="rounded bg-chat-surface px-1.5 py-0.5 font-mono text-xs text-fg-main">
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
						class={pillClass('ghost', 'sm', 'group')}
					>
						<span>{isOpen ? 'Hide details' : 'View details'}</span>
						<ChevronDown aria-hidden="true" class="size-3.5 transition-transform duration-150 {isOpen ? 'rotate-180' : ''}" />
					</button>

					<AgentDisclosure id={panelId} open={isOpen}>
						<dl
							class="mt-2 grid grid-cols-1 gap-x-4 gap-y-0.5 rounded-[12px] border sm:grid-cols-[auto_1fr] sm:gap-y-1.5 border-chat-border bg-chat-surface/60 px-3 py-2 text-xs"
						>
							{#each params as param (param.label)}
								<dt class="font-medium text-fg-light max-sm:not-first:mt-1.5">{param.label}</dt>
								<dd
									class="min-w-0 text-fg-main [overflow-wrap:anywhere] {param.code ? 'font-mono' : ''}"
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
			class="grid grid-cols-3 gap-2 border-t border-chat-border/70 bg-chat-surface/40 px-3 py-2.5 sm:flex sm:items-center sm:justify-end sm:px-4"
		>
			<button
				type="button"
				disabled={!ready || activeStatus === 'approving'}
				onclick={handleDeny}
				class={pillClass('secondary', 'md', 'max-sm:px-2')}
			>
				{denyLabel}
			</button>
			<button
				type="button"
				disabled={!ready || activeStatus === 'approving'}
				onclick={handleAlwaysApprove}
				class={pillClass('secondary', 'md', 'max-sm:px-2')}
			>
				{alwaysApproveLabel}
			</button>
			<button
				type="button"
				disabled={!ready || activeStatus === 'approving'}
				onclick={handleApprove}
				class={pillClass('primary', 'md', 'max-sm:px-2')}
			>
				{approveLabel}
			</button>
		</div>
	{/if}
</div>
