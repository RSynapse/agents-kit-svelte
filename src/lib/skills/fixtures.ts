import type { AgentSkill, SkillInvocationStep, SkillManifest, SkillProposal } from './types';

/** Sample installed skills for the showcase, docs and tests. */
export const SAMPLE_SKILLS: AgentSkill[] = [
	{
		id: 'release-notes',
		name: 'release-notes',
		description:
			'Drafts release notes from pull requests merged since the last tag. Use when asked for a changelog, release notes, or what shipped.',
		scope: 'project',
		version: '1.2.0',
		author: 'Platform team',
		enabled: true,
		triggers: ['write the release notes', 'what shipped this week', 'changelog for v0.2'],
		allowedTools: ['Bash(git log:*)', 'Read', 'Write'],
		files: [
			{ path: 'SKILL.md', kind: 'skill', size: '2.1 KB' },
			{ path: 'scripts/collect_prs.sh', kind: 'script', size: '840 B' },
			{ path: 'references/voice.md', kind: 'reference', size: '1.4 KB' }
		],
		invocations: 37,
		lastUsedLabel: '2h ago'
	},
	{
		id: 'svelte5-audit',
		name: 'svelte5-audit',
		description:
			'Audits .svelte files for Runes, typed Props and semantic color tokens. Use before opening a pull request that touches components.',
		scope: 'project',
		version: '0.4.1',
		author: 'Design systems',
		enabled: true,
		triggers: ['audit the components', 'check svelte runes', 'review before the pr'],
		allowedTools: ['Read', 'Grep', 'Bash(pnpm check)'],
		files: [
			{ path: 'SKILL.md', kind: 'skill', size: '1.8 KB' },
			{ path: 'scripts/audit.ts', kind: 'script', size: '3.2 KB' }
		],
		invocations: 64,
		lastUsedLabel: 'Just now'
	},
	{
		id: 'pdf-forms',
		name: 'pdf-forms',
		description:
			'Fills, merges and extracts text from PDF files. Use whenever a PDF is an input or the requested output.',
		scope: 'plugin',
		version: '2.0.3',
		author: 'Documents plugin',
		enabled: true,
		triggers: ['fill out this pdf form', 'merge these pdfs', 'extract the table from the pdf'],
		allowedTools: ['Read', 'Bash(python:*)'],
		files: [
			{ path: 'SKILL.md', kind: 'skill', size: '3.6 KB' },
			{ path: 'scripts/fill_form.py', kind: 'script', size: '5.1 KB' },
			{ path: 'references/forms.md', kind: 'reference', size: '2.2 KB' }
		],
		invocations: 12,
		lastUsedLabel: 'Yesterday'
	},
	{
		id: 'brand-voice',
		name: 'brand-voice',
		description:
			'Rewrites copy in a warm, plain house voice. Use for landing pages, emails and launch posts.',
		scope: 'personal',
		version: '1.0.0',
		author: 'You',
		enabled: true,
		triggers: ['rewrite this in our voice', 'polish the landing copy', 'draft the launch email'],
		files: [
			{ path: 'SKILL.md', kind: 'skill', size: '1.1 KB' },
			{ path: 'references/examples.md', kind: 'reference', size: '4.0 KB' }
		],
		invocations: 21,
		lastUsedLabel: '3d ago'
	},
	{
		id: 'incident-review',
		name: 'incident-review',
		description:
			'Builds a blameless incident timeline from logs and chat history. Use after an outage or when asked for a postmortem.',
		scope: 'personal',
		version: '0.2.0',
		author: 'You',
		enabled: false,
		triggers: ['write the postmortem', 'timeline of the outage', 'incident review'],
		allowedTools: ['Read', 'Grep'],
		files: [
			{ path: 'SKILL.md', kind: 'skill', size: '2.4 KB' },
			{ path: 'assets/timeline-template.md', kind: 'asset', size: '600 B' }
		],
		invocations: 4,
		lastUsedLabel: '2w ago'
	},
	{
		id: 'dataviz',
		name: 'dataviz',
		description:
			'Chooses chart forms and accessible palettes that work in light and dark. Use for any chart, dashboard or plot.',
		scope: 'built-in',
		version: '3.1.0',
		author: 'Built in',
		enabled: true,
		triggers: ['chart the signups', 'build a dashboard', 'plot latency by region'],
		files: [
			{ path: 'SKILL.md', kind: 'skill', size: '6.8 KB' },
			{ path: 'references/palette.md', kind: 'reference', size: '1.9 KB' }
		],
		invocations: 88,
		lastUsedLabel: '1h ago'
	}
];

/** Steps the showcase plays when the `release-notes` skill runs. */
export const SAMPLE_SKILL_STEPS: SkillInvocationStep[] = [
	{ id: 's-1', label: 'Read SKILL.md', detail: 'release-notes · 2.1 KB', status: 'complete' },
	{ id: 's-2', label: 'Run scripts/collect_prs.sh', detail: '14 PRs merged since v0.1.0', status: 'complete' },
	{ id: 's-3', label: 'Group changes by area', detail: 'Components · Chat · GitHub suite · Docs', status: 'complete' },
	{ id: 's-4', label: 'Apply references/voice.md', detail: 'Plain, warm, no jargon', status: 'complete' },
	{ id: 's-5', label: 'Write RELEASE_NOTES.md', detail: '42 lines', status: 'complete' }
];

/** Body of the sample `release-notes` skill. */
export const SAMPLE_SKILL_BODY = `# Release notes

1. Run \`scripts/collect_prs.sh <last-tag>\` to list merged pull requests.
2. Group them by area, newest first. Drop chores and dependency bumps.
3. Write one plain sentence per change, in the voice from \`references/voice.md\`.
4. Save the result to \`RELEASE_NOTES.md\` and link each line to its PR.`;

/** A sample proposal that improves the `release-notes` skill. */
export const SAMPLE_SKILL_PROPOSAL: SkillProposal = {
	kind: 'improvement',
	name: 'release-notes',
	description:
		'Drafts release notes from pull requests merged since the last tag. Use when asked for a changelog, release notes, or what shipped.',
	previousSkillMd: `---
name: release-notes
description: Drafts release notes from merged pull requests. Use when asked for a changelog.
---

# Release notes

1. List merged pull requests since the last tag.
2. Write one sentence per change.
3. Save the result to RELEASE_NOTES.md.
`,
	skillMd: `---
name: release-notes
description: Drafts release notes from pull requests merged since the last tag. Use when asked for a changelog, release notes, or what shipped.
---

# Release notes

1. List merged pull requests since the last tag.
2. Group them by area and drop dependency bumps.
3. Write one sentence per change, in the voice from references/voice.md.
4. Save the result to RELEASE_NOTES.md and link each line to its PR.
`,
	evidence: ['Asked for release notes 3 times this month', 'You regrouped the list by area each time']
};

/** Sample manifest for `SkillEditor`, built from the first sample skill. */
export const SAMPLE_SKILL_MANIFEST: SkillManifest = {
	name: SAMPLE_SKILLS[0].name,
	description: SAMPLE_SKILLS[0].description,
	allowedTools: SAMPLE_SKILLS[0].allowedTools,
	body: SAMPLE_SKILL_BODY
};
