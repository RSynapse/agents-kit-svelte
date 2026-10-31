<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { SEGMENT_GROUP_CLASS, segmentClass, togglePillClass } from '$lib/ui/styles';
	import AgentGenerativeSurface from '$lib/intelligent-ui/AgentGenerativeSurface.svelte';
	import IntelligentUIRenderer from '$lib/intelligent-ui/IntelligentUIRenderer.svelte';
	import type { DynamicUINode, GeneratedSurfaceContent } from '$lib/types';

	const SURFACE_EXAMPLES: { label: string; content: GeneratedSurfaceContent }[] = [
		{
			label: 'Comparison',
			content: {
				type: 'comparison',
				title: 'Choose the OAuth callback state verification strategy',
				description: 'Two approaches for preserving deep-link return paths across GitHub App sign-in.',
				selectedId: 'signed-cookie',
				options: [
					{
						id: 'signed-cookie',
						title: 'HttpOnly SameSite=Lax cookie',
						description: 'Stores sanitized relative returnTo path in a short-lived signed cookie.',
						recommended: true,
						attributes: [
							{ label: 'Risk Tier', value: 'T1 / T2' },
							{ label: 'CSRF resistance', value: 'High (bound to state)' },
							{ label: 'Max length', value: '4 KB' }
						]
					},
					{
						id: 'state-param',
						title: 'Encoded OAuth state parameter',
						description: 'Embeds returnTo inside the HMAC-signed OAuth state query string.',
						attributes: [
							{ label: 'Risk Tier', value: 'T2' },
							{ label: 'CSRF resistance', value: 'High' },
							{ label: 'Max length', value: '512 B' }
						]
					}
				]
			}
		},
		{
			label: 'Recommendation',
			content: {
				type: 'recommendation',
				id: 'rec-1',
				title: 'Promote CSS caption tokens from --faint to --muted on Home',
				summary:
					'Raising secondary captions to --muted achieves >= 5.4:1 contrast across both warm paper and dark themes without altering layout geometry.',
				reasoning: [
					'Preserves existing tokens.css variables with zero one-off hex colors.',
					'Passes Playwright 5-viewport contrast verification (320px to 1440px).',
					'Stays within T1 UI boundary rules.'
				],
				confidence: 96,
				acceptLabel: 'Apply token fix to worktree',
				alternatives: [
					{ id: 'alt-ink', label: 'Use --ink2 instead' },
					{ id: 'alt-font', label: 'Increase font-weight to 600' }
				]
			}
		},
		{
			label: 'Checklist',
			content: {
				type: 'checklist',
				title: 'Pre-PR Verification Gate Checklist',
				description: 'Required checks before opening an Argon pull request.',
				items: [
					{
						id: 'chk-1',
						label: 'Verify changed paths against allowed UI glob list',
						detail: 'apps/web/src/lib/** and tests/browser/** only',
						completed: true
					},
					{
						id: 'chk-2',
						label: 'Run Playwright spec in dev and preview targets',
						detail: 'Verify across 320px, 390px, 768px, 1024px, and 1440px',
						completed: true
					},
					{
						id: 'chk-3',
						label: 'Run corepack pnpm check & affected unit suites',
						detail: '0 errors, 0 warnings',
						completed: false
					}
				]
			}
		},
		{
			label: 'Document',
			content: {
				type: 'document',
				id: 'doc-1',
				title: 'ENG-0009 Showcase Execution Spec',
				format: 'Markdown',
				size: '4.8 KB',
				updated: 'Revision 3',
				excerpt:
					'A Connected Computer may run Claude Code and Codex on cards only as a Workflow the Trailside service dispatched to it, under its teammate Connect consent, each Run in its own Worktree.'
			}
		},
		{
			label: 'Source Brief',
			content: {
				type: 'source-brief',
				title: 'Browser Read Contract & Stream Grounding',
				summary:
					'Canonical specification governing /w routes, sample isolation, provenance labels, and client stream handling.',
				sources: [
					{
						id: 's1',
						title: '2026-10-02-g0-browser-read-contract-design.md',
						origin: 'Section 0 (Revision 3)'
					},
					{
						id: 's2',
						title: '2026-09-30-trailside-cli-design.md',
						origin: 'Section 7 (Supported Agent Probes)'
					}
				]
			}
		},
		{
			label: 'Activity Chart',
			content: {
				type: 'activity',
				title: 'Weekly Agent PR Throughput',
				value: '42',
				unit: 'merged PRs',
				description: 'Verified UI and domain fixes across 7 days',
				points: [
					{ label: 'Mon', value: 5 },
					{ label: 'Tue', value: 7 },
					{ label: 'Wed', value: 6 },
					{ label: 'Thu', value: 9 },
					{ label: 'Fri', value: 8 },
					{ label: 'Sat', value: 4 },
					{ label: 'Sun', value: 3 }
				]
			}
		}
	];

	const PRESET_PIPELINES: { name: string; nodes: DynamicUINode[] }[] = [
		{
			name: 'OAuth Bug Fix Stream',
			nodes: [
				{
					id: 'node-1',
					component: 'agent-activity',
					title: '1. Agent Reasoning & Tool Trace',
					props: {}
				},
				{
					id: 'node-2',
					component: 'file-diff',
					title: '2. Live Worktree Patch',
					props: {
						filename: 'apps/web/src/routes/auth/callback/+server.ts',
						patch:
							'@@ -18,3 +18,5 @@\n-  return redirect(302, "/login");\n+  const next = sanitizeReturnTo(url.searchParams.get("next"));\n+  return redirect(303, next);'
					}
				},
				{
					id: 'node-3',
					component: 'tool-approval',
					title: '3. Companion Command Consent',
					props: {
						tool: 'Bash',
						summary: 'corepack pnpm test:browser tests/browser/auth.spec.ts'
					}
				}
			]
		},
		{
			name: 'GitHub PR Referee Triage',
			nodes: [
				{
					id: 'node-gh-1',
					component: 'github-issue-card',
					title: '1. Claimed GitHub Issue',
					props: {}
				},
				{
					id: 'node-gh-2',
					component: 'github-pr-card',
					title: '2. Candidate Pull Request & Gate Rollup',
					props: {}
				},
				{
					id: 'node-gh-3',
					component: 'github-checks-panel',
					title: '3. Actionable CI Check Suite',
					props: {}
				}
			]
		},
		{
			name: 'Architecture Decision Flow',
			nodes: [
				{
					id: 'node-arch-1',
					component: 'generative-surface',
					title: '1. Generated Tradeoff Matrix',
					props: { content: SURFACE_EXAMPLES[0]?.content }
				},
				{
					id: 'node-arch-2',
					component: 'approval-card',
					title: '2. Human-in-the-Loop Decision Gate',
					props: {
						title: 'Approve OAuth Return-Path Strategy'
					}
				}
			]
		}
	];

	let selectedSurfaceIdx = $state(0);
	let selectedPresetIdx = $state(0);
	let customJson = $state(JSON.stringify(PRESET_PIPELINES[0]?.nodes ?? [], null, 2));
	let ready = $state(false);
	let intentHistory = $state<string[]>([
		'Intelligent UI engine initialized — select a preset or edit the JSON schema below.'
	]);

	$effect(() => {
		ready = true;
	});

	let parsedSchema = $derived.by<{ nodes: DynamicUINode[]; error: string | null }>(() => {
		try {
			const val = JSON.parse(customJson) as DynamicUINode[];
			return {
				nodes: Array.isArray(val) ? val : [],
				error: null
			};
		} catch (err) {
			return {
				nodes: PRESET_PIPELINES[selectedPresetIdx]?.nodes ?? [],
				error: err instanceof Error ? err.message : 'Invalid JSON'
			};
		}
	});

	/**
	 * Loads one of the preset Dynamic Intelligent UI pipelines into the JSON editor.
	 *
	 * @param idx - Index of the preset pipeline.
	 */
	function selectPreset(idx: number): void {
		selectedPresetIdx = idx;
		customJson = JSON.stringify(PRESET_PIPELINES[idx]?.nodes ?? [], null, 2);
	}
