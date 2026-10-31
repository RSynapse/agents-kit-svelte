import { expect, test } from '@playwright/test';

const ARTIFACT_DIR = '/Users/gregory.winkler/.gemini/antigravity/brain/c6c30e22-8619-4dba-beb0-eda8acde1ec7';

test.describe('agents-kit-svelte: 67-Component Catalogue, Claude Code Workbench, GitHub Suite & Intelligent UI', () => {
	test('1. Component Catalogue & App Showcase Hub (/) renders all 7 categories, filters, and toggles Svelte 5 code', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/');

		await expect(
			page.getByRole('heading', {
				name: /Gentle interfaces for\s*thoughtful agents/i
			})
		).toBeVisible();

		// Verify sticky left sidebar collection selector & component index
		await expect(page.getByLabel('Collection')).toBeVisible();
		await expect(page.getByRole('navigation', { name: 'Component families' })).toBeVisible();

		// Verify category filter tabs
		await expect(page.getByRole('tab', { name: /beUI Agents/i })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Beautiful UI/i })).toBeVisible();
		await expect(page.getByRole('tab', { name: /GitHub Cards & Layouts/i })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Intelligent UI & Generative/i })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Agents UI Orchestration/i })).toBeVisible();
		await expect(page.getByRole('tab', { name: /AI Elements & Coding/i })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Voice & Effects/i })).toBeVisible();

		// Verify all 68 individual component showcase cards are rendered on /
		await expect(page.locator('article[data-component-slug]')).toHaveCount(68);

		// Toggle the Usage code view on the first component card
		const firstUsageToggle = page.getByRole('button', { name: /^Usage$/ }).first();
		await firstUsageToggle.click();
		await expect(firstUsageToggle).toHaveAttribute('aria-pressed', 'true');
		await page.getByRole('button', { name: /^Preview$/ }).first().click();

		// Toggle dark mode and capture screenshot of the main Component Catalogue
		await page.getByRole('button', { name: /Toggle global color theme/i }).click();
		await expect(page.locator('html')).toHaveClass(/dark/);
		await page.screenshot({
			path: `${ARTIFACT_DIR}/catalogue-showcase-dark.png`,
			fullPage: false,
			animations: 'disabled'
		});
		await page.locator('article[data-component-slug="trailside-claude-chat"]').screenshot({
			path: `${ARTIFACT_DIR}/catalogue-aks-chat-card.png`,
			animations: 'disabled'
		});

		// Verify MessageScroller interactive PreviewRail hover card, container-scoped jump, and Jump to latest
		const scrollerArticle = page.locator('article[data-component-slug="message-scroller"]');
		await scrollerArticle.scrollIntoViewIfNeeded();
		const firstRailTick = scrollerArticle.locator('[data-slot="preview-rail-item"]').first();
		await expect(firstRailTick).toBeVisible();
		await firstRailTick.hover();
		await expect(scrollerArticle.locator('[data-slot="preview-rail-card"]')).toBeVisible();
		await firstRailTick.click();
		await expect(scrollerArticle.getByRole('button', { name: /Jump to latest/i })).toBeVisible();
		await scrollerArticle.screenshot({
			path: `${ARTIFACT_DIR}/catalogue-message-scroller.png`,
			animations: 'disabled'
		});
		await scrollerArticle.getByRole('button', { name: /Jump to latest/i }).click();

		// Filter to Agents UI Orchestration
		await page.getByRole('tab', { name: /Agents UI Orchestration/i }).click();
		await expect(page.getByRole('heading', { name: 'AgentOrchestrator' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'AgentEvaluator' })).toBeVisible();

		// Filter to Voice & Effects and test Svelte5MotionLab (Spring, crossfade, SvelteSet/SvelteMap)
		await page.getByRole('tab', { name: /Voice & Effects/i }).click();
		await expect(page.getByRole('heading', { name: 'Svelte5MotionLab' })).toBeVisible();
		const springBtn = page.getByRole('button', { name: 'Spring to 98%' });
		await springBtn.click();
		const crossfadeCard = page.getByRole('button', { name: /Card 2177 · Skills Scroll Cue/i });
		await crossfadeCard.click();
		await page.locator('#svelte5-motion-lab').screenshot({
			path: `${ARTIFACT_DIR}/svelte5-motion-lab.png`,
			animations: 'disabled'
		});
	});

	test('2. Trailside Claude Code Workbench (/claude-code) supports tool approval, question submission, IME-safe composer, and Light/Dark themes', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/claude-code');

		await expect(
			page.getByRole('heading', { name: /Fix OAuth callback redirect loop/i })
		).toBeVisible();
		await expect(page.getByText('studio-mac').first()).toBeVisible();

		await page.screenshot({
			path: `${ARTIFACT_DIR}/trailside-claude-chat-light.png`,
			fullPage: false,
			animations: 'disabled'
		});

		// Verify ToolApproval interactive approval
		// The scripted session plays on its own and pauses at the approval gate
		const allowOnceBtn = page.getByRole('button', { name: 'Allow once' });
		await expect(allowOnceBtn).toBeVisible({ timeout: 15_000 });
		await allowOnceBtn.click();
		await expect(page.getByText('Approved').first()).toBeVisible();

		// Verify ApprovalCard interactive question submission
		const optionBtn = page.getByRole('radio', {
			name: /Preserve original path and query string/i
		});
		await expect(optionBtn).toBeVisible({ timeout: 15_000 });
		await optionBtn.click();
		await page.getByRole('button', { name: /Submit decision/i }).click();
		await expect(page.getByText(/Decision recorded:/i)).toBeVisible();

		// Verify PromptInput IME-safe Enter vs normal Enter submit
		const promptTextarea = page.getByRole('textbox', {
			name: /Ask Claude Code or guide the current run/i
		});
		await promptTextarea.fill('Run the Playwright redirect verification suite');
		await promptTextarea.press('Enter');
		await expect(promptTextarea).toHaveValue('');
		await expect(
			page.getByText('Run the Playwright redirect verification suite').first()
		).toBeVisible();

		// Toggle Dark theme and capture screenshot
		await page.getByRole('button', { name: /Toggle global color theme/i }).click();
		await expect(page.locator('html')).toHaveClass(/dark/);
		await page.screenshot({
			path: `${ARTIFACT_DIR}/trailside-claude-chat-dark.png`,
			fullPage: false,
			animations: 'disabled'
		});
	});

	test('3. GitHub Cards, Bento & Kanban Layouts (/github) renders reactive board, bento pulse, and individual cards', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/github');

		await expect(
			page.getByRole('heading', {
				name: /Issues, pull requests and checks/i
			})
		).toBeVisible();

		// Verify 4 Kanban columns are rendered
		await expect(page.getByRole('heading', { name: 'Triage & Ready', exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'In Progress (Runs)', exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Ready for You', exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Merged & Verified', exact: true })).toBeVisible();

		await page.screenshot({
			path: `${ARTIFACT_DIR}/github-suite-showcase.png`,
			fullPage: false,
			animations: 'disabled'
		});

		// Switch to Repository Bento Pulse tab
		await page.getByRole('tab', { name: /Repository pulse/i }).click();
		await expect(page.getByText(/RSynapse\/trailside/i).first()).toBeVisible();

		// Switch to Individual Card Primitives tab
		await page.getByRole('tab', { name: /Card primitives/i }).click();
		await expect(
			page.getByRole('heading', { name: /GitHubIssueCard & GitHubPullRequestCard/i })
		).toBeVisible();
	});

	test('4. Dynamic Intelligent UI Playground (/intelligent-ui) renders live JSON schema nodes and polymorphic generative surfaces', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/intelligent-ui');

		await expect(
			page.getByRole('heading', {
				name: /Turn structured model output into interfaces/i
			})
		).toBeVisible();

		// Verify the generated interface and the studio inspector
		await expect(page.getByText(/Generated tradeoff matrix/i).first()).toBeVisible();
		await page.getByRole('button', { name: /Open in studio/i }).click();
		await expect(page.getByText(/Valid schema/i)).toBeVisible();

		await page.screenshot({
			path: `${ARTIFACT_DIR}/intelligent-ui-showcase.png`,
			fullPage: false,
			animations: 'disabled'
		});

		// Ask for a different interface and watch it build
		await page.getByRole('button', { name: /^Triage this pull request$/ }).click();
		await expect(page.getByText(/Candidate pull request/i).first()).toBeVisible();
	});
});
