import type {
	AgentSkill,
	SkillDiffLine,
	SkillManifest,
	SkillManifestIssue,
	SkillMatch
} from '../skills/types.ts';

/** Frontmatter `name` limit and the kebab-case shape skill names use. */
export const SKILL_NAME_MAX_LENGTH = 64;
/** Frontmatter `description` limit. */
export const SKILL_DESCRIPTION_MAX_LENGTH = 1024;

const SKILL_NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_NAME_WORDS = ['anthropic', 'claude'];

/** Common words that carry no routing signal. */
const STOP_WORDS = new Set([
	'a', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'for', 'from', 'i',
	'in', 'into', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'our', 'please', 'so', 'some',
	'that', 'the', 'this', 'to', 'up', 'use', 'we', 'what', 'when', 'whenever', 'with', 'you',
	'your', 'asked', 'about', 'after', 'before', 'need', 'want', 'make', 'help'
]);

/**
 * Splits text into lowercase routing terms, dropping stop words and very short tokens and
 * folding simple plurals so "charts" matches "chart".
 *
 * @param text - Free text such as a prompt or a skill description.
 * @returns Unique terms in first-seen order.
 */
export function tokenizeSkillText(text: string): string[] {
	const seen = new Set<string>();
	for (const raw of text.toLowerCase().split(/[^a-z0-9.]+/)) {
		let term = raw.replace(/^\.+|\.+$/g, '');
		if (term.length < 2 || STOP_WORDS.has(term)) continue;
		if (term.length > 3 && term.endsWith('s') && !term.endsWith('ss')) term = term.slice(0, -1);
		seen.add(term);
	}
	return [...seen];
}

/**
 * Scores how well a prompt matches one skill, from 0 to 1. Terms that appear in the
 * skill's name or trigger phrases count more than terms that only appear in its description.
 *
 * @param prompt - The user's request.
 * @param skill - Skill to score.
 * @returns The score and the prompt terms that matched.
 */
export function scoreSkillMatch(prompt: string, skill: AgentSkill): SkillMatch {
	const promptTerms = tokenizeSkillText(prompt);
	if (promptTerms.length === 0) return { skillId: skill.id, score: 0, matchedTerms: [] };

	const strong = new Set(tokenizeSkillText(`${skill.name.replace(/-/g, ' ')} ${(skill.triggers ?? []).join(' ')}`));
	const weak = new Set(tokenizeSkillText(skill.description));

	let weight = 0;
	const matchedTerms: string[] = [];
	for (const term of promptTerms) {
		if (strong.has(term)) {
			weight += 1;
			matchedTerms.push(term);
		} else if (weak.has(term)) {
			weight += 0.6;
			matchedTerms.push(term);
		}
	}

	// Saturating curve: two strong hits already read as a confident match.
	const score = weight === 0 ? 0 : Math.min(1, 1 - Math.exp(-weight / 1.6));
	return { skillId: skill.id, score: Math.round(score * 100) / 100, matchedTerms };
}

/**
 * Ranks enabled skills for a prompt, best first. Disabled skills never match.
 *
 * @param prompt - The user's request.
 * @param skills - Installed skills.
 * @returns One match per enabled skill, sorted by score then name.
 */
export function rankSkills(prompt: string, skills: AgentSkill[]): SkillMatch[] {
	return skills
		.filter((skill) => skill.enabled !== false)
		.map((skill) => scoreSkillMatch(prompt, skill))
		.sort((a, b) => b.score - a.score || a.skillId.localeCompare(b.skillId));
}

/**
 * Checks a skill manifest against the frontmatter rules: a kebab-case name of at most 64
 * characters without reserved words, and a description of at most 1024 characters with
 * no angle brackets that says when to use the skill.
 *
 * @param manifest - Manifest being authored.
 * @returns Every problem found, errors first.
 */