</script>

<div class="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6">
	<!-- Header -->
	<div class="max-w-2xl">
		<p class="text-xs font-medium text-accent-primary">Intelligent UI playground</p>
		<h1 class="mt-2 font-display text-[2.25rem] leading-tight font-normal tracking-[-0.02em] text-fg-main">
			Turn structured model output into interfaces people can use.
		</h1>
		<p class="mt-3 text-sm leading-6 text-fg-light">
			Portable Svelte 5 surfaces that render tool calls and JSON streams as interactive UI, with
			inline edit, compare, expand and intent callbacks.
		</p>
	</div>

	<!-- Section 1: AgentGenerativeSurface Showcase -->
	<section class="space-y-5 rounded-window border border-card-border bg-card-bg p-5 ak-shadow-soft-sm sm:p-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h2 class="text-[17px] font-semibold tracking-[-0.01em] text-fg-main">
					Generative surfaces
				</h2>
				<p class="mt-1 text-xs text-fg-light">
					AgentGenerativeSurface with edit, compare, expand and save.
				</p>
			</div>

			<div
				role="group"
				aria-label="Select generative surface type"
				class="{SEGMENT_GROUP_CLASS} flex-wrap"
			>
				{#each SURFACE_EXAMPLES as item, idx (item.label)}
					<button
						type="button"
						aria-pressed={selectedSurfaceIdx === idx}
						onclick={() => (selectedSurfaceIdx = idx)}
						class={segmentClass(selectedSurfaceIdx === idx)}
					>
						{item.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="mx-auto max-w-3xl">
			<AgentGenerativeSurface
				content={SURFACE_EXAMPLES[selectedSurfaceIdx]?.content}
				onAction={(act, id) => {
					intentHistory = [
						`[Surface ${SURFACE_EXAMPLES[selectedSurfaceIdx]?.label}] action=${act} id=${id ?? 'none'}`,
						...intentHistory.slice(0, 7)
					];
				}}
			/>
		</div>
	</section>

	<!-- Section 2: Dynamic JSON-to-Svelte5 IntelligentUIRenderer Playground -->
	<section class="space-y-5 rounded-window border border-card-border bg-card-bg p-5 ak-shadow-soft-sm sm:p-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h2 class="text-[17px] font-semibold tracking-[-0.01em] text-fg-main">
					Schema renderer
				</h2>
				<p class="mt-1 text-xs text-fg-light">
					Stream or edit declarative <code class="font-mono">DynamicUINode[]</code> JSON to compose any combination of agent, GitHub, and generative components on the fly.
				</p>
			</div>

			<div class="flex flex-wrap gap-1.5">
				{#each PRESET_PIPELINES as preset, idx (preset.name)}
					<button
						type="button"
						disabled={!ready}
						onclick={() => selectPreset(idx)}
						class={togglePillClass(selectedPresetIdx === idx)}
					>
						{preset.name}
					</button>
				{/each}
			</div>
		</div>

		<div class="grid gap-6 lg:grid-cols-12">
			<!-- Left: Live JSON Schema Editor -->
			<div class="space-y-2 lg:col-span-5">
				<div class="flex items-center justify-between text-xs">
					<label for="intelligent-ui-json-editor" class="font-medium text-fg-main">
						UI payload (JSON)
					</label>
					{#if parsedSchema.error}
						<span class="font-mono text-status-danger">{parsedSchema.error}</span>
					{:else}
						<span class="inline-flex items-center gap-1 text-status-success"><Check aria-hidden="true" class="size-3.5" />Valid schema ({parsedSchema.nodes.length} nodes)</span>
					{/if}
				</div>
				<textarea
					id="intelligent-ui-json-editor"
					rows={18}
					bind:value={customJson}
					class="w-full rounded-[18px] border border-card-border bg-terminal-bg p-4 font-mono text-xs leading-5 text-terminal-fg focus:border-accent-primary/60 focus:outline-none"
				></textarea>

				<div class="rounded-[18px] bg-canvas-secondary/70 p-4 text-xs">
					<p class="font-medium text-fg-main">Emitted intents</p>
					<ul class="mt-2 space-y-1 font-mono text-[11px] text-fg-light">
						{#each intentHistory as item, i (i)}
							<li class="truncate">{item}</li>
						{/each}
					</ul>
				</div>
			</div>

			<!-- Right: Rendered Svelte 5 Intelligent UI -->
			<div class="lg:col-span-7">
				<div class="rounded-[18px] bg-canvas-secondary/70 p-4">
					<IntelligentUIRenderer
						nodes={parsedSchema.nodes}
						onIntent={(intent) => {
							intentHistory = [
								`[Node ${intent.nodeId}] action=${intent.action} ${intent.detail ?? ''}`,
								...intentHistory.slice(0, 7)
							];
						}}
					/>
				</div>
			</div>
		</div>
	</section>
</div>
