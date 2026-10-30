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

// --- GitHub Card & Layout Types ---

export type GitHubIssueState = 'open' | 'in-progress' | 'ready-for-human' | 'closed';

export interface GitHubLabel {
	name: string;
	tone: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export interface GitHubIssueData {
	number: number;
	title: string;
	repo: string;
	state: GitHubIssueState;
	author: string;
	createdAt: string;
	labels: GitHubLabel[];
	riskTier?: RiskTier;
	size?: 'XS' | 'S' | 'M' | 'L';
	assignedAgent?: string;
	attemptNumber?: number;
	worktreeBranch?: string;
	linkedPrNumber?: number;
	criteriaCompleted?: number;
	criteriaTotal?: number;
	summary?: string;
}

export type GitHubPRState = 'open' | 'draft' | 'merged' | 'closed';

export interface GitHubCheckItem {
	id: string;
	name: string;
	workflow: string;
	status: 'passed' | 'failed' | 'running' | 'skipped';
	duration: string;
	summary?: string;
}

export interface GitHubPullRequestData {
	number: number;
	title: string;
	repo: string;
	state: GitHubPRState;
	author: string;
	headBranch: string;
	baseBranch: string;
	additions: number;
	deletions: number;
	changedFilesCount: number;
	riskTier: RiskTier;
	refereeStatus: 'pass' | 'send-back' | 'pending';
	refereeSummary?: string;
	checks: GitHubCheckItem[];
	updatedAt: string;
	linkedIssueNumber?: number;
}

export interface GitHubCommitData {
	sha: string;
	message: string;
	author: string;
	timestamp: string;
	branch: string;
	verified?: boolean;
	additions: number;
	deletions: number;
	files: { path: string; status: 'added' | 'modified' | 'deleted'; additions: number; deletions: number }[];
}

export interface GitHubReviewComment {
	id: string;
	author: string;
	role: string;
	timestamp: string;
	body: string;
	suggestedPatch?: string;
}

export interface GitHubReviewThreadData {
	id: string;
	filePath: string;
	lineRange: string;
	diffHunk: string;
	resolved: boolean;
	comments: GitHubReviewComment[];
}

// --- Intelligent UI / Generative Surface Types ---

export type ResultActionState = 'view' | 'expanded' | 'editing' | 'comparing';

export type GeneratedSurfaceContent =
	| {
			type: 'comparison';
			title: string;
			description?: string;
			selectedId?: string;
			options: {
				id: string;
				title: string;
				description: string;
				recommended?: boolean;
				attributes: { label: string; value: string }[];
			}[];
	  }
	| {
			type: 'recommendation';
			id: string;
			title: string;
			summary: string;
			reasoning?: string[];
			confidence: number;
			acceptLabel: string;
			alternatives?: { id: string; label: string }[];
	  }
	| {
			type: 'document';
			id: string;
			title: string;
			format: string;
			size: string;
			updated: string;
			excerpt: string;
	  }
	| {
			type: 'checklist';
			title: string;
			description?: string;
			items: { id: string; label: string; detail?: string; completed: boolean }[];
	  }
	| {
			type: 'source-brief';
			title: string;
			summary: string;
			sources: { id: string; title: string; origin?: string }[];
	  }
	| {
			type: 'audio';
			title: string;
			creator: string;
			playing: boolean;
			position: number;
			duration: number;
	  }
	| {
			type: 'focus';
			title: string;
			remaining: number;
			duration: number;
			running: boolean;
	  }
	| {
			type: 'flight';
			origin: string;
			originName: string;
			destination: string;
			destinationName: string;
			departure: string;
			arrival: string;
			progress: number;
			status: string;
	  }
	| {
			type: 'weather';
			location: string;
			temperature: number;
			unit: string;
			condition: string;
			forecast: { day: string; temperature: number }[];
	  }
	| {
			type: 'inbox';
			title: string;
			items: { id: string; sender: string; text: string; time: string; unread: boolean }[];
	  }
	| {
			type: 'event';
			title: string;
			time: string;
			timezone: string;
			date: string;
			location: string;
			attendees: string[];
	  }
	| {
			type: 'activity';
			title: string;
			value: string;
			unit: string;
			description: string;
			points: { label: string; value: number }[];
	  }
	| {
			type: 'github-issue';
			issue: GitHubIssueData;
	  }
	| {
			type: 'github-pr';
			pr: GitHubPullRequestData;
	  };

export type DynamicUINodeType =
	| 'agent-activity'
	| 'todo-list'
	| 'tool-approval'
	| 'tool-result'
	| 'file-diff'
	| 'code-block'
	| 'approval-card'
	| 'github-issue-card'
	| 'github-pr-card'
	| 'github-commit-card'
	| 'github-checks-panel'
	| 'generative-surface'
	| 'recommendation-card'
	| 'diff-table'
	| 'insight-cards'
	| 'flowchart'
	| 'agent-orchestrator'
	| 'agent-evaluator'
	| 'stack-trace'
	| 'schema-display';

export interface DynamicUINode {
	id: string;
	component: DynamicUINodeType;
	title?: string;
	props: Record<string, unknown>;
}
