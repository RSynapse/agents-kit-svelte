import { expect, test } from '@playwright/test';

test.describe('Trailside Dynamic Claude Code Chat & agents-kit Svelte 5 port', () => {
	test('renders Trailside run context, Claude Code inline primitives, and interactive flows', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/');

		// 1. Verify Trailside Run Context header & AgentContextMeter
		await expect(page.getByRole('heading', { name: /Fix OAuth callback redirect loop/i })).toBeVisible();
		await expect(page.getByText('studio-mac').first()).toBeVisible();
		await expect(page.getByText('trailside/1210-auth-redirect').first()).toBeVisible();
		await expect(page.getByRole('button', { name: /Context window/i })).toBeVisible();

		await page.screenshot({
			path: '/Users/gregory.winkler/.gemini/antigravity/brain/c6c30e22-8619-4dba-beb0-eda8acde1ec7/trailside-claude-chat-light.png',
			fullPage: false,
			animations: 'disabled'
		});

		// 2. Verify AgentActivity collapsible disclosure
		const activityToggle = page.getByRole('button', { name: /Completed 4 steps/i });
		await expect(activityToggle).toBeVisible();
		await expect(activityToggle).toHaveAttribute('aria-expanded', 'true');
		await expect(page.getByText('apps/web/src/routes/auth/callback/+server.ts').first()).toBeVisible();

		// 3. Verify TodoList collapsible plan
		const todoToggle = page.getByRole('button', { name: /Implementation plan/i });
		await expect(todoToggle).toBeVisible();
		await expect(page.getByText('2/4')).toBeVisible();

		// 4. Verify FileDiff unified diff viewer
		await expect(page.getByText('+3').first()).toBeVisible();
		await expect(page.getByText('-1').first()).toBeVisible();

		// 5. Verify ToolApproval interactive approval -> transitions to Approved & shows ToolResult
		const allowOnceBtn = page.getByRole('button', { name: 'Allow once' });
		await expect(allowOnceBtn).toBeVisible();
		await allowOnceBtn.click();
		await expect(page.getByText('Approved').first()).toBeVisible();

		// 6. Verify ApprovalCard interactive question submission
		const optionBtn = page.getByRole('radio', {
			name: /Preserve original path and query string/i
		});
		await expect(optionBtn).toBeVisible();
		await optionBtn.click();
		const submitAnswerBtn = page.getByRole('button', { name: /Submit decision/i });
		await submitAnswerBtn.click();
		await expect(page.getByText(/Decision recorded:/i)).toBeVisible();

		// 7. Verify PromptInput IME-safe Enter vs normal Enter submit
		const promptTextarea = page.getByRole('textbox', {
			name: /Ask Claude Code or guide the current run/i
		});
		await expect(promptTextarea).toBeVisible();
		await promptTextarea.fill('Run the Playwright redirect verification suite');

		// Dispatch composing Enter (keyCode 229) - should NOT submit
		await promptTextarea.evaluate((el) => {
			const evt = new KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true,
				cancelable: true,
				isComposing: true
			});
			el.dispatchEvent(evt);
		});
		await expect(promptTextarea).toHaveValue('Run the Playwright redirect verification suite');

		// Normal Enter - SHOULD submit and append user message + agent response
		await promptTextarea.press('Enter');
		await expect(promptTextarea).toHaveValue('');
		await expect(
			page.getByText('Run the Playwright redirect verification suite').first()
		).toBeVisible();

		// 8. Verify Workspace View tabs (Changes, Checks & Terminal, Component Catalog) & Dark Mode toggle
		await page.getByRole('tab', { name: /Checks & Terminal/i }).click();
		await expect(page.getByText(/4 passed/i).first()).toBeVisible();

		await page.getByRole('tab', { name: /Component Catalog/i }).click();
		await expect(
			page.getByRole('heading', { name: /agents-kit to Svelte 5 Port & Evaluation/i })
		).toBeVisible();

		const themeBtn = page.getByRole('button', { name: /Toggle color theme/i });
		await themeBtn.click();
		await expect(page.locator('html')).toHaveClass(/dark/);

		await page.getByRole('tab', { name: /Claude Code Chat/i }).click();
		await page.screenshot({
			path: '/Users/gregory.winkler/.gemini/antigravity/brain/c6c30e22-8619-4dba-beb0-eda8acde1ec7/trailside-claude-chat-dark.png',
			fullPage: false,
			animations: 'disabled'
		});
	});
});
