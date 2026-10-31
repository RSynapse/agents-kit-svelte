/**
 * Sample data for the data components (tables, cards and charts) and the
 * generative surface. Import from `agents-kit-svelte/fixtures`; components never
 * fall back to it.
 */
import type { ContextChunk } from '../beautiful/ContextCards.svelte';
import type { DiffTableRow } from '../beautiful/DiffTable.svelte';
import type { FilterTableRow } from '../beautiful/FilterTable.svelte';
import type { FineTuneField } from '../beautiful/FineTuneCard.svelte';
import type { FlowchartNode } from '../beautiful/Flowchart.svelte';
import type { InsightCard } from '../beautiful/InsightCards.svelte';
import type { RecommendationOption } from '../beautiful/RecommendationCard.svelte';
import type { RecordRow } from '../beautiful/RecordsTable.svelte';
import type { SearchListItem } from '../beautiful/SearchList.svelte';
import type { SelectionAction } from '../beautiful/SelectionActions.svelte';
import type { ToolDiff, ToolStep } from '../beautiful/ToolChips.svelte';
import type { GeneratedSurfaceContent } from '../types';

/** Sample data for `ContextCards`. */
export const SAMPLE_CONTEXT_CHUNKS: ContextChunk[] = [
	{
		id: 'ctx-spec',
		title: 'G0 Browser Read Contract',
		source: 'docs/specs/browser-read-contract.md',
		kind: 'file',
		tokens: 4200,
		score: 0.96,
		content: 'Defines sample workspace isolation, provenance badges, and client stream recovery.'
	},
	{
		id: 'ctx-issue',
		title: 'Issue 184: Worktree isolation guard',
		source: 'RSynapse/trailside · Issue 184',
		kind: 'issue',
		tokens: 1450,
		score: 0.91,
		content: 'Each dispatched workflow run executes in a dedicated git worktree with clean status.'
	},
	{
		id: 'ctx-schema',
		title: 'RunEnvelope JSON Schema',
		source: 'contracts/g0/schema/run-envelope.json',
		kind: 'schema',
		tokens: 980,
		score: 0.88,
		content: 'Strict protocol shape validation separated from pure domain decisions.'
	}
];

/** Sample data for `DiffTable`. */
export const SAMPLE_DIFF_ROWS: DiffTableRow[] = [
	{
		id: 'row-tier',
		field: 'riskTier',
		before: 'T1 (Read-only)',
		after: 'T2 (Worktree isolated)',
		status: 'accepted'
	},
	{
		id: 'row-timeout',
		field: 'maxRunDurationSec',
		before: '300',
		after: '900',
		status: 'pending'
	},
	{
		id: 'row-branch',
		field: 'worktreeBranch',
		before: 'main',
		after: 'worktree/card-184-attempt-1',
		status: 'pending'
	}
];

/** Sample data for `FilterTable`. */
export const SAMPLE_FILTER_ROWS: FilterTableRow[] = [
	{
		id: 'ft-1',
		task: 'Verify idempotency lookup order on retry dispatch',
		date: 'Oct 30',
		status: 'done',
		owner: 'Claude Code · T2',
		tag: 'contracts'
	},
	{
		id: 'ft-2',
		task: 'Stream worktree unified diff hunks into review drawer',
		date: 'Oct 30',
		status: 'progress',
		owner: 'Codex · T2',
		tag: 'ui'
	},
	{
		id: 'ft-3',
		task: 'Audit companion probe argument arrays against allowlist',
		date: 'Oct 31',
		status: 'todo',
		owner: 'Referee · T1',
		tag: 'security'
	}
];

/** Sample data for `FineTuneCard`. */
export const SAMPLE_FINE_TUNE_FIELDS: FineTuneField[] = [
	{
		id: 'risk-tier',
		label: 'Risk Tier Policy',
		value: 'T2 · Worktree Isolated',
		options: ['T0 · Docs Only', 'T1 · Read-Only Probe', 'T2 · Worktree Isolated', 'T3 · Human Co-sign']
	},
	{
		id: 'thinking-budget',
		label: 'Thinking Token Budget',
		value: 16000,
		min: 2000,
		max: 64000,
		step: 2000,
		suffix: 'tokens per attempt'
	},
	{
		id: 'max-turns',
		label: 'Max Autonomous Tool Turns',
		value: 24,
		min: 4,
		max: 60,
		step: 2,
		suffix: 'turns before checkpoint'
	},
	{
		id: 'temperature',
		label: 'Sampling Temperature',
		value: 0.2,
		min: 0,
		max: 1,
		step: 0.05,
		suffix: 'deterministic bias'
	}
];

