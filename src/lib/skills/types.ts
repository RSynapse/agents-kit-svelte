/**
 * Data contracts for the Agentic Skills collection.
 *
 * A skill is a folder of instructions (a `SKILL.md` with YAML frontmatter, plus optional
 * scripts, references and assets) that an agent loads on demand when a request matches
 * the skill's description.
 */

/** Where a skill is installed, which also decides who can see and edit it. */
export type SkillScope = 'personal' | 'project' | 'plugin' | 'built-in';

/** Kind of file bundled inside a skill folder. */
export type SkillFileKind = 'skill' | 'script' | 'reference' | 'asset';

export interface SkillFile {
	path: string;
	kind: SkillFileKind;
	size?: string;
}

export interface AgentSkill {
	/** Stable identifier, usually the kebab-case skill name. */
	id: string;
	/** Kebab-case skill name from the frontmatter. */
	name: string;
	/** One-sentence description of when to use the skill; this is what routing matches. */
	description: string;
	scope: SkillScope;
	version?: string;
	author?: string;
	enabled?: boolean;
	/** Example requests that should trigger the skill. */
	triggers?: string[];
	/** Tools the skill may use without a fresh permission prompt. */
	allowedTools?: string[];
	files?: SkillFile[];
	invocations?: number;
	lastUsedLabel?: string;
}

/** A ranked routing candidate for a prompt. */
export interface SkillMatch {
	skillId: string;
	/** Relevance from 0 to 1. */
	score: number;
	/** Words from the prompt that matched the skill's description or triggers. */
	matchedTerms: string[];
}

export type SkillStepStatus = 'pending' | 'running' | 'complete' | 'error';

export interface SkillInvocationStep {
	id: string;
	label: string;
	detail?: string;
	status: SkillStepStatus;
}

export type SkillInvocationStatus = 'loading' | 'running' | 'complete' | 'error';

/** Editable frontmatter and body of a `SKILL.md`. */
export interface SkillManifest {
	name: string;
	description: string;
	allowedTools?: string[];
	body: string;
}

export type SkillIssueLevel = 'error' | 'warning';

export interface SkillManifestIssue {
	field: 'name' | 'description' | 'body' | 'allowedTools';
	level: SkillIssueLevel;
	message: string;
}

export type SkillProposalKind = 'new' | 'improvement';

export type SkillProposalStatus = 'pending' | 'saved' | 'dismissed';

/** A suggested skill (or an update to one) waiting for the user's review. */
export interface SkillProposal {
	kind: SkillProposalKind;
	name: string;
	description: string;
	/** The complete proposed `SKILL.md`. */
	skillMd: string;
	/** The current `SKILL.md` when the proposal improves an existing skill. */
	previousSkillMd?: string;
	/** Short notes on where the repeated procedure was seen. */
	evidence?: string[];
}

export type SkillDiffLineKind = 'context' | 'add' | 'delete';

export interface SkillDiffLine {
	kind: SkillDiffLineKind;
	text: string;
}
