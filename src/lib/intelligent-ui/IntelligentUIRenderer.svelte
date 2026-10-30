<script lang="ts">
	import AgentActivity from '../agents/AgentActivity.svelte';
	import ApprovalCard from '../agents/ApprovalCard.svelte';
	import CodeBlock from '../agents/CodeBlock.svelte';
	import FileDiff from '../agents/FileDiff.svelte';
	import TodoList from '../agents/TodoList.svelte';
	import ToolApproval from '../agents/ToolApproval.svelte';
	import ToolResult from '../agents/ToolResult.svelte';
	import GitHubChecksPanel from '../github/GitHubChecksPanel.svelte';
	import GitHubCommitCard from '../github/GitHubCommitCard.svelte';
	import GitHubIssueCard from '../github/GitHubIssueCard.svelte';
	import GitHubPullRequestCard from '../github/GitHubPullRequestCard.svelte';
	import AgentGenerativeSurface from './AgentGenerativeSurface.svelte';
	import type {
		ActivityItem,
		ApprovalQuestion,
		DynamicUINode,
		GeneratedSurfaceContent,
		TodoItem,
		ToolApprovalParam
	} from '../types';

	interface Props {
		nodes: DynamicUINode[];
		onIntent?: (intent: { nodeId: string; action: string; detail?: string }) => void;
		class?: string;
	}

	let { nodes, onIntent, class: className = '' }: Props = $props();
</script>

<div class="space-y-4 {className}">
	{#each nodes as node (node.id)}
		<div data-node-id={node.id} data-component={node.component} class="space-y-1.5">
			{#if node.title}
				<div class="flex items-center justify-between text-xs">
					<span class="font-semibold text-fg-main">{node.title}</span>
					<code class="rounded bg-canvas-secondary px-1.5 py-0.5 font-mono text-[10px] text-fg-light">
						&lt;{node.component} /&gt;
					</code>
				</div>
			{/if}

			{#if node.component === 'agent-activity'}
				<AgentActivity
					items={(node.props.items as ActivityItem[] | undefined) ?? [
						{ id: '1', type: 'text', label: 'Dynamic Intelligent UI activity node' },
						{
							id: '2',
							type: 'tool',
							label: 'Read',
							target: 'src/lib/intelligent-ui/IntelligentUIRenderer.svelte',
							status: 'complete'
						}
					]}
				/>
			{:else if node.component === 'todo-list'}
				<TodoList
					title={(node.props.title as string | undefined) ?? 'Dynamic Agent Plan'}
					items={(node.props.items as TodoItem[] | undefined) ?? [
						{ id: '1', label: 'Parse LLM tool call schema', status: 'completed' },
						{ id: '2', label: 'Mount reactive Svelte 5 surface', status: 'in-progress' }
					]}
				/>
			{:else if node.component === 'tool-approval'}
				<ToolApproval
					tool={(node.props.tool as string | undefined) ?? 'Bash'}
					summary={(node.props.summary as string | undefined) ?? 'corepack pnpm check'}
					params={(node.props.params as ToolApprovalParam[] | undefined) ?? [
						{ label: 'Command', value: 'corepack pnpm check', code: true }
					]}
					onApprove={() => onIntent?.({ nodeId: node.id, action: 'approve' })}
					onDeny={() => onIntent?.({ nodeId: node.id, action: 'deny' })}
				/>
			{:else if node.component === 'tool-result'}
				<ToolResult
					tool={(node.props.tool as string | undefined) ?? 'Bash'}
					summary={(node.props.summary as string | undefined) ?? 'svelte-check'}
					output={(node.props.output as string | undefined) ?? 'svelte-check found 0 errors and 0 warnings'}
				/>
			{:else if node.component === 'file-diff'}
				<FileDiff
					filename={(node.props.filename as string | undefined) ?? 'src/routes/+page.svelte'}
					patch={(node.props.patch as string | undefined) ??
						'@@ -1,2 +1,3 @@\n import TrailsideClaudeChat from "$lib/trailside/TrailsideClaudeChat.svelte";\n+<TrailsideClaudeChat />'}
				/>
			{:else if node.component === 'code-block'}
				<CodeBlock
					filename={(node.props.filename as string | undefined) ?? 'schema.json'}
					language={(node.props.language as string | undefined) ?? 'json'}
					code={(node.props.code as string | undefined) ?? JSON.stringify(node.props, null, 2)}
				/>
			{:else if node.component === 'approval-card'}
				<ApprovalCard
					title={(node.props.title as string | undefined) ?? 'Confirm Intelligent UI Action'}
					questions={(node.props.questions as ApprovalQuestion[] | undefined) ?? [
						{
							id: 'q1',
							question: 'Which layout should the agent render?',
							options: [
								{ id: 'o1', label: 'Interactive Kanban Board' },
								{ id: 'o2', label: 'Side-by-side Diff Inspector' }
							]
						}
					]}
					onSubmit={(answers) =>
						onIntent?.({ nodeId: node.id, action: 'submit', detail: JSON.stringify(answers) })}
				/>
			{:else if node.component === 'github-issue-card'}
				<GitHubIssueCard
					onDispatchRun={(num) =>
						onIntent?.({ nodeId: node.id, action: 'dispatch-issue', detail: String(num) })}
				/>
			{:else if node.component === 'github-pr-card'}
				<GitHubPullRequestCard
					onApproveMerge={(num) =>
						onIntent?.({ nodeId: node.id, action: 'approve-pr', detail: String(num) })}
				/>
			{:else if node.component === 'github-commit-card'}
				<GitHubCommitCard />
			{:else if node.component === 'github-checks-panel'}
				<GitHubChecksPanel
					onFixWithAgent={(id) =>
						onIntent?.({ nodeId: node.id, action: 'fix-check', detail: id })}
				/>
			{:else}
				<AgentGenerativeSurface
					content={node.props.content as GeneratedSurfaceContent | undefined}
					onAction={(act, id) =>
						onIntent?.({ nodeId: node.id, action: act, detail: id })}
				/>
			{/if}
		</div>
	{/each}
</div>
