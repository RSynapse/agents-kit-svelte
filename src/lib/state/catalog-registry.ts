export type CatalogCategory =
	| 'beUI Agents'
	| 'Beautiful UI'
	| 'GitHub Cards & Layouts'
	| 'Intelligent UI & Generative'
	| 'Agents UI Orchestration'
	| 'AI Elements & Coding'
	| 'Voice & Effects';

export interface CatalogItemMeta {
	slug: string;
	name: string;
	category: CatalogCategory;
	sveltePath: string;
	upstreamSource: string;
	description: string;
	usageSnippet: string;
}

export const CATALOG_ITEMS: CatalogItemMeta[] = [
	// 1. beUI Agents
	{
		slug: 'agent-activity',
		name: 'AgentActivity',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/AgentActivity.svelte',
		upstreamSource: 'components/beui/components/agents/agent-activity',
		description: 'Collapsible Claude Code reasoning, tool, search, and step trace with +add/-del counts.',
		usageSnippet: `<script lang="ts">\n  import { AgentActivity } from 'agents-kit-svelte';\n</script>\n<AgentActivity items={items} status="complete" durationSeconds={6} />`
	},
	{
		slug: 'todo-list',
		name: 'TodoList',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/TodoList.svelte',
		upstreamSource: 'components/beui/components/agents/todo-list.tsx',
		description: 'Streaming task plan checklist with animated status indicators and completion counter.',
		usageSnippet: `<script lang="ts">\n  import { TodoList } from 'agents-kit-svelte';\n</script>\n<TodoList title="Implementation plan" items={todoItems} />`
	},
	{
		slug: 'tool-approval',
		name: 'ToolApproval',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/ToolApproval.svelte',
		upstreamSource: 'components/beui/components/agents/tool-approval.tsx',
		description: 'Expandable tool permission prompt with Allow once, Always allow, Deny, and <dl> parameters.',
		usageSnippet: `<script lang="ts">\n  import { ToolApproval } from 'agents-kit-svelte';\n</script>\n<ToolApproval tool="Bash" summary="corepack pnpm test" params={params} />`
	},
	{
		slug: 'tool-result',
		name: 'ToolResult',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/ToolResult.svelte',
		upstreamSource: 'components/beui/components/agents/tool-result.tsx',
		description: 'Collapsible terminal & tool output stream with duration metadata, copy, and retry.',
		usageSnippet: `<script lang="ts">\n  import { ToolResult } from 'agents-kit-svelte';\n</script>\n<ToolResult tool="Bash" output={stdout} status="success" meta="193ms" />`
	},
	{
		slug: 'file-diff',
		name: 'FileDiff',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/FileDiff.svelte',
		upstreamSource: 'components/beui/components/agents/file-diff.tsx',
		description: 'Unified diff viewer with dual old/new line numbers, +additions/-deletions, and copy button.',
		usageSnippet: `<script lang="ts">\n  import { FileDiff } from 'agents-kit-svelte';\n</script>\n<FileDiff filename="src/routes/+server.ts" patch={unifiedDiff} />`
	},
	{
		slug: 'code-block',
		name: 'CodeBlock',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/CodeBlock.svelte',
		upstreamSource: 'components/beui/components/agents/code-block.tsx',
		description: 'Syntax-aware code block with line numbers, highlighted lines, and streaming/ready states.',
		usageSnippet: `<script lang="ts">\n  import { CodeBlock } from 'agents-kit-svelte';\n</script>\n<CodeBlock filename="verify.ts" language="typescript" code={source} />`
	},
	{
		slug: 'approval-card',
		name: 'ApprovalCard',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/ApprovalCard.svelte',
		upstreamSource: 'components/beui/components/agents/approval-card',
		description: 'Multi-step interactive clarifying question card with radio, checkbox, and custom write-in input.',
		usageSnippet: `<script lang="ts">\n  import { ApprovalCard } from 'agents-kit-svelte';\n</script>\n<ApprovalCard title="Confirm redirect policy" questions={questions} />`
	},
	{
		slug: 'prompt-input',
		name: 'PromptInput',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/PromptInput.svelte',
		upstreamSource: 'components/beui/components/agents/prompt-input.tsx',
		description: 'IME-safe composer with @worktree/@skill context pills and Supported Agent switcher.',
		usageSnippet: `<script lang="ts">\n  import { PromptInput } from 'agents-kit-svelte';\n</script>\n<PromptInput agents={agents} selectedAgentId="claude-code" onSubmit={send} />`
	},
	{
		slug: 'message-bubble',
		name: 'MessageBubble',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/MessageBubble.svelte',
		upstreamSource: 'components/beui/components/agents/message-bubble.tsx',
		description: 'Composable message bubble with avatar, delivery status, and show-more disclosure.',
		usageSnippet: `<script lang="ts">\n  import { MessageBubble } from 'agents-kit-svelte';\n</script>\n<MessageBubble author="Claude Code" collapsible={true} />`
	},
	{
		slug: 'citations',
		name: 'Citations',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/Citations.svelte',
		upstreamSource: 'components/beui/components/agents/citations.tsx',
		description: 'Collapsible grounded source citations list with domain badges and index markers.',
		usageSnippet: `<script lang="ts">\n  import { Citations } from 'agents-kit-svelte';\n</script>\n<Citations citations={sources} defaultOpen={true} />`
	},
	{
		slug: 'image-generation',
		name: 'ImageGeneration',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/ImageGeneration.svelte',
		upstreamSource: 'components/beui/components/agents/image-generation.tsx',
		description: 'Media generation surface stepping through queued, generating, refining, complete, and error states.',
		usageSnippet: `<script lang="ts">\n  import { ImageGeneration } from 'agents-kit-svelte';\n</script>\n<ImageGeneration />`
	},
	{
		slug: 'ai-sidebar',
		name: 'AISidebar',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/AISidebar.svelte',
		upstreamSource: 'components/beui/components/agents/ai-sidebar.tsx',
		description: 'Collapsible workspace sidebar with search filter, pinned threads, and inline rename.',
		usageSnippet: `<script lang="ts">\n  import { AISidebar } from 'agents-kit-svelte';\n</script>\n<AISidebar />`
	},
	{
		slug: 'loading-states',
		name: 'ThinkingShimmer · AgentProgress · ReasoningText',
		category: 'beUI Agents',
		sveltePath: 'src/lib/agents/{ThinkingShimmer,AgentProgress,ReasoningText}.svelte',
		upstreamSource: 'components/beui/components/agents/loading-states',
		description: 'Animated status shimmer, 3x3 matrix timer, and cycling reasoning phrases.',
		usageSnippet: `<script lang="ts">\n  import { ThinkingShimmer, AgentProgress, ReasoningText } from 'agents-kit-svelte';\n</script>\n<AgentProgress label="Running checks" />`
	},

	// 2. Beautiful UI
	{
		slug: 'tool-chips',
		name: 'ToolChips',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/ToolChips.svelte',
		upstreamSource: 'components/beautiful-ui/tool-chips.tsx',
		description: 'Compact interactive status pills for parallel tool invocations with expandable output drawer.',
		usageSnippet: `<script lang="ts">\n  import { ToolChips } from 'agents-kit-svelte';\n</script>\n<ToolChips />`
	},
	{
		slug: 'recommendation-card',
		name: 'RecommendationCard',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/RecommendationCard.svelte',
		upstreamSource: 'components/beautiful-ui/recommendation-card.tsx',
		description: 'Confidence-scored agent recommendation card with reasoning bullets and alternative actions.',
		usageSnippet: `<script lang="ts">\n  import { RecommendationCard } from 'agents-kit-svelte';\n</script>\n<RecommendationCard />`
	},
	{
		slug: 'context-cards',
		name: 'ContextCards',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/ContextCards.svelte',
		upstreamSource: 'components/beautiful-ui/context-cards.tsx',
		description: 'Grid of attached context sources (files, URLs, commits, issues, schemas) with token counts.',
		usageSnippet: `<script lang="ts">\n  import { ContextCards } from 'agents-kit-svelte';\n</script>\n<ContextCards />`
	},
	{
		slug: 'diff-table',
		name: 'DiffTable',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/DiffTable.svelte',
		upstreamSource: 'components/beautiful-ui/diff-table.tsx',
		description: 'Structured key/field before-and-after comparison table for config or schema mutations.',
		usageSnippet: `<script lang="ts">\n  import { DiffTable } from 'agents-kit-svelte';\n</script>\n<DiffTable />`
	},
	{
		slug: 'records-table',
		name: 'RecordsTable & SelectionActions',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/RecordsTable.svelte',
		upstreamSource: 'components/beautiful-ui/records-table.tsx',
		description: 'Sortable, selectable agent data table paired with bulk SelectionActions toolbar.',
		usageSnippet: `<script lang="ts">\n  import { RecordsTable } from 'agents-kit-svelte';\n</script>\n<RecordsTable />`
	},
	{
		slug: 'filter-table',
		name: 'FilterTable',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/FilterTable.svelte',
		upstreamSource: 'components/beautiful-ui/filter-table.tsx',
		description: 'Faceted search and tag-filterable agent evaluation table.',
		usageSnippet: `<script lang="ts">\n  import { FilterTable } from 'agents-kit-svelte';\n</script>\n<FilterTable />`
	},
	{
		slug: 'flowchart',
		name: 'Flowchart',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/Flowchart.svelte',
		upstreamSource: 'components/beautiful-ui/flowchart.tsx',
		description: 'Interactive DAG workflow flowchart with node status inspection.',
		usageSnippet: `<script lang="ts">\n  import { Flowchart } from 'agents-kit-svelte';\n</script>\n<Flowchart />`
	},
	{
		slug: 'insight-cards',
		name: 'InsightCards',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/InsightCards.svelte',
		upstreamSource: 'components/beautiful-ui/insight-cards.tsx',
		description: 'KPI metric cards with sparkline trend bars, delta badges, and agent insight annotations.',
		usageSnippet: `<script lang="ts">\n  import { InsightCards } from 'agents-kit-svelte';\n</script>\n<InsightCards />`
	},
	{
		slug: 'fine-tune-card',
		name: 'FineTuneCard',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/FineTuneCard.svelte',
		upstreamSource: 'components/beautiful-ui/fine-tune-card.tsx',
		description: 'Interactive parameter tuning card for thinking budget, temperature, risk tier, and max turns.',
		usageSnippet: `<script lang="ts">\n  import { FineTuneCard } from 'agents-kit-svelte';\n</script>\n<FineTuneCard />`
	},
	{
		slug: 'search-list',
		name: 'SearchList',
		category: 'Beautiful UI',
		sveltePath: 'src/lib/beautiful/SearchList.svelte',
		upstreamSource: 'components/beautiful-ui/search-list.tsx',
		description: 'Instant faceted search list across issues, files, runs, and specs.',
		usageSnippet: `<script lang="ts">\n  import { SearchList } from 'agents-kit-svelte';\n</script>\n<SearchList />`
	},

	// 3. GitHub Cards & Layouts
	{
		slug: 'github-issue-card',
		name: 'GitHubIssueCard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubIssueCard.svelte',
		upstreamSource: 'Trailside GitHub Suite',
		description: 'GitHub issue card with triage labels, risk tier, active worktree run, criteria progress, and dispatch actions.',
		usageSnippet: `<script lang="ts">\n  import { GitHubIssueCard } from 'agents-kit-svelte';\n</script>\n<GitHubIssueCard issue={issue} />`
	},
	{
		slug: 'github-pr-card',
		name: 'GitHubPullRequestCard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubPullRequestCard.svelte',
		upstreamSource: 'Trailside GitHub Suite',
		description: 'GitHub pull request card with head/base branches, +add/-del stats, referee verdict, and collapsible CI checks.',
		usageSnippet: `<script lang="ts">\n  import { GitHubPullRequestCard } from 'agents-kit-svelte';\n</script>\n<GitHubPullRequestCard pr={pr} />`
	},
	{
		slug: 'github-commit-card',
		name: 'GitHubCommitCard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubCommitCard.svelte',
		upstreamSource: 'components/ai-elements/commit.tsx + GitHub Suite',
		description: 'Verified commit card with SHA copy, changed file list, and worktree checkout action.',
		usageSnippet: `<script lang="ts">\n  import { GitHubCommitCard } from 'agents-kit-svelte';\n</script>\n<GitHubCommitCard commit={commit} />`
	},
	{
		slug: 'github-checks-panel',
		name: 'GitHubChecksPanel',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubChecksPanel.svelte',
		upstreamSource: 'Trailside GitHub Suite',
		description: 'GitHub Actions & check suite status panel with one-click Fix with Claude Code action.',
		usageSnippet: `<script lang="ts">\n  import { GitHubChecksPanel } from 'agents-kit-svelte';\n</script>\n<GitHubChecksPanel checks={checks} />`
	},
	{
		slug: 'github-review-thread',
		name: 'GitHubReviewThreadCard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubReviewThreadCard.svelte',
		upstreamSource: 'Trailside GitHub Suite',
		description: 'Inline PR code review thread with diff hunk, suggested patch application, and reply box.',
		usageSnippet: `<script lang="ts">\n  import { GitHubReviewThreadCard } from 'agents-kit-svelte';\n</script>\n<GitHubReviewThreadCard thread={thread} />`
	},
	{
		slug: 'github-kanban-board',
		name: 'GitHubKanbanBoard',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubKanbanBoard.svelte',
		upstreamSource: 'Trailside GitHub Suite',
		description: '4-column reactive GitHub board layout (Triage, In Progress Runs, Ready for You, Merged) with area filters.',
		usageSnippet: `<script lang="ts">\n  import { GitHubKanbanBoard } from 'agents-kit-svelte';\n</script>\n<GitHubKanbanBoard />`
	},
	{
		slug: 'github-bento-layout',
		name: 'GitHubBentoLayout',
		category: 'GitHub Cards & Layouts',
		sveltePath: 'src/lib/github/GitHubBentoLayout.svelte',
		upstreamSource: 'Trailside GitHub Suite',
		description: 'Repository pulse bento layout combining active PR, issue dispatch card, CI checks panel, verified commit, and inline review thread.',
		usageSnippet: `<script lang="ts">\n  import { GitHubBentoLayout } from 'agents-kit-svelte';\n</script>\n<GitHubBentoLayout />`
	},

	// 4. Intelligent UI & Generative
	{
		slug: 'agent-generative-surface',
		name: 'AgentGenerativeSurface & ResultActions',
		category: 'Intelligent UI & Generative',
		sveltePath: 'src/lib/intelligent-ui/AgentGenerativeSurface.svelte',
		upstreamSource: 'components/agents-ui/agent-generative-surface.tsx',
		description: 'Polymorphic generative surface supporting comparison, recommendation, checklist, document, source-brief, activity, and GitHub cards with inline Edit & Compare modes.',
		usageSnippet: `<script lang="ts">\n  import { AgentGenerativeSurface } from 'agents-kit-svelte';\n</script>\n<AgentGenerativeSurface content={surfacePayload} />`
	},
	{
		slug: 'intelligent-ui-renderer',
		name: 'IntelligentUIRenderer',
		category: 'Intelligent UI & Generative',
		sveltePath: 'src/lib/intelligent-ui/IntelligentUIRenderer.svelte',
		upstreamSource: 'Dynamic Intelligent UI Engine',
		description: 'Declarative JSON-schema to Svelte 5 renderer that dynamically mounts registered agent & GitHub components.',
		usageSnippet: `<script lang="ts">\n  import { IntelligentUIRenderer } from 'agents-kit-svelte';\n</script>\n<IntelligentUIRenderer nodes={schemaNodes} onIntent={handleIntent} />`
	},

	// 5. Agents UI Orchestration
	{
		slug: 'agent-orchestrator',
		name: 'AgentOrchestrator',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentOrchestrator.svelte',
		upstreamSource: 'components/agents-ui/agent-orchestrator.tsx',
		description: 'Supervisor-to-subagent delegation graph with live handoff status and token budgets.',
		usageSnippet: `<script lang="ts">\n  import { AgentOrchestrator } from 'agents-kit-svelte';\n</script>\n<AgentOrchestrator />`
	},
	{
		slug: 'agent-parallel-processor',
		name: 'AgentParallelProcessor',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentParallelProcessor.svelte',
		upstreamSource: 'components/agents-ui/agent-parallel-processor.tsx',
		description: 'Multi-lane parallel worker pool monitor for concurrent worktree, test, and search jobs.',
		usageSnippet: `<script lang="ts">\n  import { AgentParallelProcessor } from 'agents-kit-svelte';\n</script>\n<AgentParallelProcessor />`
	},
	{
		slug: 'agent-sequential-workflow',
		name: 'AgentSequentialWorkflow',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentSequentialWorkflow.svelte',
		upstreamSource: 'components/agents-ui/agent-sequential-workflow.tsx',
		description: 'Step-by-step pipeline planner with gate dependencies, retry actions, and stage durations.',
		usageSnippet: `<script lang="ts">\n  import { AgentSequentialWorkflow } from 'agents-kit-svelte';\n</script>\n<AgentSequentialWorkflow />`
	},
	{
		slug: 'agent-routing-hub',
		name: 'AgentRoutingHub',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentRoutingHub.svelte',
		upstreamSource: 'components/agents-ui/agent-routing-hub.tsx',
		description: 'Intent classifier & agent router showing confidence scores across Claude Code, Codex, and Gemini.',
		usageSnippet: `<script lang="ts">\n  import { AgentRoutingHub } from 'agents-kit-svelte';\n</script>\n<AgentRoutingHub />`
	},
	{
		slug: 'agent-evaluator',
		name: 'AgentEvaluator',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentEvaluator.svelte',
		upstreamSource: 'components/agents-ui/agent-evaluator.tsx',
		description: 'Rubric-based evaluation & red-team referee scorecard with weighted criteria.',
		usageSnippet: `<script lang="ts">\n  import { AgentEvaluator } from 'agents-kit-svelte';\n</script>\n<AgentEvaluator />`
	},
	{
		slug: 'agent-ops-monitor',
		name: 'AgentOpsMonitor',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentOpsMonitor.svelte',
		upstreamSource: 'components/agents-ui/agent-ops-monitor.tsx',
		description: 'Live latency, token throughput, tool success rate, and Companion daemon health panel.',
		usageSnippet: `<script lang="ts">\n  import { AgentOpsMonitor } from 'agents-kit-svelte';\n</script>\n<AgentOpsMonitor />`
	},
	{
		slug: 'agent-task-queue',
		name: 'AgentTaskQueue',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentTaskQueue.svelte',
		upstreamSource: 'components/agents-ui/agent-task-queue.tsx',
		description: 'Prioritized agent run queue with pause, promote, and cancel controls.',
		usageSnippet: `<script lang="ts">\n  import { AgentTaskQueue } from 'agents-kit-svelte';\n</script>\n<AgentTaskQueue />`
	},
	{
		slug: 'agent-artifact',
		name: 'AgentArtifact',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentArtifact.svelte',
		upstreamSource: 'components/agents-ui/agent-artifact.tsx',
		description: 'Rich artifact viewer/editor with tabs for Preview, Markdown Source, Schema, and History.',
		usageSnippet: `<script lang="ts">\n  import { AgentArtifact } from 'agents-kit-svelte';\n</script>\n<AgentArtifact />`
	},
	{
		slug: 'agent-form-generator',
		name: 'AgentFormGenerator',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentFormGenerator.svelte',
		upstreamSource: 'components/agents-ui/agent-form-generator.tsx',
		description: 'Dynamic schema-to-form generator for structured agent tool inputs with live payload preview.',
		usageSnippet: `<script lang="ts">\n  import { AgentFormGenerator } from 'agents-kit-svelte';\n</script>\n<AgentFormGenerator />`
	},
	{
		slug: 'agent-tool-palette',
		name: 'AgentToolPalette',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentToolPalette.svelte',
		upstreamSource: 'components/agents-ui/agent-tool-palette.tsx',
		description: 'Interactive command & MCP tool palette with category filter and parameter preview.',
		usageSnippet: `<script lang="ts">\n  import { AgentToolPalette } from 'agents-kit-svelte';\n</script>\n<AgentToolPalette />`
	},
	{
		slug: 'agent-thinking-indicator',
		name: 'AgentThinkingIndicator',
		category: 'Agents UI Orchestration',
		sveltePath: 'src/lib/agents-ui/AgentThinkingIndicator.svelte',
		upstreamSource: 'components/agents-ui/agent-thinking-indicator.tsx',
		description: 'Multi-variant animated thinking indicator (wave, spin, stars, infinity, orbs).',
		usageSnippet: `<script lang="ts">\n  import { AgentThinkingIndicator } from 'agents-kit-svelte';\n</script>\n<AgentThinkingIndicator />`
	},

	// 6. AI Elements & Coding
	{
		slug: 'agent-context-meter',
		name: 'AgentContextMeter & AgentCheckpoint',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/runtime/{AgentContextMeter,AgentCheckpoint}.svelte',
		upstreamSource: 'components/agents-ui/agent-{context-meter,checkpoint}.tsx',
		description: 'Token window usage bar with expandable source breakdown plus worktree checkpoint restore card.',
		usageSnippet: `<script lang="ts">\n  import { AgentContextMeter, AgentCheckpoint } from 'agents-kit-svelte';\n</script>\n<AgentContextMeter usedTokens={48200} maxTokens={200000} />`
	},
	{
		slug: 'chain-of-thought',
		name: 'ChainOfThought',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/ChainOfThought.svelte',
		upstreamSource: 'components/ai-elements/chain-of-thought.tsx',
		description: 'Multi-step collapsible chain-of-thought reasoning trace with step durations and confidence.',
		usageSnippet: `<script lang="ts">\n  import { ChainOfThought } from 'agents-kit-svelte';\n</script>\n<ChainOfThought />`
	},
	{
		slug: 'stack-trace',
		name: 'StackTrace',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/StackTrace.svelte',
		upstreamSource: 'components/ai-elements/stack-trace.tsx',
		description: 'Interactive error stack trace viewer with highlighted source frame and Send to Agent action.',
		usageSnippet: `<script lang="ts">\n  import { StackTrace } from 'agents-kit-svelte';\n</script>\n<StackTrace />`
	},
	{
		slug: 'schema-display',
		name: 'SchemaDisplay',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/SchemaDisplay.svelte',
		upstreamSource: 'components/ai-elements/schema-display.tsx',
		description: 'Interactive HTTP/Tool schema inspector with expandable nested request/response properties.',
		usageSnippet: `<script lang="ts">\n  import { SchemaDisplay } from 'agents-kit-svelte';\n</script>\n<SchemaDisplay />`
	},
	{
		slug: 'environment-variables',
		name: 'EnvironmentVariables',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/EnvironmentVariables.svelte',
		upstreamSource: 'components/ai-elements/environment-variables.tsx',
		description: 'Masked .env and runtime configuration inspector with reveal toggles and scope badges.',
		usageSnippet: `<script lang="ts">\n  import { EnvironmentVariables } from 'agents-kit-svelte';\n</script>\n<EnvironmentVariables />`
	},
	{
		slug: 'package-info',
		name: 'PackageInfo',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/PackageInfo.svelte',
		upstreamSource: 'components/ai-elements/package-info.tsx',
		description: 'Package metadata card with version diff, dependencies, scripts, and verification status.',
		usageSnippet: `<script lang="ts">\n  import { PackageInfo } from 'agents-kit-svelte';\n</script>\n<PackageInfo />`
	},
	{
		slug: 'web-preview',
		name: 'WebPreview',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/WebPreview.svelte',
		upstreamSource: 'components/ai-elements/web-preview.tsx',
		description: 'Live web preview frame with URL bar, 390px/768px/1440px viewport switcher, and console drawer.',
		usageSnippet: `<script lang="ts">\n  import { WebPreview } from 'agents-kit-svelte';\n</script>\n<WebPreview />`
	},
	{
		slug: 'plan-card',
		name: 'PlanCard & PromptSuggestions',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/ai-elements/{PlanCard,PromptSuggestions}.svelte',
		upstreamSource: 'components/ai-elements/{plan,suggestion}.tsx',
		description: 'Structured agent execution plan card paired with categorized starter prompt pills.',
		usageSnippet: `<script lang="ts">\n  import { PlanCard, PromptSuggestions } from 'agents-kit-svelte';\n</script>\n<PlanCard />`
	},
	{
		slug: 'test-results-terminal',
		name: 'TestResults · Terminal · FileTree',
		category: 'AI Elements & Coding',
		sveltePath: 'src/lib/runtime/{TestResults,Terminal,FileTree}.svelte',
		upstreamSource: 'components/ai-elements/{test-results,terminal,file-tree}.tsx',
		description: 'Expandable test suite runner, live worktree terminal console, and accessible file tree.',
		usageSnippet: `<script lang="ts">\n  import { TestResults, Terminal, FileTree } from 'agents-kit-svelte';\n</script>\n<TestResults suites={suites} />`
	},

	// 7. Voice & Effects
	{
		slug: 'voice-wave-visualizer',
		name: 'VoiceWaveVisualizer',
		category: 'Voice & Effects',
		sveltePath: 'src/lib/ai-elements/VoiceWaveVisualizer.svelte',
		upstreamSource: 'components/voice-agents/session.tsx',
		description: 'Interactive voice session & 24-bar audio waveform visualizer with mic selector and live transcript.',
		usageSnippet: `<script lang="ts">\n  import { VoiceWaveVisualizer } from 'agents-kit-svelte';\n</script>\n<VoiceWaveVisualizer />`
	},
	{
		slug: 'border-beam',
		name: 'BorderBeam',
		category: 'Voice & Effects',
		sveltePath: 'src/lib/effects/BorderBeam.svelte',
		upstreamSource: 'components/effects/border-beam.tsx',
		description: 'Animated active-work border beam treatment for running agent cards.',
		usageSnippet: `<script lang="ts">\n  import { BorderBeam } from 'agents-kit-svelte';\n</script>\n<BorderBeam />`
	},
	{
		slug: 'svelte5-motion-lab',
		name: 'Svelte5MotionLab',
		category: 'Voice & Effects',
		sveltePath: 'src/lib/effects/Svelte5MotionLab.svelte',
		upstreamSource: 'Svelte 5 Motion, Crossfade & Reactivity Suite',
		description: 'Interactive Svelte 5 physics & microanimation playground showcasing Spring, Tween, crossfade (send/receive), animate:flip, SvelteSet, SvelteMap, and {#snippet}.',
		usageSnippet: `<script lang="ts">\n  import { Svelte5MotionLab } from 'agents-kit-svelte';\n</script>\n<Svelte5MotionLab />`
	}
];
