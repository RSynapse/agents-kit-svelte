/**
 * Normalised agent events.
 *
 * Every agent runtime (the Claude Agent SDK, the Messages API stream, or your own backend)
 * speaks a slightly different protocol. Adapters translate those protocols into this one
 * union, and `applyAgentEvent` folds the events into an `AgentSessionState` that the chat
 * components can render. To support a new runtime, write an adapter that yields these events.
 */

import type { TodoItem, ToolApprovalParam } from '../../types';

export type AgentRole = 'user' | 'assistant';

export type AgentEvent =
	/** A session (conversation) started or resumed. */
	| { type: 'session.start'; sessionId?: string; model?: string }
	/** The user sent a message. */
	| { type: 'user.message'; messageId: string; text: string }
	/** The assistant started a new message. */
	| { type: 'message.start'; messageId: string; model?: string }
	/** Visible text was appended to a block of the current message. */
	| { type: 'text.delta'; messageId: string; blockId: string; text: string }
	/** Thinking text was appended to a block of the current message. */
	| { type: 'thinking.delta'; messageId: string; blockId: string; text: string }
	/** The assistant started calling a tool. `input` is set when it is already known. */
	| { type: 'tool.start'; messageId: string; toolCallId: string; name: string; input?: unknown }
	/** A fragment of the tool input JSON streamed in. */
	| { type: 'tool.input.delta'; toolCallId: string; partialJson: string }
	/** The full tool input is known. */
	| { type: 'tool.input'; toolCallId: string; input: unknown }
	/** The tool needs the user's approval before it runs. */
	| { type: 'approval.request'; toolCallId: string; summary?: string; params?: ToolApprovalParam[] }
	/** The user approved or denied the tool. */
	| { type: 'approval.resolve'; toolCallId: string; approved: boolean }
	/** The tool finished. */
	| { type: 'tool.result'; toolCallId: string; output: string; isError?: boolean }
	/** The agent replaced its todo list (for example with Claude Code's TodoWrite tool). */
	| { type: 'todos.update'; items: TodoItem[] }
	/**
	 * Token usage. Each value replaces the current figure (the latest request's context),
	 * unless `incremental` is true, in which case it is added.
	 */
	| {
			type: 'usage';
			inputTokens?: number;
			outputTokens?: number;
			cacheReadTokens?: number;
			cacheCreationTokens?: number;
			incremental?: boolean;
	  }
	/** The assistant finished its message. */
	| { type: 'message.stop'; messageId: string; stopReason?: string }
	/** The whole run finished. */
	| { type: 'session.end'; result?: string; isError?: boolean; costUsd?: number; durationMs?: number }
	/** Something went wrong. The session moves to `error`. */
	| { type: 'error'; message: string };

export type AgentEventType = AgentEvent['type'];

export type AgentMessagePart =
	| { kind: 'text'; id: string; text: string }
	| { kind: 'thinking'; id: string; text: string }
	| { kind: 'tool'; id: string; toolCallId: string };

export interface AgentMessage {
	id: string;
	role: AgentRole;
	parts: AgentMessagePart[];
	streaming: boolean;
	model?: string;
	stopReason?: string;
}

export type AgentToolCallStatus =
	| 'streaming'
	| 'awaiting-approval'
	| 'running'
	| 'complete'
	| 'error'
	| 'denied';

export interface AgentToolCall {
	id: string;
	name: string;
	messageId: string;
	/** Parsed input, once it is known. */
	input?: unknown;
	/** Raw input JSON as it streams in. */
	inputJson: string;
	status: AgentToolCallStatus;
	output?: string;
	approval?: { summary?: string; params?: ToolApprovalParam[] };
}

export type AgentSessionStatus = 'idle' | 'running' | 'awaiting-approval' | 'complete' | 'error';

export interface AgentUsage {
	inputTokens: number;
	outputTokens: number;
	cacheReadTokens: number;
	cacheCreationTokens: number;
}

export interface AgentSessionState {
	status: AgentSessionStatus;
	sessionId?: string;
	model?: string;
	messages: AgentMessage[];
	/** Tool calls by id, in the order they started. */
	toolCalls: AgentToolCall[];
	todos: TodoItem[];
	usage: AgentUsage;
	result?: string;
	costUsd?: number;
	durationMs?: number;
	error?: string;
}
