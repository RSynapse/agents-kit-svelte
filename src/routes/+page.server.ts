import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CATALOG_ITEMS } from '$lib/state/catalog-registry';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rootDir = process.cwd();
	const componentSources: Record<string, string> = {};

	for (const item of CATALOG_ITEMS) {
		try {
			const absPath = join(rootDir, item.sveltePath);
			componentSources[item.slug] = readFileSync(absPath, 'utf8');
		} catch {
			componentSources[item.slug] = item.usageSnippet;
		}
	}

	return {
		componentSources
	};
};
