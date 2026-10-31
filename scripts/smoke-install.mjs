// End-to-end install check: packs the library exactly as npm would ship it, installs the
// tarball into a brand-new Vite + Svelte 5 + Tailwind v4 app with npm, then type-checks and
// builds that app. Fails if the published files, exports, types or theme are broken.
//
//   node scripts/smoke-install.mjs            (runs `pnpm package` first)
//   node scripts/smoke-install.mjs --keep     (leave the temp app on disk for inspection)
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const keep = process.argv.includes('--keep');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const dev = pkg.devDependencies;

const run = (cmd, cwd) => {
	console.log(`\n$ ${cmd}`);
	execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, CI: 'true' } });
};

const work = mkdtempSync(join(tmpdir(), 'aks-smoke-'));
const app = join(work, 'app');
mkdirSync(join(app, 'src'), { recursive: true });

try {
	run('corepack pnpm package', root);
	run(`corepack pnpm pack --pack-destination "${work}"`, root);
	const tarball = readdirSync(work).find((f) => f.endsWith('.tgz'));
	if (!tarball) throw new Error('pnpm pack produced no tarball');

	const files = {
		'package.json': JSON.stringify(
			{
				name: 'aks-smoke-app',
				private: true,
				type: 'module',
				scripts: { build: 'vite build', check: 'svelte-check --fail-on-warnings' },
				dependencies: { 'agents-kit-svelte': `file:../${tarball}` },
				devDependencies: {
					svelte: dev.svelte,
					vite: dev.vite,
					'@sveltejs/vite-plugin-svelte': dev['@sveltejs/vite-plugin-svelte'],
					tailwindcss: dev.tailwindcss,
					'@tailwindcss/vite': dev['@tailwindcss/vite'],
					'svelte-check': dev['svelte-check'],
					typescript: dev.typescript
				}
			},
			null,
			2
		),
		'vite.config.js': `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [tailwindcss(), svelte()] });
`,
		'svelte.config.js': `export default {};\n`,
		'tsconfig.json': JSON.stringify(
			{
				compilerOptions: {
					target: 'ES2022',
					module: 'ESNext',
					moduleResolution: 'bundler',
					strict: true,
					skipLibCheck: false,
					noEmit: true,
					verbatimModuleSyntax: true,
					types: ['svelte', 'vite/client']
				},
				include: ['src/**/*']
			},
			null,
			2
		),
		'index.html': `<!doctype html><html><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>\n`,
		'src/app.css': `@import "tailwindcss";
@import "agents-kit-svelte/theme.css";
@source "../node_modules/agents-kit-svelte/dist";
`,
		'src/main.ts': `import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
mount(App, { target: document.getElementById('app')! });
`,
		'src/App.svelte': `<script lang="ts">
	import {
		CodeBlock,
		GitHubIssueCard,
		ThinkingShimmer,
		TodoList,
		TrailsideClaudeChat,
		type TodoItem
	} from 'agents-kit-svelte';

	const items: TodoItem[] = [
		{ id: '1', label: 'Install agents-kit-svelte', status: 'completed' },
		{ id: '2', label: 'Render a component', status: 'in-progress' }
	];
</script>

<main class="bg-canvas-primary text-fg-main p-6">
	<ThinkingShimmer label="Thinking…" />
	<TodoList {items} />
	<CodeBlock code="pnpm add agents-kit-svelte" language="bash" />
	<GitHubIssueCard compact />
	<TrailsideClaudeChat />
</main>
`
	};
	for (const [name, content] of Object.entries(files)) writeFileSync(join(app, name), content);

	run('npm install --no-audit --no-fund --loglevel=error', app);
	run('npm run check', app);
	run('npm run build', app);

	const assets = join(app, 'dist', 'assets');
	const css = readdirSync(assets)
		.filter((f) => f.endsWith('.css'))
		.map((f) => readFileSync(join(assets, f), 'utf8'))
		.join('\n');
	const expected = ['--color-canvas-primary-val', '.bg-card-bg', '.text-fg-main', '.ak-shimmer-text'];
	const missing = expected.filter((needle) => !css.includes(needle));
	if (missing.length) throw new Error(`Built CSS is missing: ${missing.join(', ')}`);

	console.log('\n✔ agents-kit-svelte installs, type-checks and builds in a fresh Svelte 5 + Tailwind v4 app.');
} finally {
	if (keep) console.log(`Temp app kept at ${app}`);
	else rmSync(work, { recursive: true, force: true });
}
