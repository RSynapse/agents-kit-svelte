import assert from 'node:assert/strict';
import test from 'node:test';
import type { AgentEvent } from '../src/lib/core/agent/events.ts';
import {
	applyAgentEvent,
	contextTokens,
	createAgentSessionState,
	lastAssistantMessage,
	messageText,
	messageThinking,
	pendingApprovals,
	toActivityItems,
	toApprovalParams,
	todosFromTodoWrite
} from '../src/lib/core/agent/state.ts';
import {
	createClaudeAgentSdkTranslator,
	createMessagesStreamTranslator,
	fromMessagesStream,
	type ClaudeAgentSdkMessage,
	type MessagesStreamEvent
} from '../src/lib/core/agent/adapters.ts';

function run(events: AgentEvent[]) {
	const state = createAgentSessionState();
	for (const event of events) applyAgentEvent(state, event);
	return state;
}

test('applyAgentEvent builds messages, tool calls and status from a turn', () => {
	const state = run([
		{ type: 'user.message', messageId: 'u1', text: 'Fix the login redirect' },
		{ type: 'message.start', messageId: 'm1', model: 'claude' },
		{ type: 'thinking.delta', messageId: 'm1', blockId: 'b0', text: 'Look at ' },
		{ type: 'thinking.delta', messageId: 'm1', blockId: 'b0', text: 'auth.ts' },
		{ type: 'text.delta', messageId: 'm1', blockId: 'b1', text: 'Reading ' },
		{ type: 'text.delta', messageId: 'm1', blockId: 'b1', text: 'the file.' },
		{ type: 'tool.start', messageId: 'm1', toolCallId: 't1', name: 'Read' },
		{ type: 'tool.input.delta', toolCallId: 't1', partialJson: '{"file_path":' },
		{ type: 'tool.input', toolCallId: 't1', input: { file_path: 'src/auth.ts' } },
		{ type: 'message.stop', messageId: 'm1', stopReason: 'tool_use' }
	]);

	assert.equal(state.status, 'running');
	assert.equal(state.messages.length, 2);
	const reply = lastAssistantMessage(state)!;
	assert.equal(messageText(reply), 'Reading the file.');
	assert.equal(messageThinking(reply), 'Look at auth.ts');
	assert.equal(reply.streaming, false);
	assert.deepEqual(
		reply.parts.map((p) => p.kind),
		['thinking', 'text', 'tool']
	);
	assert.equal(state.toolCalls[0].inputJson, '{"file_path":');
	assert.equal(state.toolCalls[0].status, 'running');
	assert.deepEqual(toActivityItems(state), [
		{ id: 't1', label: 'Read', target: 'src/auth.ts', status: 'running', type: 'tool' }
	]);

	applyAgentEvent(state, { type: 'tool.result', toolCallId: 't1', output: 'export …' });
	applyAgentEvent(state, { type: 'session.end', result: 'Done', costUsd: 0.02 });
	assert.equal(state.toolCalls[0].status, 'complete');
	assert.equal(state.status, 'complete');
	assert.equal(state.costUsd, 0.02);
});

test('approvals move the session to awaiting-approval and back', () => {
	const state = run([
		{ type: 'message.start', messageId: 'm1' },
		{ type: 'tool.start', messageId: 'm1', toolCallId: 't1', name: 'Bash', input: { command: 'pnpm test' } },
		{ type: 'approval.request', toolCallId: 't1', summary: 'Run tests' }
	]);
	assert.equal(state.status, 'awaiting-approval');
	assert.equal(pendingApprovals(state).length, 1);

	applyAgentEvent(state, { type: 'approval.resolve', toolCallId: 't1', approved: false });
	assert.equal(state.status, 'running');
	assert.equal(state.toolCalls[0].status, 'denied');

	applyAgentEvent(state, { type: 'tool.result', toolCallId: 't1', output: 'denied', isError: true });
	assert.equal(state.toolCalls[0].status, 'denied');
	assert.equal(toActivityItems(state)[0].status, 'error');
});

