<script lang="ts">
	import { Check, Copy, Download, LoaderCircle, Pencil, RefreshCw } from '@lucide/svelte';
	import { buttonClass } from '../ui/styles';
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

	interface Props {
		title?: string;
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

	const defaultVersions: ArtifactVersion[] = [
		{
			id: 'v1',
			label: 'v1 · Initial Spec Draft',
			timestamp: '13:40',
			summary: 'Initial G0 browser read contract outline',
			content: [
				'Title: G0 Browser Read Contract',
				'Section: Scope & Provenance',
				'- Isolate /w sample routes from paired device authority',
				'- Require explicit provenance badge on every stream card',
				'- Keep installation tokens strictly in server memory'
			].join('\n')
		},
		{
			id: 'v2',
			label: 'v2 · Revision 3 Aligned',
			timestamp: '14:05',
			summary: 'Added WorkspaceSource stream invariants and referee checks',
			content: [
				'Title: G0 Browser Read Contract (Revision 3)',
				'Section: WorkspaceSource & Stream Invariants',
				'- Isolate /w sample routes from paired Companion authority',
				'- Require explicit provenance label on every board and run card',
				'- Verify reauthorization before idempotency lookup on all retries',
				'- Keep installation tokens in server memory with zero webhook writes'
			].join('\n')
		}
	];

	const defaultSchemaJson = JSON.stringify(
		{
			$schema: 'https://json-schema.org/draft/2020-12/schema',
			title: 'WorkspaceReadArtifact',
			type: 'object',
			required: ['versionId', 'provenance', 'invariants'],
			properties: {
				versionId: { type: 'string', enum: ['v1', 'v2'] },
				provenance: { type: 'string', const: 'sample-isolated' },
				invariants: { type: 'array', items: { type: 'string' } }
			}
		},
		null,
		2
	);

	let {
		title = 'G0 Browser Read Contract · Design Artifact',
		artifactType = 'document',
		content,
		language = 'markdown',
		versions = defaultVersions,
		currentVersion = 'v2',
		isGenerating = false,
		metadata = {
			model: 'Claude Code 1.0',
			generationTime: '1.8s',
			tokens: 1420,
			size: '2.4 KB',
			schemaJson: defaultSchemaJson
		},
		onCopy,
		onDownload,
		onEdit,
		onRegenerate,
		onShare,
		onVersionChange,
		class: className = ''
	}: Props = $props();

	type ActiveTab = 'preview' | 'source' | 'schema' | 'versions';

	let activeTab = $state<ActiveTab>('preview');
	let selectedVersionId = $state('v2');
	let copied = $state(false);

	$effect(() => {
		selectedVersionId = currentVersion;
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

<section
	aria-label="Rich agent artifact viewer"
	class="w-full overflow-hidden rounded-xl border border-card-border bg-card-bg text-sm {className}"
>
	<header
		class="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-border p-4"
	>
		<div class="min-w-0">
			<div class="flex flex-wrap items-center gap-2">
				<span
					class="rounded bg-accent-subtle px-2 py-0.5 font-mono text-[11px] font-semibold uppercase text-accent-primary"
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
		class="flex flex-wrap gap-1 border-b border-canvas-border bg-canvas-primary px-4 pt-2"
	>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'preview'}
			onclick={() => (activeTab = 'preview')}
			class="rounded-t-lg border-b-2 px-3 py-2 text-xs font-medium transition-colors {activeTab ===
			'preview'
				? 'border-accent-primary bg-card-bg text-fg-main'
				: 'border-transparent text-fg-light hover:text-fg-main'}"
		>
			Preview
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'source'}
			onclick={() => (activeTab = 'source')}
			class="rounded-t-lg border-b-2 px-3 py-2 text-xs font-medium transition-colors {activeTab ===
			'source'
				? 'border-accent-primary bg-card-bg text-fg-main'
				: 'border-transparent text-fg-light hover:text-fg-main'}"
		>
			Markdown Source
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'schema'}
			onclick={() => (activeTab = 'schema')}
			class="rounded-t-lg border-b-2 px-3 py-2 text-xs font-medium transition-colors {activeTab ===
			'schema'
				? 'border-accent-primary bg-card-bg text-fg-main'
				: 'border-transparent text-fg-light hover:text-fg-main'}"
		>
			JSON Schema
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'versions'}
			onclick={() => (activeTab = 'versions')}
			class="rounded-t-lg border-b-2 px-3 py-2 text-xs font-medium transition-colors {activeTab ===
			'versions'
				? 'border-accent-primary bg-card-bg text-fg-main'
				: 'border-transparent text-fg-light hover:text-fg-main'}"
		>
			Version History ({versions.length})
		</button>
	</div>

	<div class="p-4">
		{#if activeTab === 'preview'}
			<div class="space-y-2 rounded-lg border border-canvas-border bg-canvas-primary p-4">
				{#each parsedLines as line, idx (`line-${idx}`)}
					{#if line.startsWith('Title: ')}
						<h3 class="text-base font-semibold text-fg-main">{line.slice(7)}</h3>
					{:else if line.startsWith('Section: ')}
						<h4 class="pt-2 font-mono text-xs font-semibold uppercase tracking-wide text-accent-primary">
							{line.slice(9)}
						</h4>
					{:else if line.startsWith('- ')}
						<p class="flex items-start gap-2 pl-2 text-xs leading-relaxed text-fg-main">
							<span class="text-accent-primary">•</span>
							<span>{line.slice(2)}</span>
						</p>
					{:else if line.trim().length > 0}
						<p class="text-xs leading-relaxed text-fg-light">{line}</p>
					{/if}
				{/each}
			</div>
		{:else if activeTab === 'source'}
			<pre
				class="max-h-80 overflow-auto rounded-lg border border-canvas-border bg-canvas-primary p-4 font-mono text-xs leading-6 text-fg-main"><code data-language={language}>{resolvedContent}</code></pre>
		{:else if activeTab === 'schema'}
			<pre
				class="max-h-80 overflow-auto rounded-lg border border-canvas-border bg-canvas-primary p-4 font-mono text-xs leading-6 text-fg-main"><code>{metadata.schemaJson ?? defaultSchemaJson}</code></pre>
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
		class="flex flex-wrap items-center justify-between gap-3 border-t border-canvas-border bg-canvas-primary px-4 py-2.5 font-mono text-xs text-fg-light"
	>
		<span>
			{metadata.size ?? '2.4 KB'}
			{metadata.model ? ` · ${metadata.model}` : ''}
			{metadata.generationTime ? ` · ${metadata.generationTime}` : ''}
		</span>
		<div class="flex items-center gap-3">
			{#if metadata.tokens !== undefined}
				<span>{metadata.tokens.toLocaleString()} tokens</span>
			{/if}
			<button
				type="button"
				onclick={() => onEdit?.(resolvedContent)}
				class="font-sans text-xs font-medium text-accent-primary hover:underline"
			>
				<Pencil aria-hidden="true" />
				Edit in Worktree
			</button>
			<button
				type="button"
				onclick={() => onShare?.()}
				class={buttonClass('ghost', 'sm')}
			>
				Share
			</button>
		</div>
	</footer>
</section>