export function validateSkillManifest(manifest: SkillManifest): SkillManifestIssue[] {
	const issues: SkillManifestIssue[] = [];
	const name = manifest.name.trim();
	const description = manifest.description.trim();

	if (!name) {
		issues.push({ field: 'name', level: 'error', message: 'Give the skill a name.' });
	} else {
		if (!SKILL_NAME_REGEX.test(name)) {
			issues.push({
				field: 'name',
				level: 'error',
				message: 'Use lowercase letters, numbers and single hyphens, like release-notes.'
			});
		}
		if (name.length > SKILL_NAME_MAX_LENGTH) {
			issues.push({
				field: 'name',
				level: 'error',
				message: `Keep the name to ${SKILL_NAME_MAX_LENGTH} characters or fewer.`
			});
		}
		const reserved = RESERVED_NAME_WORDS.find((word) => name.includes(word));
		if (reserved) {
			issues.push({ field: 'name', level: 'error', message: `The name can't contain "${reserved}".` });
		}
	}

	if (!description) {
		issues.push({
			field: 'description',
			level: 'error',
			message: 'Describe what the skill does and when to use it.'
		});
	} else {
		if (description.length > SKILL_DESCRIPTION_MAX_LENGTH) {
			issues.push({
				field: 'description',
				level: 'error',
				message: `Keep the description to ${SKILL_DESCRIPTION_MAX_LENGTH} characters or fewer.`
			});
		}
		if (/[<>]/.test(description)) {
			issues.push({ field: 'description', level: 'error', message: 'Remove angle brackets from the description.' });
		}
		if (!/\b(use|when|whenever|for)\b/i.test(description)) {
			issues.push({
				field: 'description',
				level: 'warning',
				message: 'Say when to use it, e.g. "Use when asked for release notes."'
			});
		}
	}

	if (!manifest.body.trim()) {
		issues.push({ field: 'body', level: 'warning', message: 'Add the steps the agent should follow.' });
	}

	for (const tool of manifest.allowedTools ?? []) {
		if (!/^[A-Za-z][\w.:*()-]*(?:\([^)]*\))?$/.test(tool.trim())) {
			issues.push({ field: 'allowedTools', level: 'warning', message: `"${tool}" doesn't look like a tool name.` });
		}
	}

	return issues.sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1));
}

/**
 * Quotes a YAML scalar only when it needs it.
 */
function yamlScalar(value: string): string {
	return /^[\w ,.'()/-]*$/.test(value) && !/^\s|\s$/.test(value) ? value : JSON.stringify(value);
}

/**
 * Serializes a manifest into `SKILL.md` text with YAML frontmatter.
 *
 * @param manifest - Manifest to write.
 * @returns The complete `SKILL.md`.
 */
export function serializeSkillManifest(manifest: SkillManifest): string {
	const lines = ['---', `name: ${yamlScalar(manifest.name.trim())}`];
	lines.push(`description: ${yamlScalar(manifest.description.trim())}`);
	const tools = (manifest.allowedTools ?? []).map((t) => t.trim()).filter(Boolean);
	if (tools.length > 0) lines.push(`allowed-tools: ${tools.join(', ')}`);
	lines.push('---', '', manifest.body.trim(), '');
	return lines.join('\n');
}

/**
 * Parses `SKILL.md` text back into a manifest. Unknown frontmatter keys are ignored.
 *
 * @param skillMd - The file contents.
 * @returns The manifest; fields missing from the file are empty.
 */
export function parseSkillManifest(skillMd: string): SkillManifest {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(skillMd);
	const manifest: SkillManifest = { name: '', description: '', allowedTools: [], body: skillMd.trim() };
	if (!match) return manifest;

	manifest.body = match[2].trim();
	for (const line of match[1].split(/\r?\n/)) {
		const kv = /^([\w-]+):\s*(.*)$/.exec(line);
		if (!kv) continue;
		let value = kv[2].trim();
		if (value.startsWith('"')) {
			try {
				value = JSON.parse(value) as string;
			} catch {
				value = value.slice(1, -1);
			}
		}
		if (kv[1] === 'name') manifest.name = value;
		else if (kv[1] === 'description') manifest.description = value;
		else if (kv[1] === 'allowed-tools') {
			manifest.allowedTools = value.split(',').map((t) => t.trim()).filter(Boolean);
		}
	}
	return manifest;
}

/**
 * Line diff between two versions of a `SKILL.md`, using a longest common subsequence so
 * unchanged lines stay as context.
 *
 * @param before - Current file text.
 * @param after - Proposed file text.
 * @returns Lines tagged as context, added or deleted, in reading order.
 */
export function diffSkillLines(before: string, after: string): SkillDiffLine[] {
	const a = before.split('\n');
	const b = after.split('\n');
	const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
	for (let i = a.length - 1; i >= 0; i--) {
		for (let j = b.length - 1; j >= 0; j--) {
			lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
		}
	}

	const out: SkillDiffLine[] = [];
	let i = 0;
	let j = 0;
	while (i < a.length && j < b.length) {
		if (a[i] === b[j]) {
			out.push({ kind: 'context', text: a[i] });
			i++;
			j++;
		} else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
			out.push({ kind: 'delete', text: a[i++] });
		} else {
			out.push({ kind: 'add', text: b[j++] });
		}
	}
	while (i < a.length) out.push({ kind: 'delete', text: a[i++] });
	while (j < b.length) out.push({ kind: 'add', text: b[j++] });
	return out;
}
