/**
 * A reactive agent session for Svelte 5.
 *
 * ```svelte
 * <script lang="ts">
 *   import { AgentSession, toActivityItems } from 'agents-kit-svelte';
 *   const session = new AgentSession();
 *   // session.consume(fromClaudeAgentSdk(stream)) or session.apply(event)
 * </script>
 *
 * <AgentActivity items={toActivityItems(session.state)} />
 * <TodoList items={session.state.todos} />
 * ```
 */

import type { AgentEvent, AgentSessionState } from './events';
import { applyAgentEvent, createAgentSessionState } from './state';

export interface AgentSessionOptions {
	/** Start from an existing state, for example one restored from storage. */
	initialState?: AgentSessionState;
	/** Called after every event is applied. */
	onEvent?: (event: AgentEvent, state: AgentSessionState) => void;
}

export class AgentSession {
	/** The session state. Deeply reactive: read it in markup, `$derived` or `$effect`. */
	state: AgentSessionState = $state(createAgentSessionState());

	#onEvent?: AgentSessionOptions['onEvent'];
	#approvals = new Map<string, (approved: boolean) => void>();

	constructor(options: AgentSessionOptions = {}) {
		if (options.initialState) this.state = options.initialState;
		this.#onEvent = options.onEvent;
	}

	/** Applies one event. */
	apply(event: AgentEvent): void {
		applyAgentEvent(this.state, event);
		if (event.type === 'approval.resolve') this.#settle(event.toolCallId, event.approved);
		this.#onEvent?.(event, this.state);
	}

	/**
	 * Applies every event from a stream until it ends. A thrown error becomes an `error` event.
	 *
	 * @param events - Events from an adapter such as `fromClaudeAgentSdk`.
	 * @param signal - Stops reading when aborted.
	 */
	async consume(events: AsyncIterable<AgentEvent>, signal?: AbortSignal): Promise<void> {
		try {
			for await (const event of events) {
				if (signal?.aborted) break;
				this.apply(event);
			}
		} catch (error) {
			if (signal?.aborted) return;
			this.apply({ type: 'error', message: error instanceof Error ? error.message : String(error) });
		}
	}

	/**
	 * Marks a tool call as waiting for approval and resolves when the user decides.
	 * Use it inside the Agent SDK's `canUseTool` callback, and wire `ToolApproval`'s
	 * buttons to `resolveApproval`.
	 *
	 * @returns `true` when approved, `false` when denied.
	 */
	requestApproval(
		toolCallId: string,
		details: { summary?: string; params?: Extract<AgentEvent, { type: 'approval.request' }>['params'] } = {}
	): Promise<boolean> {
		return new Promise((resolve) => {
			this.#approvals.get(toolCallId)?.(false);
			this.#approvals.set(toolCallId, resolve);
			this.apply({ type: 'approval.request', toolCallId, ...details });
		});
	}

	/** Approves or denies a tool call that is waiting. */
	resolveApproval(toolCallId: string, approved: boolean): void {
		this.apply({ type: 'approval.resolve', toolCallId, approved });
	}

	/** Clears the session. Pending approvals are denied. */
	reset(): void {
		for (const resolve of this.#approvals.values()) resolve(false);
		this.#approvals.clear();
		this.state = createAgentSessionState();
	}

	#settle(toolCallId: string, approved: boolean) {
		const resolve = this.#approvals.get(toolCallId);
		if (!resolve) return;
		this.#approvals.delete(toolCallId);
		resolve(approved);
	}
}
