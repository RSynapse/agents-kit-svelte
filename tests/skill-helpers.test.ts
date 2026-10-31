import assert from 'node:assert/strict';
import test from 'node:test';
import { SAMPLE_SKILLS, SAMPLE_SKILL_PROPOSAL } from '../src/lib/skills/fixtures.ts';
import {
	diffSkillLines,
	parseSkillManifest,
	rankSkills,
	scoreSkillMatch,
	serializeSkillManifest,
	tokenizeSkillText,
	validateSkillManifest
} from '../src/lib/state/skill-helpers.ts';

test('tokenizeSkillText drops stop words and folds plurals', () => {
	assert.deepEqual(tokenizeSkillText('Write the release notes for these charts'), [
		'write',
		'release',
		'note',
		'these',
		'chart'
	]);
});

test('rankSkills routes requests to the matching skill', () => {
	assert.equal(rankSkills('Write the release notes for what shipped', SAMPLE_SKILLS)[0]?.skillId, 'release-notes');
	assert.equal(rankSkills('Chart weekly signups by region', SAMPLE_SKILLS)[0]?.skillId, 'dataviz');
	assert.equal(rankSkills('Fill out the vendor PDF form', SAMPLE_SKILLS)[0]?.skillId, 'pdf-forms');
});

test('rankSkills ignores disabled skills', () => {
	const ids = rankSkills('write the postmortem for the outage', SAMPLE_SKILLS).map((m) => m.skillId);
	assert.ok(!ids.includes('incident-review'));
});

test('scoreSkillMatch is zero for unrelated or empty prompts', () => {
	assert.equal(scoreSkillMatch('', SAMPLE_SKILLS[0]).score, 0);
	assert.equal(scoreSkillMatch('quantum gardening', SAMPLE_SKILLS[0]).score, 0);
});

test('validateSkillManifest enforces name and description rules', () => {
	const ok = validateSkillManifest({
		name: 'release-notes',
		description: 'Drafts release notes. Use when asked for a changelog.',
		body: '1. Do it.'
	});
	assert.deepEqual(ok, []);

	const bad = validateSkillManifest({
		name: 'Claude Helper',
		description: 'Has <tags>',
		allowedTools: ['Read', '!!'],
		body: ''
	});
	const messages = bad.map((i) => `${i.level}:${i.field}`);
	assert.ok(messages.includes('error:name'));
	assert.ok(messages.includes('error:description'));
	assert.ok(messages.includes('warning:body'));
	assert.ok(messages.includes('warning:allowedTools'));
	assert.equal(bad[0]?.level, 'error', 'errors sort before warnings');
	assert.ok(validateSkillManifest({ name: 'x'.repeat(65), description: 'Use for x.', body: 'x' }).some((i) => i.field === 'name'));
});

test('serializeSkillManifest round-trips through parseSkillManifest', () => {
	const manifest = {
		name: 'release-notes',
		description: 'Drafts notes: use when asked for a changelog.',
		allowedTools: ['Read', 'Bash(git log:*)'],
		body: '# Release notes\n\n1. Collect PRs.'
	};
	const md = serializeSkillManifest(manifest);
	assert.match(md, /^---\nname: release-notes\ndescription: "Drafts notes: use/);
	assert.deepEqual(parseSkillManifest(md), manifest);
});

test('diffSkillLines keeps shared lines as context', () => {
	const diff = diffSkillLines('a\nb\nc', 'a\nB\nc\nd');
	assert.deepEqual(
		diff.map((l) => `${l.kind}:${l.text}`),
		['context:a', 'delete:b', 'add:B', 'context:c', 'add:d']
	);
	const proposal = diffSkillLines(SAMPLE_SKILL_PROPOSAL.previousSkillMd ?? '', SAMPLE_SKILL_PROPOSAL.skillMd);
	assert.ok(proposal.some((l) => l.kind === 'context'));
	assert.ok(proposal.some((l) => l.kind === 'add'));
});