test('a TodoWrite tool call replaces the todo list and is hidden from activity', () => {
	const state = run([
		{ type: 'message.start', messageId: 'm1' },
		{
			type: 'tool.start',
			messageId: 'm1',
			toolCallId: 't1',
			name: 'TodoWrite',
			input: {
				todos: [
					{ content: 'Read auth.ts', status: 'completed', activeForm: 'Reading auth.ts' },
					{ content: 'Fix redirect', status: 'in_progress', activeForm: 'Fixing redirect' },
					{ content: 'Run tests', status: 'pending' }
				]
			}
		}
	]);
	assert.deepEqual(
		state.todos.map((t) => [t.label, t.status, t.detail]),
		[
			['Read auth.ts', 'completed', undefined],
			['Fix redirect', 'in-progress', 'Fixing redirect'],
			['Run tests', 'pending', undefined]
		]
	);
	assert.equal(toActivityItems(state).length, 0);
	assert.equal(toActivityItems(state, { hideTodoTool: false }).length, 1);
	assert.equal(todosFromTodoWrite({ nope: true }), undefined);
});

test('usage replaces figures unless incremental, and an error stops streaming', () => {
	const state = run([
		{ type: 'message.start', messageId: 'm1' },
		{ type: 'usage', inputTokens: 1000, cacheReadTokens: 500, outputTokens: 10 },
		{ type: 'usage', outputTokens: 40 },
		{ type: 'usage', outputTokens: 5, incremental: true },
		{ type: 'error', message: 'overloaded' }
	]);
	assert.equal(contextTokens(state), 1545);
	assert.equal(state.status, 'error');
	assert.equal(state.error, 'overloaded');
	assert.equal(state.messages[0].streaming, false);
});

test('toApprovalParams renders long or structured values as code', () => {
	assert.deepEqual(toApprovalParams({ command: 'ls', options: { all: true } }), [
		{ label: 'command', value: 'ls', code: false },
		{ label: 'options', value: '{\n  "all": true\n}', code: true }
	]);
	assert.deepEqual(toApprovalParams('nope'), []);
});

const MESSAGES_STREAM: MessagesStreamEvent[] = [
	{
		type: 'message_start',
		message: { id: 'msg_1', model: 'claude', usage: { input_tokens: 120, output_tokens: 1 } }
	},
	{ type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } },
	{ type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'Plan it.' } },
	{ type: 'content_block_delta', index: 0, delta: { type: 'signature_delta' } },
	{ type: 'content_block_stop', index: 0 },
	{ type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } },
	{ type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: 'Checking ' } },
	{ type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: 'the weather.' } },
	{ type: 'content_block_stop', index: 1 },
	{
		type: 'content_block_start',
		index: 2,
		content_block: { type: 'tool_use', id: 'toolu_1', name: 'get_weather', input: {} }
	},
	{ type: 'content_block_delta', index: 2, delta: { type: 'input_json_delta', partial_json: '{"city":' } },
	{ type: 'content_block_delta', index: 2, delta: { type: 'input_json_delta', partial_json: '"Oslo"}' } },
	{ type: 'content_block_stop', index: 2 },
	{ type: 'message_delta', delta: { stop_reason: 'tool_use' }, usage: { output_tokens: 42 } },
	{ type: 'message_stop' }
];

test('fromMessagesStream translates a streamed tool-use turn', async () => {
	async function* source() {
		yield* MESSAGES_STREAM;
	}
	const events: AgentEvent[] = [];
	for await (const event of fromMessagesStream(source())) events.push(event);

	const state = run(events);
	const reply = lastAssistantMessage(state)!;
	assert.equal(messageText(reply), 'Checking the weather.');
	assert.equal(messageThinking(reply), 'Plan it.');
	assert.equal(reply.stopReason, 'tool_use');
	assert.equal(reply.streaming, false);
	assert.deepEqual(state.toolCalls[0].input, { city: 'Oslo' });
	assert.equal(state.toolCalls[0].inputJson, '{"city":"Oslo"}');
	assert.equal(state.usage.inputTokens, 120);
	assert.equal(state.usage.outputTokens, 42);
});