/** Sample data for `Flowchart`. */
export const SAMPLE_FLOWCHART_NODES: FlowchartNode[] = [
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

/** Sample data for `InsightCards`. */
export const SAMPLE_INSIGHTS: InsightCard[] = [
	{
		id: 'ins-pass-rate',
		title: 'First-pass Referee Acceptance',
		value: '94.2%',
		delta: '+6.4%',
		kind: 'compare',
		description: 'T2 worktree runs passing automated checks without human send-back.',
		series: [78, 82, 85, 89, 91, 94]
	},
	{
		id: 'ins-latency',
		title: 'Worktree Cold-start Spike',
		value: '1.8s',
		delta: 'Anomaly',
		kind: 'anomaly',
		description: 'Peak worktree checkout latency observed during concurrent contract regeneration.',
		series: [12, 14, 13, 42, 15, 14]
	},
	{
		id: 'ins-tokens',
		title: 'Context Window Allocation',
		value: '68.4k',
		delta: '34% used',
		kind: 'allocation',
		description: 'Distribution across system prompt, repository diff, and tool transcripts.',
		series: [22, 48, 30]
	}
];

/** Sample data for `RecommendationCard`. */
export const SAMPLE_RECOMMENDATION_REASONING: string[] = [
	'Isolates database outbox writes and journal append inside a single transaction boundary.',
	'Preserves idempotency lookup before revision checks on retry attempts.',
	'Matches T2 referee verification rules with zero schema drift.'
];

/** Sample data for `RecommendationCard`. */
export const SAMPLE_RECOMMENDATION_ALTERNATIVES: RecommendationOption[] = [
	{
		id: 'alt-optimistic',
		label: 'Optimistic in-memory queue',
		description: 'Lower latency but requires manual replay on companion disconnect.'
	},
	{
		id: 'alt-polling',
		label: 'Periodic checkpoint polling',
		description: 'Simpler worker loop with higher idle read overhead.'
	}
];

/** Sample data for `RecordsTable`. */
export const SAMPLE_RECORDS: RecordRow[] = [
	{
		id: 'rec-1',
		name: 'Card 184 · Worktree Isolation',
		categories: ['runtime', 'T2'],
		updated: '2m ago',
		strength: 'Strong',
		status: 'verified',
		links: 14
	},
	{
		id: 'rec-2',
		name: 'Card 191 · Companion Probe',
		categories: ['cli', 'T1'],
		updated: '18m ago',
		strength: 'Verified',
		status: 'active',
		links: 9
	},
	{
		id: 'rec-3',
		name: 'Card 205 · Referee Checklist',
		categories: ['review', 'T2'],
		updated: '1h ago',
		strength: 'Pending',
		status: 'queued',
		links: 6
	}
];

/** Sample data for `SearchList`. */
export const SAMPLE_SEARCH_ITEMS: SearchListItem[] = [
	{
		id: 'sl-184',
		label: 'Issue 184 · Isolated git worktree per dispatched Run',
		description: 'Ready · T2 · Assigned to Claude Code',
		category: 'issue'
	},
	{
		id: 'sl-file-chat',
		label: 'src/lib/trailside/TrailsideClaudeChat.svelte',
		description: 'Interactive workbench shell with context meter and checkpoints',
		category: 'file'
	},
	{
		id: 'sl-run-92',
		label: 'Run Attempt 2 · Card 184 verification pass',
		description: 'Completed in 41s · 19/19 checks green',
		category: 'run'
	},
	{
		id: 'sl-doc-adr',
		label: 'docs/engineering/adr/ENG-0009-showcase-scope.md',
		description: 'Owner decision lifting local worktree execution limits',
		category: 'doc'
	}
];

/** Sample data for `SelectionActions`. */
export const SAMPLE_SELECTION_ACTIONS: SelectionAction[] = [
	{ id: 'approve', label: 'Approve selected', tone: 'accent' },
	{ id: 'rerun', label: 'Re-run in worktree', tone: 'default' },
	{ id: 'export', label: 'Export patch', tone: 'default' },
	{ id: 'clear', label: 'Clear', tone: 'danger' }
];

/** Sample data for `ToolChips`. */
export const SAMPLE_TOOL_STEPS: ToolStep[] = [
	{
		id: 'step-read',
		label: 'Read contract schema',
		chip: 'contracts/g0/schema/envelope.json',
		status: 'complete',
		detail: 'Validated 14 envelope fields against draft-2020-12 JSON Schema.'
	},
	{
		id: 'step-edit',
		label: 'Patch worktree dispatcher',
		chip: 'src/lib/runtime/dispatcher.ts',
		additions: 28,
		deletions: 6,
		status: 'complete',
		detail: 'Added idempotency lookup prior to revision check in dispatchRun().'
	},
	{
		id: 'step-test',
		label: 'Execute unit suite',
		chip: 'pnpm test',
		status: 'running',
		detail: 'Running 6 test files in isolated worker pool…'
	}
];

/** Sample data for `ToolChips`. */
export const SAMPLE_TOOL_DIFFS: ToolDiff[] = [
	{
		file: 'src/lib/runtime/dispatcher.ts',
		additions: 28,
		deletions: 6,
		lines: [
			'@@ -41,4 +41,6 @@ export async function dispatchRun(ctx) {',
			'-  await assertRevision(ctx.revision);',
			'+  const existing = await findIdempotentResult(ctx.requestId);',
			'+  if (existing) return existing;',
			'+  await assertRevision(ctx.revision);'
		]
	},
	{
		file: 'tests/dispatcher.test.ts',
		additions: 19,
		deletions: 0,
		lines: [
			'@@ -1,3 +1,8 @@',
			'+test("reauthorizes before idempotency lookup", async () => {',
			'+  assert.equal(result.status, "accepted");',
			'+});'
		]
	}
];

/** Sample data for `AgentGenerativeSurface`. */
export const SAMPLE_SURFACE_CONTENT: GeneratedSurfaceContent = {
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
				{ label: 'Query length limit', value: '4 KB' }
			]
		},
		{
			id: 'state-param',
			title: 'Encoded OAuth state parameter',
			description: 'Embeds returnTo inside the HMAC-signed OAuth state query string.',
			attributes: [
				{ label: 'Risk Tier', value: 'T2' },
				{ label: 'CSRF resistance', value: 'High' },
				{ label: 'Query length limit', value: '512 B' }
			]
		}
	]
};
