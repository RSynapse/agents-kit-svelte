import assert from 'node:assert/strict';
import test from 'node:test';
import {
	computeContextMeter,
	isImeComposing,
	parseUnifiedDiff,
	summarizeActivity,
	summarizeTodos,
	validateSvelte5ComponentSource
} from '../src/lib/state/chat-helpers.ts';

test('parseUnifiedDiff parses hunk headers, line numbers, additions and deletions', () => {
	const patch = [
		'@@ -18,4 +18,6 @@ export async function verifyCallback(url: URL) {',
		'   const code = url.searchParams.get("code");',
		'-  return redirect(302, "/login");',
		'+  const next = sanitizeReturnTo(url.searchParams.get("next"));',
		'+  if (!code) return redirect(303, "/login?error=missing_code");',
		'+  return redirect(303, next);',
		' }'
	].join('\n');

	const parsed = parseUnifiedDiff(patch);
	assert.equal(parsed.additions, 3);
	assert.equal(parsed.deletions, 1);
	assert.equal(parsed.lines.length, 7);
	assert.equal(parsed.lines[0]?.kind, 'hunk');
	assert.deepEqual(
		parsed.lines.slice(1).map((line) => ({
			kind: line.kind,
			oldNumber: line.oldNumber,
			newNumber: line.newNumber
		})),
		[
			{ kind: 'context', oldNumber: 18, newNumber: 18 },
			{ kind: 'delete', oldNumber: 19, newNumber: undefined },
			{ kind: 'add', oldNumber: undefined, newNumber: 19 },
			{ kind: 'add', oldNumber: undefined, newNumber: 20 },
			{ kind: 'add', oldNumber: undefined, newNumber: 21 },
			{ kind: 'context', oldNumber: 20, newNumber: 22 }
		]
	);
});

test('summarizeActivity produces Claude Code style titles for thinking, tools, searches and mixed steps', () => {
	assert.equal(
		summarizeActivity([{ id: '1', type: 'text', label: 'Inspecting callback route' }], 'working'),
		'Working'
	);
	assert.equal(
		summarizeActivity([{ id: '1', type: 'text', label: 'Inspecting callback route' }], 'complete', 6),
		'Thought for 6s'
	);
	assert.equal(
		summarizeActivity(
			[
				{ id: '1', type: 'tool', label: 'Read', target: 'src/auth/callback.ts', status: 'complete' },
				{ id: '2', type: 'tool', label: 'Edit', target: 'src/auth/callback.ts', status: 'complete' }
			],
			'complete'
		),
		'Ran 2 tools'
	);
	assert.equal(
		summarizeActivity(
			[
				{ id: '1', type: 'text', label: 'Planned redirect fix' },
				{ id: '2', type: 'tool', label: 'Edit', target: 'src/auth/callback.ts', status: 'complete' },
				{ id: '3', type: 'search', label: 'Searched OAuth PKCE callback specs', status: 'complete' }
			],
			'complete'
		),
		'Completed 3 steps'
	);
});

test('summarizeTodos computes completion counts and active in-progress item', () => {
	const summary = summarizeTodos([
		{ id: '1', label: 'Inspect auth callback route', status: 'completed' },
		{ id: '2', label: 'Patch sanitizeReturnTo helper', status: 'in-progress' },
		{ id: '3', label: 'Run Playwright redirect suite', status: 'pending' }
	]);

	assert.equal(summary.completedCount, 1);
	assert.equal(summary.totalCount, 3);
	assert.equal(summary.allCompleted, false);
	assert.equal(summary.inProgressItem?.id, '2');
	assert.equal(summary.progressPercent, 33);
});

test('isImeComposing detects composition state and keyCode 229 fallback', () => {
	assert.equal(isImeComposing({ isComposing: true, keyCode: 13 }), true);
	assert.equal(isImeComposing({ isComposing: false, keyCode: 229 }), true);
	assert.equal(isImeComposing({ isComposing: false, keyCode: 13 }), false);
});

test('computeContextMeter calculates token ratios, compact labels and semantic warning/danger tones', () => {
	const normal = computeContextMeter(42_500, 200_000);
	assert.equal(normal.percent, 21);
	assert.equal(normal.formattedUsed, '42.5k');
	assert.equal(normal.formattedMax, '200k');
	assert.equal(normal.tone, 'normal');

	const warning = computeContextMeter(156_000, 200_000);
	assert.equal(warning.tone, 'warning');

	const danger = computeContextMeter(188_000, 200_000);
	assert.equal(danger.tone, 'danger');
});

test('validateSvelte5ComponentSource rejects legacy Svelte 4 syntax and hardcoded hex values', () => {
	const validSvelte5 = `<script lang="ts">
		interface Props {
			label: string;
		}
		let { label }: Props = $props();
		let open = $state(false);
		let summary = $derived(open ? label : 'Closed');
	</script>
	<button type="button" class="bg-card-bg text-fg-main border-card-border">{summary}</button>`;

	assert.deepEqual(validateSvelte5ComponentSource(validSvelte5), []);

	const invalidSvelte4AndHex = `<script lang="ts">
		export let label = 'test';
		$: summary = label;
	</script>
	<div style="color: #0f172a">{summary}</div>`;

	const violations = validateSvelte5ComponentSource(invalidSvelte4AndHex);
	assert.equal(violations.length, 3);
});
