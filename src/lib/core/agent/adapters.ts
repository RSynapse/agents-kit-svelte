/**
 * Adapters that translate Claude streams into kit `AgentEvent`s: the Messages API stream
 * and the Claude Agent SDK. They live in one module so it has no runtime imports.
 */

// ---------------------------------------------------------------------------
// Messages API stream
// ---------------------------------------------------------------------------

/**
 * Adapter for the Claude Messages API streaming events (`stream: true`, or
 * `client.messages.stream()` in the Anthropic SDKs).
 *
 * The types below describe only the fields the adapter reads, so the kit does not
 * depend on any SDK. Pass the SDK's events straight in.
 */

import type { AgentEvent } from './events';

export interface MessagesStreamUsage {
	input_tokens?: number | null;
	output_tokens?: number | null;
	cache_read_input_tokens?: number | null;
	cache_creation_input_tokens?: number | null;
}

export interface MessagesStreamContentBlock {
	type: string;
	id?: string;
	name?: string;
	input?: unknown;
	text?: string;
	thinking?: string;
}

export type MessagesStreamEvent =
	| { type: 'message_start'; message: { id: string; model?: string; usage?: MessagesStreamUsage } }
	| { type: 'content_block_start'; index: number; content_block: MessagesStreamContentBlock }
	| {
			type: 'content_block_delta';
			index: number;
			delta: { type: string; text?: string; thinking?: string; partial_json?: string };
	  }
	| { type: 'content_block_stop'; index: number }
	| { type: 'message_delta'; delta: { stop_reason?: string | null }; usage?: MessagesStreamUsage }
	| { type: 'message_stop' }
	| { type: 'ping' }
	| { type: 'error'; error: { type?: string; message: string } }
	| { type: string; [key: string]: unknown };

const TOOL_BLOCK_TYPES = new Set(['tool_use', 'server_tool_use', 'mcp_tool_use']);

function usageEvent(usage: MessagesStreamUsage | undefined): AgentEvent | undefined {
	if (!usage) return undefined;
	const event: Extract<AgentEvent, { type: 'usage' }> = { type: 'usage' };
	if (usage.input_tokens != null) event.inputTokens = usage.input_tokens;
	if (usage.output_tokens != null) event.outputTokens = usage.output_tokens;
	if (usage.cache_read_input_tokens != null) event.cacheReadTokens = usage.cache_read_input_tokens;
	if (usage.cache_creation_input_tokens != null) event.cacheCreationTokens = usage.cache_creation_input_tokens;
	return Object.keys(event).length > 1 ? event : undefined;
}

