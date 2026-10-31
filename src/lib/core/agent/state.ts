/**
 * Folds `AgentEvent`s into an `AgentSessionState`, and selectors that turn that state into
 * the props the chat components take (`AgentActivity`, `TodoList`, `ToolApproval`, ...).
 *
 * `applyAgentEvent` mutates the state it is given and returns it, so it works both on a
 * plain object (tests, servers) and on a Svelte `$state` proxy (see `AgentSession`).
 */

import type { ActivityItem, ActivityItemStatus, TodoItem, TodoItemStatus, ToolApprovalParam } from '../../types';
import type {
	AgentEvent,
	AgentMessage,
	AgentSessionState,
	AgentToolCall,
	AgentToolCallStatus
} from './events';

/** Creates an empty session. */
export function createAgentSessionState(): AgentSessionState {
	return {
		status: 'idle',
		messages: [],
		toolCalls: [],
		todos: [],
		usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0 }
	};
}

/** Tool names whose input replaces the session's todo list. */
export const TODO_TOOL_NAMES = new Set(['TodoWrite', 'todo_write', 'update_todos']);

function findMessage(state: AgentSessionState, id: string): AgentMessage | undefined {
	for (let i = state.messages.length - 1; i >= 0; i--) {
		if (state.messages[i].id === id) return state.messages[i];
	}
	return undefined;
}

function ensureAssistantMessage(state: AgentSessionState, id: string): AgentMessage {
	const existing = findMessage(state, id);
	if (existing) return existing;
	state.messages.push({ id, role: 'assistant', parts: [], streaming: true });
	return state.messages[state.messages.length - 1];
}

function findToolCall(state: AgentSessionState, id: string): AgentToolCall | undefined {
	return state.toolCalls.find((call) => call.id === id);
}

function appendText(message: AgentMessage, kind: 'text' | 'thinking', blockId: string, text: string) {
	const part = message.parts.find((p) => p.id === blockId);
	if (part && part.kind === kind) {
		part.text += text;
	} else if (!part) {
		message.parts.push({ kind, id: blockId, text });
	}
}

function setToolInput(state: AgentSessionState, call: AgentToolCall, input: unknown) {
	call.input = input;
	if (call.status === 'streaming') call.status = 'running';
	if (TODO_TOOL_NAMES.has(call.name)) {
		const todos = todosFromTodoWrite(input);
		if (todos) state.todos = todos;
	}
}

function refreshStatus(state: AgentSessionState) {
	if (state.status === 'error' || state.status === 'complete') return;
	state.status = state.toolCalls.some((call) => call.status === 'awaiting-approval')
		? 'awaiting-approval'
		: 'running';
}

/**
 * Applies one event to the session.
 *
 * @param state - Session to update (mutated in place).
 * @param event - Event from an adapter or your own code.
 * @returns The same `state`, for chaining.
 */