test('Messages stream translator ignores pings and reports errors', () => {
	const translate = createMessagesStreamTranslator();
	assert.deepEqual(translate({ type: 'ping' }), []);
	assert.deepEqual(translate({ type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }), [
		{ type: 'error', message: 'Overloaded' }
	]);
});

const SDK_RUN: ClaudeAgentSdkMessage[] = [
	{ type: 'system', subtype: 'init', session_id: 'sess_1', model: 'claude' },
	{
		type: 'assistant',
		message: {
			id: 'msg_1',
			content: [
				{ type: 'text', text: 'Let me run the tests.' },
				{ type: 'tool_use', id: 'toolu_1', name: 'Bash', input: { command: 'pnpm test' } }
			],
			usage: { input_tokens: 2000, cache_read_input_tokens: 8000, output_tokens: 60 }
		},
		parent_tool_use_id: null
	},
	{
		type: 'assistant',
		message: {
			id: 'msg_sub',
			content: [{ type: 'text', text: 'subagent chatter' }]
		},
		parent_tool_use_id: 'toolu_task'
	},
	{
		type: 'user',
		message: {
			role: 'user',
			content: [{ type: 'tool_result', tool_use_id: 'toolu_1', content: [{ type: 'text', text: '9 passed' }] }]
		},
		parent_tool_use_id: null
	},
	{ type: 'result', subtype: 'success', result: 'All green', is_error: false, total_cost_usd: 0.11, duration_ms: 5400 }
];

test('Claude Agent SDK translator maps a run and skips subagent messages', () => {
	const translate = createClaudeAgentSdkTranslator();
	const state = run(SDK_RUN.flatMap(translate));

	assert.equal(state.sessionId, 'sess_1');
	assert.equal(state.messages.length, 1);
	assert.equal(messageText(state.messages[0]), 'Let me run the tests.');
	assert.equal(state.toolCalls[0].status, 'complete');
	assert.equal(state.toolCalls[0].output, '9 passed');
	assert.equal(contextTokens(state), 10060);
	assert.equal(state.status, 'complete');
	assert.equal(state.result, 'All green');
	assert.equal(state.durationMs, 5400);
});

test('Claude Agent SDK translator does not duplicate text with partial messages on', () => {
	const translate = createClaudeAgentSdkTranslator();
	const partials: ClaudeAgentSdkMessage[] = MESSAGES_STREAM.map((event) => ({ type: 'stream_event', event }));
	const final: ClaudeAgentSdkMessage = {
		type: 'assistant',
		message: {
			id: 'msg_1',
			content: [
				{ type: 'text', text: 'Checking the weather.' },
				{ type: 'tool_use', id: 'toolu_1', name: 'get_weather', input: { city: 'Oslo' } }
			]
		}
	};
	const state = run([...partials, final].flatMap(translate));
	assert.equal(messageText(state.messages[0]), 'Checking the weather.');
	assert.equal(state.toolCalls.length, 1);
	assert.deepEqual(state.toolCalls[0].input, { city: 'Oslo' });
});

test('Claude Agent SDK translator can echo user prompts and report failed runs', () => {
	const translate = createClaudeAgentSdkTranslator({ emitUserMessages: true });
	const state = run(
		[
			{ type: 'user', message: { role: 'user', content: 'hello' }, uuid: 'u-1' },
			{ type: 'result', subtype: 'error_max_turns', is_error: true }
		].flatMap((m) => translate(m as ClaudeAgentSdkMessage))
	);
	assert.equal(messageText(state.messages[0]), 'hello');
	assert.equal(state.status, 'error');
	assert.equal(state.error, 'error_max_turns');
});
