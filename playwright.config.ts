import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/browser',
	fullyParallel: true,
	timeout: 30000,
	use: {
		baseURL: 'http://127.0.0.1:5188',
		trace: 'on-first-retry'
	},
	webServer: {
		command: 'corepack pnpm dev',
		url: 'http://127.0.0.1:5188',
		reuseExistingServer: true,
		timeout: 30000
	}
});