export function applyAgentEvent(state: AgentSessionState, event: AgentEvent): AgentSessionState {
	switch (event.type) {
		case 'session.start':
			state.sessionId = event.sessionId ?? state.sessionId;
			state.model = event.model ?? state.model;
			state.status = 'running';
			state.error = undefined;
			break;
		case 'user.message':
			state.messages.push({
				id: event.messageId,
				role: 'user',
				parts: [{ kind: 'text', id: `${event.messageId}:0`, text: event.text }],
				streaming: false
			});
			state.status = 'running';
			state.error = undefined;
			break;
		case 'message.start': {
			const message = ensureAssistantMessage(state, event.messageId);
			message.streaming = true;
			if (event.model) message.model = event.model;
			if (state.status !== 'awaiting-approval') state.status = 'running';
			break;
		}
		case 'text.delta':
			appendText(ensureAssistantMessage(state, event.messageId), 'text', event.blockId, event.text);
			break;
		case 'thinking.delta':
			appendText(ensureAssistantMessage(state, event.messageId), 'thinking', event.blockId, event.text);
			break;
		case 'tool.start': {
			const message = ensureAssistantMessage(state, event.messageId);
			let call = findToolCall(state, event.toolCallId);
			if (!call) {
				state.toolCalls.push({
					id: event.toolCallId,
					name: event.name,
					messageId: event.messageId,
					inputJson: '',
					status: 'streaming'
				});
				call = state.toolCalls[state.toolCalls.length - 1];
				message.parts.push({ kind: 'tool', id: `tool:${event.toolCallId}`, toolCallId: event.toolCallId });
			}
			if (event.input !== undefined) setToolInput(state, call, event.input);
			break;
		}
		case 'tool.input.delta': {
			const call = findToolCall(state, event.toolCallId);
			if (call) call.inputJson += event.partialJson;
			break;
		}
		case 'tool.input': {
			const call = findToolCall(state, event.toolCallId);
			if (call) setToolInput(state, call, event.input);
			break;
		}
		case 'approval.request': {
			const call = findToolCall(state, event.toolCallId);
			if (call) {
				call.status = 'awaiting-approval';
				call.approval = { summary: event.summary, params: event.params };
			}
			refreshStatus(state);
			break;
		}
		case 'approval.resolve': {
			const call = findToolCall(state, event.toolCallId);
			if (call && call.status === 'awaiting-approval') {
				call.status = event.approved ? 'running' : 'denied';
			}
			refreshStatus(state);
			break;
		}
		case 'tool.result': {
			const call = findToolCall(state, event.toolCallId);
			if (call) {
				call.output = event.output;
				if (call.status !== 'denied') call.status = event.isError ? 'error' : 'complete';
			}
			refreshStatus(state);
			break;
		}
		case 'todos.update':
			state.todos = event.items;
			break;
		case 'usage': {
			const keys = ['inputTokens', 'outputTokens', 'cacheReadTokens', 'cacheCreationTokens'] as const;
			for (const key of keys) {
				const value = event[key];
				if (value === undefined) continue;
				state.usage[key] = event.incremental ? state.usage[key] + value : value;
			}
			break;
		}
		case 'message.stop': {
			const message = findMessage(state, event.messageId);
			if (message) {
				message.streaming = false;
				message.stopReason = event.stopReason;
			}
			for (const call of state.toolCalls) {
				if (call.messageId === event.messageId && call.status === 'streaming') call.status = 'running';
			}
			break;
		}
		case 'session.end':
			for (const message of state.messages) message.streaming = false;
			state.result = event.result;
			state.costUsd = event.costUsd;
			state.durationMs = event.durationMs;
			state.status = event.isError ? 'error' : 'complete';
			if (event.isError && event.result) state.error = event.result;
			break;
		case 'error':
			for (const message of state.messages) message.streaming = false;
			state.status = 'error';
			state.error = event.message;
			break;
	}
	return state;
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

/** Joins the visible text of a message. */
export function messageText(message: AgentMessage): string {
	return message.parts
		.map((part) => (part.kind === 'text' ? part.text : ''))
		.join('');
}

/** Joins the thinking text of a message. */
export function messageThinking(message: AgentMessage): string {
	return message.parts
		.map((part) => (part.kind === 'thinking' ? part.text : ''))
		.join('');
}

/** The latest assistant message, if any. */
export function lastAssistantMessage(state: AgentSessionState): AgentMessage | undefined {
	for (let i = state.messages.length - 1; i >= 0; i--) {
		if (state.messages[i].role === 'assistant') return state.messages[i];
	}
	return undefined;
}

/** Tool calls waiting for the user's approval. */
export function pendingApprovals(state: AgentSessionState): AgentToolCall[] {
	return state.toolCalls.filter((call) => call.status === 'awaiting-approval');
}

/** Tokens currently in the context window: input, cache reads and writes, and output. */
export function contextTokens(state: AgentSessionState): number {
	const u = state.usage;
	return u.inputTokens + u.cacheReadTokens + u.cacheCreationTokens + u.outputTokens;
}

const SEARCH_TOOLS = new Set(['Grep', 'Glob', 'WebSearch', 'WebFetch', 'web_search', 'web_fetch', 'search']);
const TARGET_KEYS = ['file_path', 'path', 'notebook_path', 'command', 'pattern', 'query', 'url', 'description'];

function asRecord(value: unknown): Record<string, unknown> | undefined {
	return value && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: undefined;
}

/**
 * Picks the most useful one-line description of what a tool call acts on: a file path,
 * a command, a search pattern or a URL.
 */
export function describeToolTarget(input: unknown): string | undefined {
	const record = asRecord(input);
	if (!record) return undefined;
	for (const key of TARGET_KEYS) {
		const value = record[key];
		if (typeof value === 'string' && value.length > 0) return value;
	}
	return undefined;
}

function activityStatus(status: AgentToolCallStatus): ActivityItemStatus {
	if (status === 'complete') return 'complete';
	if (status === 'error' || status === 'denied') return 'error';
	return 'running';
}

export interface ToActivityOptions {
	/** Only include tool calls from this message. */
	messageId?: string;
	/** Leave out the todo tool, which `TodoList` already shows. Default `true`. */
	hideTodoTool?: boolean;
	/** Custom label per tool name, for example `{ Bash: 'Ran' }`. */
	labels?: Record<string, string>;
}

/** Turns tool calls into `AgentActivity` items. */
export function toActivityItems(state: AgentSessionState, options: ToActivityOptions = {}): ActivityItem[] {
	const { messageId, hideTodoTool = true, labels = {} } = options;
	return state.toolCalls
		.filter((call) => (messageId ? call.messageId === messageId : true))
		.filter((call) => !(hideTodoTool && TODO_TOOL_NAMES.has(call.name)))
		.map((call): ActivityItem => {
			const target = describeToolTarget(call.input);
			const base = {
				id: call.id,
				label: labels[call.name] ?? call.name,
				target,
				status: activityStatus(call.status)
			};
			return SEARCH_TOOLS.has(call.name) ? { ...base, type: 'search' } : { ...base, type: 'tool' };
		});
}

/** Turns a tool input object into `ToolApproval` params. Strings over 60 characters or with newlines render as code. */
export function toApprovalParams(input: unknown): ToolApprovalParam[] {
	const record = asRecord(input);
	if (!record) return [];
	return Object.entries(record).map(([label, raw]) => {
		const value = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
		return { label, value, code: typeof raw !== 'string' || value.includes('\n') || value.length > 60 };
	});
}

const TODO_STATUS: Record<string, TodoItemStatus> = {
	pending: 'pending',
	in_progress: 'in-progress',
	'in-progress': 'in-progress',
	completed: 'completed',
	cancelled: 'cancelled'
};

/**
 * Reads a todo list from a TodoWrite-style tool input: `{ todos: [{ content, status, activeForm? }] }`.
 *
 * @returns The todos, or `undefined` when the input has no `todos` array.
 */
export function todosFromTodoWrite(input: unknown): TodoItem[] | undefined {
	const todos = asRecord(input)?.todos;
	if (!Array.isArray(todos)) return undefined;
	return todos.flatMap((raw, index): TodoItem[] => {
		const todo = asRecord(raw);
		const label = todo?.content ?? todo?.label ?? todo?.title;
		if (typeof label !== 'string') return [];
		const status = TODO_STATUS[String(todo?.status)] ?? 'pending';
		const detail = status === 'in-progress' && typeof todo?.activeForm === 'string' ? todo.activeForm : undefined;
		return [{ id: typeof todo?.id === 'string' ? todo.id : `todo-${index}`, label, status, detail }];
	});
}
