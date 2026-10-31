<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Share2, Check, Copy, Download, LoaderCircle, Pencil, RefreshCw } from '@lucide/svelte';
	import { SEGMENT_GROUP_CLASS, buttonClass, segmentClass } from '../ui/styles';
	export type ArtifactType = 'document' | 'code' | 'table' | 'chart';

	export interface ArtifactVersion {
		id: string;
		label: string;
		timestamp: string;
		summary?: string;
		content: string;
	}

	export interface ArtifactMetadata {
		model?: string;
		generationTime?: string;
		tokens?: number;
		size?: string;
		schemaJson?: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'title' | 'artifactType' | 'content' | 'language' | 'versions' | 'currentVersion' | 'isGenerating' | 'metadata' | 'onCopy' | 'onDownload' | 'onEdit' | 'onRegenerate' | 'onShare' | 'onVersionChange'> {
		title: string;
		artifactType?: ArtifactType;
		content?: string;
		language?: string;
		versions?: ArtifactVersion[];
		currentVersion?: string;
		isGenerating?: boolean;
		metadata?: ArtifactMetadata;
		onCopy?: (content: string) => void;
		onDownload?: (content: string) => void;
		onEdit?: (content: string) => void;
		onRegenerate?: () => void;
		onShare?: () => void;
		onVersionChange?: (versionId: string) => void;
		class?: string;
	}

	let {
		title,
		artifactType = 'document',
		content,
		language = 'markdown',
		versions = [],
		currentVersion,
		isGenerating = false,
		metadata = {},
		onCopy,
		onDownload,
		onEdit,
		onRegenerate,
		onShare,
		onVersionChange,
		class: className = '',
		...rest
	}: Props = $props();

	type ActiveTab = 'preview' | 'source' | 'schema' | 'versions';

	let activeTab = $state<ActiveTab>('preview');
	let selectedVersionId = $state('');
	let copied = $state(false);

	$effect(() => {
		selectedVersionId = currentVersion ?? versions.at(-1)?.id ?? '';
	});

	let activeVersion = $derived(
		versions.find((v) => v.id === selectedVersionId) ?? versions.at(-1)
	);

	let resolvedContent = $derived(
		content !== undefined ? content : (activeVersion?.content ?? '')
	);

	let parsedLines = $derived(resolvedContent.split('\n'));

	/**
	 * Switches the active artifact version and notifies the optional callback.
	 *
	 * @param versionId - Identifier of the version to select.
	 */
	function selectVersion(versionId: string): void {
		selectedVersionId = versionId;
		onVersionChange?.(versionId);
		activeTab = 'preview';
	}

	/**
	 * Copies the resolved artifact content and shows temporary confirmation state.
	 */
	function handleCopy(): void {
		copied = true;
		onCopy?.(resolvedContent);
		setTimeout(() => {
			copied = false;
		}, 1500);
	}
</script>

<section {...rest}
	aria-label="Rich agent artifact viewer"
	class="w-full overflow-hidden rounded-card border border-card-border bg-card-bg text-sm {className}"
>
	<header
		class="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-border p-4"
	>
		<div class="min-w-0">
			<div class="flex flex-wrap items-center gap-2">
				<span
					class="rounded bg-accent-subtle px-2 py-0.5 text-[11px] font-medium capitalize text-accent-primary"
				>
					{artifactType}
				</span>
				{#if activeVersion}
					<span class="font-mono text-xs text-fg-light">
						{activeVersion.label} · {activeVersion.timestamp}
					</span>
				{/if}
			</div>
			<h2 class="mt-1 truncate text-base font-semibold text-fg-main">{title}</h2>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={handleCopy}
				class={buttonClass('secondary', 'sm')}
			>
				{#if copied}<Check aria-hidden="true" />Copied{:else}<Copy aria-hidden="true" />Copy{/if}
			</button>
			<button
				type="button"
				onclick={() => onDownload?.(resolvedContent)}
				class={buttonClass('secondary', 'sm')}
			>
				<Download aria-hidden="true" />
				Export
			</button>
			<button
				type="button"
				onclick={() => onRegenerate?.()}
				class={buttonClass('secondary', 'sm')}
			>
				<RefreshCw aria-hidden="true" />
				Regenerate
			</button>
		</div>
	</header>

	{#if isGenerating}
		<div
			class="border-b border-canvas-border bg-accent-subtle px-4 py-2 font-mono text-xs text-accent-primary"
		>
			<LoaderCircle aria-hidden="true" class="animate-spin" />
			Streaming updated artifact revision…
		</div>
	{/if}

	<div
		role="tablist"
		aria-label="Artifact views"
		class="{SEGMENT_GROUP_CLASS} mx-4 mt-3 flex-wrap"
	>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'preview'}
			onclick={() => (activeTab = 'preview')}
			class="{segmentClass(activeTab === 'preview')}"
		>
			Preview
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'source'}
			onclick={() => (activeTab = 'source')}
			class="{segmentClass(activeTab === 'source')}"
		>
			Markdown Source
		</button>
		{#if metadata.schemaJson}
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === 'schema'}
				onclick={() => (activeTab = 'schema')}
				class="{segmentClass(activeTab === 'schema')}"
			>
				JSON Schema
			</button>
		{/if}
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'versions'}
			onclick={() => (activeTab = 'versions')}
			class="{segmentClass(activeTab === 'versions')}"
		>
			Version History ({versions.length})
		</button>
	</div>

	<div class="p-4">
		{#if activeTab === 'preview'}
			<div class="space-y-2 rounded-control border border-canvas-border px-5 py-4">
				{#each parsedLines as line, idx (`line-${idx}`)}
					{#if line.startsWith('Title: ')}
						<h3 class="text-lg font-semibold tracking-[-0.015em] text-fg-main">{line.slice(7)}</h3>
					{:else if line.startsWith('Section: ')}
						<h4 class="pt-2 text-sm font-semibold text-fg-main">
							{line.slice(9)}
						</h4>
					{:else if line.startsWith('- ')}
						<p class="flex items-start gap-2.5 pl-1 text-sm leading-6 text-fg-main">
							<span aria-hidden="true" class="mt-2.5 size-1 shrink-0 rounded-full bg-fg-light"></span>
							<span>{line.slice(2)}</span>
						</p>
					{:else if line.trim().length > 0}
						<p class="text-sm leading-6 text-fg-light">{line}</p>
					{/if}
				{/each}
			</div>
		{:else if activeTab === 'source'}
			<pre
				class="max-h-80 overflow-auto rounded-control bg-canvas-secondary/70 p-4 font-mono text-xs leading-6 text-fg-main"><code data-language={language}>{resolvedContent}</code></pre>
		{:else if activeTab === 'schema'}
			<pre
				class="max-h-80 overflow-auto rounded-control bg-canvas-secondary/70 p-4 font-mono text-xs leading-6 text-fg-main"><code>{metadata.schemaJson ?? ''}</code></pre>
		{:else if activeTab === 'versions'}
			<div class="divide-y divide-canvas-border rounded-lg border border-canvas-border">
				{#each versions as version (version.id)}
					{@const isCurrent = version.id === selectedVersionId}
					<button
						type="button"
						onclick={() => selectVersion(version.id)}
						class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs transition-colors hover:bg-canvas-primary {isCurrent
							? 'bg-accent-subtle/30'
							: ''}"
					>
						<div>
							<p class="font-medium text-fg-main">
								{version.label}
								{#if isCurrent}
									<span
										class="ml-2 rounded-full bg-status-success-subtle px-2 py-0.5 text-[10px] font-semibold text-status-success"
									>
										Active
									</span>
								{/if}
							</p>
							{#if version.summary}
								<p class="mt-0.5 text-fg-light">{version.summary}</p>
							{/if}
						</div>
						<span class="font-mono text-fg-light">{version.timestamp}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<footer
		class="flex flex-wrap items-center justify-between gap-3 border-t border-canvas-border px-4 py-2.5 text-xs text-fg-light"
	>
		<span>
			{[metadata.size, metadata.model, metadata.generationTime].filter(Boolean).join(' · ')}
		</span>
		<div class="flex items-center gap-3">
			{#if metadata.tokens !== undefined}
				<span>{metadata.tokens.toLocaleString()} tokens</span>
			{/if}
			<button
				type="button"
				onclick={() => onEdit?.(resolvedContent)}
				class={buttonClass('ghost', 'xs')}
			>
				<Pencil aria-hidden="true" />
				Edit
			</button>
			<button
				type="button"
				onclick={() => onShare?.()}
				class={buttonClass('ghost', 'xs')}
			>
				<Share2 aria-hidden="true" />
				Share
			</button>
		</div>
	</footer>
</section>
