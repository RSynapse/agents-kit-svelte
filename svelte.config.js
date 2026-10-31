import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		alias: {
			// Site-only code (catalogue, demo scripts, audits). Never part of the package.
			$site: 'src/site'
		},
		paths: {
			base: process.env.BASE_PATH ?? ''
		}
	}
};

export default config;