function parseJson(text: string): unknown {
	if (text.trim() === '') return {};
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

/**
 * Creates a stateful translator for one Messages API stream. Call it with each raw event;
 * it returns the matching kit events (often none, sometimes several).
 *
 * Use this when you receive events one by one, for example over a WebSocket. For an
 * async iterable, `fromMessagesStream` is simpler.
 */
export function createMessagesStreamTranslator(): (event: MessagesStreamEvent) => AgentEvent[] {
	let messageId = '';
	let stopReason: string | undefined;
	const blocks = new Map<number, { kind: 'text' | 'thinking' | 'tool'; id: string; json: string }>();

	return (raw) => {
		const out: AgentEvent[] = [];
		switch (raw.type) {
			case 'message_start': {
				const { message } = raw as Extract<MessagesStreamEvent, { type: 'message_start' }>;
				messageId = message.id;
				stopReason = undefined;
				blocks.clear();
				out.push({ type: 'message.start', messageId, model: message.model });
				const usage = usageEvent(message.usage);
				if (usage) out.push(usage);
				break;
			}
			case 'content_block_start': {
				const { index, content_block: block } = raw as Extract<
					MessagesStreamEvent,
					{ type: 'content_block_start' }
				>;
				const blockId = `${messageId}:${index}`;
				if (TOOL_BLOCK_TYPES.has(block.type) && block.id) {
					blocks.set(index, { kind: 'tool', id: block.id, json: '' });
					const hasInput = block.input && Object.keys(block.input as object).length > 0;
					out.push({
						type: 'tool.start',
						messageId,
						toolCallId: block.id,
						name: block.name ?? block.type,
						input: hasInput ? block.input : undefined
					});
				} else if (block.type === 'thinking') {
					blocks.set(index, { kind: 'thinking', id: blockId, json: '' });
					if (block.thinking) out.push({ type: 'thinking.delta', messageId, blockId, text: block.thinking });
				} else if (block.type === 'text') {
					blocks.set(index, { kind: 'text', id: blockId, json: '' });
					if (block.text) out.push({ type: 'text.delta', messageId, blockId, text: block.text });
				}
				break;
			}
			case 'content_block_delta': {
				const { index, delta } = raw as Extract<MessagesStreamEvent, { type: 'content_block_delta' }>;
				const block = blocks.get(index);
				if (!block) break;
				if (delta.type === 'text_delta' && delta.text) {
					out.push({ type: 'text.delta', messageId, blockId: block.id, text: delta.text });
				} else if (delta.type === 'thinking_delta' && delta.thinking) {
					out.push({ type: 'thinking.delta', messageId, blockId: block.id, text: delta.thinking });
				} else if (delta.type === 'input_json_delta' && delta.partial_json !== undefined) {
					block.json += delta.partial_json;
					out.push({ type: 'tool.input.delta', toolCallId: block.id, partialJson: delta.partial_json });
				}
				break;
			}
			case 'content_block_stop': {
				const { index } = raw as Extract<MessagesStreamEvent, { type: 'content_block_stop' }>;
				const block = blocks.get(index);
				if (block?.kind === 'tool' && block.json !== '') {
					out.push({ type: 'tool.input', toolCallId: block.id, input: parseJson(block.json) });
				}
				break;
			}
			case 'message_delta': {
				const { usage } = raw as Extract<MessagesStreamEvent, { type: 'message_delta' }>;
				// message_delta usage is cumulative for this message; only output tokens change.
				if (usage?.output_tokens != null) out.push({ type: 'usage', outputTokens: usage.output_tokens });
				stopReason =
					(raw as Extract<MessagesStreamEvent, { type: 'message_delta' }>).delta?.stop_reason ?? stopReason;
				break;
			}
			case 'message_stop':
				out.push({ type: 'message.stop', messageId, stopReason });
				break;
			case 'error': {
				const { error } = raw as Extract<MessagesStreamEvent, { type: 'error' }>;
				out.push({ type: 'error', message: error?.message ?? 'Stream error' });
				break;
			}
		}
		return out;
	};
}

/**
 * Translates a Messages API event stream into kit events.
 *
 * ```ts
 * const stream = client.messages.stream({ model, max_tokens, messages });
 * await session.consume(fromMessagesStream(stream));
 * ```
 */
export async function* fromMessagesStream(
	events: AsyncIterable<MessagesStreamEvent>
): AsyncGenerator<AgentEvent> {
	const translate = createMessagesStreamTranslator();
	for await (const raw of events) yield* translate(raw);
}

// ---------------------------------------------------------------------------
// Claude Agent SDK
// ---------------------------------------------------------------------------

/**
 * Adapter for the Claude Agent SDK (`query()` from `@anthropic-ai/claude-agent-sdk`).
 *
 * The types below describe only the fields the adapter reads, so the kit does not depend
 * on the SDK. Pass the SDK's messages straight in. Run the SDK on your server and send the
 * messages to the browser (for example as server-sent events), then translate them there.
 *
 * Approvals arrive through the SDK's `canUseTool` callback, not as messages. Bridge it
 * with `AgentSession.requestApproval()`.
 */


interface SdkContentBlock {
	type: string;
	id?: string;
	name?: string;
	input?: unknown;
	text?: string;
	thinking?: string;
	tool_use_id?: string;
	content?: string | { type: string; text?: string }[];
	is_error?: boolean;
}

export type ClaudeAgentSdkMessage =
	| { type: 'system'; subtype: string; session_id?: string; model?: string }
	| {
			type: 'assistant';
			message: { id: string; model?: string; content: SdkContentBlock[]; usage?: MessagesStreamUsage; stop_reason?: string | null };
			parent_tool_use_id?: string | null;
	  }
	| {
			type: 'user';
			message: { role?: string; content: string | SdkContentBlock[] };
			parent_tool_use_id?: string | null;
			uuid?: string;
	  }
	| {
			type: 'result';
			subtype: string;
			result?: string;
			is_error?: boolean;
			total_cost_usd?: number;
			duration_ms?: number;
			usage?: MessagesStreamUsage;
	  }
	| { type: 'stream_event'; event: MessagesStreamEvent; parent_tool_use_id?: string | null }
	| { type: string; [key: string]: unknown };

export interface ClaudeAgentSdkAdapterOptions {
	/**
	 * Also show messages from subagents (those with a `parent_tool_use_id`). Default `false`:
	 * the subagent's own tool call still shows, but not its inner conversation.
	 */
	includeSubagents?: boolean;
	/**
	 * Emit `user.message` for user prompts the SDK echoes back. Default `false`, because apps
	 * usually add the user's message themselves when it is sent.
	 */
	emitUserMessages?: boolean;
}

function toolResultText(content: SdkContentBlock['content']): string {
	if (typeof content === 'string') return content;
	if (!Array.isArray(content)) return '';
	return content.map((part) => (part.type === 'text' ? (part.text ?? '') : `[${part.type}]`)).join('\n');
}

/**
 * Creates a stateful translator for one Agent SDK run. Call it with each SDK message; it
 * returns the matching kit events.
 */
export function createClaudeAgentSdkTranslator(
	options: ClaudeAgentSdkAdapterOptions = {}
): (message: ClaudeAgentSdkMessage) => AgentEvent[] {
	const { includeSubagents = false, emitUserMessages = false } = options;
	const translateStream = createMessagesStreamTranslator();
	/** Messages already delivered through partial `stream_event`s. */
	const streamed = new Set<string>();
	let userCount = 0;

	return (raw) => {
		const parent = (raw as { parent_tool_use_id?: string | null }).parent_tool_use_id;
		if (parent && !includeSubagents) return [];

		const out: AgentEvent[] = [];
		switch (raw.type) {
			case 'system': {
				const msg = raw as Extract<ClaudeAgentSdkMessage, { type: 'system' }>;
				if (msg.subtype === 'init') out.push({ type: 'session.start', sessionId: msg.session_id, model: msg.model });
				break;
			}
			case 'stream_event': {
				const { event } = raw as Extract<ClaudeAgentSdkMessage, { type: 'stream_event' }>;
				if (event.type === 'message_start') {
					streamed.add((event as Extract<MessagesStreamEvent, { type: 'message_start' }>).message.id);
				}
				out.push(...translateStream(event));
				break;
			}
			case 'assistant': {
				const { message } = raw as Extract<ClaudeAgentSdkMessage, { type: 'assistant' }>;
				// With `includePartialMessages`, the content already arrived as stream events.
				if (streamed.has(message.id)) {
					for (const block of message.content) {
						if (block.type === 'tool_use' && block.id) {
							out.push({ type: 'tool.input', toolCallId: block.id, input: block.input });
						}
					}
					break;
				}
				// The SDK can split one API message into several assistant messages, one per block.
				out.push({ type: 'message.start', messageId: message.id, model: message.model });
				message.content.forEach((block, index) => {
					const blockId = `${message.id}:${block.id ?? index}`;
					if (block.type === 'text' && block.text) {
						out.push({ type: 'text.delta', messageId: message.id, blockId, text: block.text });
					} else if (block.type === 'thinking' && block.thinking) {
						out.push({ type: 'thinking.delta', messageId: message.id, blockId, text: block.thinking });
					} else if ((block.type === 'tool_use' || block.type === 'server_tool_use') && block.id) {
						out.push({
							type: 'tool.start',
							messageId: message.id,
							toolCallId: block.id,
							name: block.name ?? block.type,
							input: block.input
						});
					}
				});
				const usage = usageEvent(message.usage);
				if (usage) out.push(usage);
				break;
			}
			case 'user': {
				const msg = raw as Extract<ClaudeAgentSdkMessage, { type: 'user' }>;
				const { content } = msg.message;
				if (typeof content === 'string') {
					if (emitUserMessages) {
						out.push({ type: 'user.message', messageId: msg.uuid ?? `user-${++userCount}`, text: content });
					}
					break;
				}
				const text: string[] = [];
				for (const block of content) {
					if (block.type === 'tool_result' && block.tool_use_id) {
						out.push({
							type: 'tool.result',
							toolCallId: block.tool_use_id,
							output: toolResultText(block.content),
							isError: block.is_error ?? false
						});
					} else if (block.type === 'text' && block.text) {
						text.push(block.text);
					}
				}
				if (emitUserMessages && text.length > 0) {
					out.push({ type: 'user.message', messageId: msg.uuid ?? `user-${++userCount}`, text: text.join('\n') });
				}
				break;
			}
			case 'result': {
				const msg = raw as Extract<ClaudeAgentSdkMessage, { type: 'result' }>;
				const isError = msg.is_error ?? msg.subtype !== 'success';
				out.push({
					type: 'session.end',
					result: msg.result ?? (isError ? msg.subtype : undefined),
					isError,
					costUsd: msg.total_cost_usd,
					durationMs: msg.duration_ms
				});
				break;
			}
		}
		return out;
	};
}

/**
 * Translates an Agent SDK message stream into kit events.
 *
 * ```ts
 * for await (const event of fromClaudeAgentSdk(query({ prompt, options }))) session.apply(event);
 * ```
 */
export async function* fromClaudeAgentSdk(
	messages: AsyncIterable<ClaudeAgentSdkMessage>,
	options: ClaudeAgentSdkAdapterOptions = {}
): AsyncGenerator<AgentEvent> {
	const translate = createClaudeAgentSdkTranslator(options);
	for await (const raw of messages) yield* translate(raw);
}
