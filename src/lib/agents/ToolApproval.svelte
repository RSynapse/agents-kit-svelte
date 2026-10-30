<script lang="ts">
	import { backOut, cubicOut } from 'svelte/easing';
	import { fly, scale } from 'svelte/transition';
	import AgentDisclosure from './AgentDisclosure.svelte';
	import { motionDuration, pressScale } from '../state/motion.svelte';
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
	<div class="flex flex-wrap items-center gap-2 px-3 py-2.5">
		<button
			type="button"
			aria-expanded={params.length > 0 ? isOpen : undefined}
			aria-controls={params.length > 0 ? panelId : undefined}
			onclick={() => {
				if (params.length > 0) isOpen = !isOpen;
			}}
			class="flex min-w-0 flex-1 items-center gap-2 text-left outline-none"
		>
			{#key activeStatus}
				<span
					in:scale={{ start: 0.82, duration: motionDuration(180), easing: backOut }}
					aria-hidden="true"
					class="inline-flex size-5 shrink-0 items-center justify-center rounded font-mono text-xs {activeStatus ===
						'approved' || activeStatus === 'complete'
						? 'bg-status-success-subtle text-status-success'
						: activeStatus === 'denied' || activeStatus === 'error'
							? 'bg-status-danger-subtle text-status-danger'
							: 'bg-status-warning-subtle text-status-warning'}"
				>
					{activeStatus === 'approved' || activeStatus === 'complete'
						? '✓'
						: activeStatus === 'denied' || activeStatus === 'error'
							? '✕'
							: '⚡'}
				</span>
			{/key}

			<span class="font-mono text-xs font-semibold text-fg-main">{tool}</span>

			{#if summary}
				<code
					class="min-w-0 truncate rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-xs text-fg-light"
				>
					{summary}
				</code>
			{/if}
		</button>

		{#if isWaiting}
			<div
				in:fly={{ x: 8, duration: motionDuration(160), easing: cubicOut }}
				class="flex flex-wrap items-center gap-1.5"
			>
				<button
					type="button"
					use:pressScale
					disabled={!ready || activeStatus === 'approving'}
					onclick={handleApprove}
					class="rounded-md bg-fg-main px-2.5 py-1 text-xs font-medium text-fg-inverse transition-opacity hover:opacity-90 disabled:opacity-50"
				>
					{approveLabel}
				</button>
				<button
					type="button"
					use:pressScale
					disabled={!ready || activeStatus === 'approving'}
					onclick={handleAlwaysApprove}
					class="rounded-md border border-card-border bg-canvas-secondary px-2.5 py-1 text-xs font-medium text-fg-main transition-colors hover:bg-canvas-primary disabled:opacity-50"
				>
					{alwaysApproveLabel}
				</button>
				<button
					type="button"
					use:pressScale
					disabled={!ready || activeStatus === 'approving'}
					onclick={handleDeny}
					class="rounded-md px-2 py-1 text-xs font-medium text-status-danger transition-colors hover:bg-status-danger-subtle disabled:opacity-50"
				>
					{denyLabel}
				</button>
			</div>
		{:else}
			<span
				in:scale={{ start: 0.9, duration: motionDuration(180), easing: backOut }}
				role="status"
				aria-live="polite"
				class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium {activeStatus ===
					'approved' || activeStatus === 'complete'
					? 'bg-status-success-subtle text-status-success'
					: activeStatus === 'denied' || activeStatus === 'error'
						? 'bg-status-danger-subtle text-status-danger'
						: 'bg-accent-subtle text-accent-primary'}"
			>
				{STATUS_LABELS[activeStatus]}
			</span>
		{/if}
	</div>

	{#if params.length > 0}
		<AgentDisclosure id={panelId} open={isOpen}>
			<dl
				class="grid gap-1.5 border-t border-canvas-border bg-canvas-secondary px-3 py-2.5 text-xs"
			>
				{#each params as param (param.label)}
					<div class="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-2">
						<dt class="font-medium text-fg-light">{param.label}</dt>
						<dd class="min-w-0 text-fg-main">
							{#if param.code}
								<code
									class="block overflow-x-auto rounded bg-card-bg px-2 py-1 font-mono text-[11px] text-fg-main"
								>
									{param.value}
								</code>
							{:else}
								<span class="break-words">{param.value}</span>
							{/if}
						</dd>
					</div>
				{/each}
			</dl>
		</AgentDisclosure>
	{/if}
</div>
