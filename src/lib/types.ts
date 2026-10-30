export type ActivityItemStatus = 'running' | 'complete' | 'error';

export type ActivityItem =
	| {
			id: string;
			type: 'text';
			label: string;
			status?: ActivityItemStatus;
	  }
	| {
			id: string;
			type: 'tool';
			label: string;
			target?: string;
			meta?: string;
			additions?: number;
			deletions?: number;
			status: ActivityItemStatus;
	  }
	| {
			id: string;
			type: 'search';
			label: string;
			target?: string;
			meta?: string;
			status: ActivityItemStatus;
	  }
	| {
			id: string;
			type: 'step';
			label: string;
			target?: string;
			meta?: string;
			status: ActivityItemStatus;
	  };

export type ActivityStatus = 'working' | 'complete';

export type TodoItemStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface TodoItem {
	id: string;
	label: string;
	detail?: string;
	status: TodoItemStatus;
}

export type ToolApprovalStatus =
	| 'pending'
	| 'approving'
	| 'approved'
	| 'running'
	| 'complete'
	| 'denied'
	| 'error';

export interface ToolApprovalParam {
	label: string;
	value: string;
	code?: boolean;
}

export type ToolResultStatus = 'running' | 'success' | 'error' | 'cancelled';

export type FileDiffStatus = 'streaming' | 'complete';

export type DiffLineKind = 'hunk' | 'add' | 'delete' | 'context';

export interface DiffLine {
	id: string;
	kind: DiffLineKind;
	oldNumber?: number;
	newNumber?: number;
	content: string;
}

export interface ParsedDiff {
	lines: DiffLine[];
	additions: number;
	deletions: number;
}

export interface CitationItem {
	id: string;
	title: string;
	domain?: string;
	url?: string;
}

export interface ApprovalQuestionOption {
	id: string;
	label: string;
	description?: string;
}

export interface ApprovalQuestion {
	id: string;
	question: string;
	options: ApprovalQuestionOption[];
	multiple?: boolean;
	allowCustom?: boolean;
	customPlaceholder?: string;
	required?: boolean;
}

export type ApprovalCardAnswers = Record<string, string[]>;

export interface ContextSourceItem {
	id: string;
	label: string;
	tokens: number;
	category: 'system' | 'worktree' | 'conversation' | 'tools';
}

export interface CheckpointEntry {
	id: string;
	title: string;
	description: string;
	commitSha: string;
	worktreeBranch: string;
	timestamp: string;
	filesChanged: number;
	restorable?: boolean;
}

export type SupportedAgentId = 'claude-code' | 'codex' | 'gemini';

export interface SupportedAgentOption {
	id: SupportedAgentId;
	label: string;
	version: string;
	signedIn: boolean;
}

export type RiskTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4';

export interface TrailsideRunContext {
	cardId: string;
	cardTitle: string;
	attemptNumber: number;
	computerName: string;
	computerStatus: 'Connected' | 'Offline' | 'Busy';
	worktreeBranch: string;
	agent: SupportedAgentOption;
	skillName: string;
	riskTier: RiskTier;
	usedTokens: number;
	maxTokens: number;
}
