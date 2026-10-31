<script lang="ts">
	import { page } from '$app/state';

	// Social previews need absolute URLs. Override with VITE_SITE_URL when deploying somewhere else.
	const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://rsynapse.github.io/agents-kit-svelte').replace(/\/+$/, '');
	const SITE_NAME = 'Agents Kit Svelte';
	const DEFAULT_DESCRIPTION =
		'Svelte 5 components for AI agent interfaces: chat, tool approvals, plans, GitHub cards, skills and generative UI.';

	const PAGES: Record<string, { title: string; description: string }> = {
		'/': {
			title: 'Agents Kit Svelte · Interface pieces for AI agents',
			description: DEFAULT_DESCRIPTION
		},
		'/claude-code/': {
			title: 'AK-S Chat · Agents Kit Svelte',
			description: 'A complete agent chat for Svelte 5 with streaming replies, plans, tool approvals, diffs and a slash-command composer.'
		},
		'/github/': {
			title: 'GitHub Suite · Agents Kit Svelte',
			description: 'Issue, pull request, commit, checks and review cards with Kanban and bento layouts, built with Svelte 5 Runes.'
		},
		'/skills/': {
			title: 'Skills studio · Agents Kit Svelte',
			description: 'Browse, route, edit and propose agent skills with Svelte 5 components for skill libraries and SKILL.md editing.'
		},
		'/intelligent-ui/': {
			title: 'Playground · Agents Kit Svelte',
			description: 'Turn a JSON schema into live Svelte UI, then edit, compare and export generated agent surfaces.'
		}
	};

	// Route ids are base-path free, so this works for local dev and the GitHub Pages subpath alike.
	const path = $derived(!page.route.id || page.route.id === '/' ? '/' : `${page.route.id}/`);
	const meta = $derived(PAGES[path] ?? { title: SITE_NAME, description: DEFAULT_DESCRIPTION });
	const url = $derived(`${SITE_URL}${path}`);
	const image = `${SITE_URL}/og-image.png`;
	const imageAlt =
		'Agents Kit Svelte: interface pieces for AI agents, made for Svelte 5. Shows an agent chat with a plan and a command approval card.';
</script>

<svelte:head>
	<meta name="description" content={meta.description} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />
	<meta property="og:image:secure_url" content={image} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={imageAlt} />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:image:alt" content={imageAlt} />
</svelte:head>
