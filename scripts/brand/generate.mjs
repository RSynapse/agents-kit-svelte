// Regenerates the favicon PNGs, favicon.ico and the social share card in static/.
// Usage: node scripts/brand/generate.mjs   (needs the Playwright Chromium and network for Google Fonts)
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const staticDir = `${root}static/`;
const markSvg = await readFile(`${staticDir}favicon.svg`, 'utf8');
const markInner = markSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// Full-bleed square for iOS and maskable icons: terracotta fill with the sparkle at a safe-zone scale.
const squareSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#be552e"/>${markInner
	.replace(/<circle[^>]*\/>/, '')
	.replace('scale(0.86)', 'scale(0.7)')}</svg>`;

const browser = await chromium.launch();
const page = await browser.newPage();

async function renderSvg(svg, size, file) {
	await page.setViewportSize({ width: size, height: size });
	await page.setContent(
		`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`
	);
	return page.screenshot({ path: file ? `${staticDir}${file}` : undefined, omitBackground: true });
}

const ico16 = await renderSvg(markSvg, 16);
const ico32 = await renderSvg(markSvg, 32);
const ico48 = await renderSvg(markSvg, 48);
await renderSvg(markSvg, 192, 'icon-192.png');
await renderSvg(markSvg, 512, 'icon-512.png');
await renderSvg(squareSvg, 512, 'icon-maskable-512.png');
await renderSvg(squareSvg, 180, 'apple-touch-icon.png');

// favicon.ico with embedded PNG frames (supported by every current browser).
const frames = [
	[16, ico16],
	[32, ico32],
	[48, ico48]
];
const header = Buffer.alloc(6 + 16 * frames.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(frames.length, 4);
let offset = header.length;
frames.forEach(([size, png], i) => {
	const o = 6 + 16 * i;
	header.writeUInt8(size, o);
	header.writeUInt8(size, o + 1);
	header.writeUInt16LE(1, o + 4);
	header.writeUInt16LE(32, o + 6);
	header.writeUInt32LE(png.length, o + 8);
	header.writeUInt32LE(offset, o + 12);
	offset += png.length;
});
await writeFile(`${staticDir}favicon.ico`, Buffer.concat([header, ...frames.map(([, png]) => png)]));

// 1200x630 Open Graph / X card.
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto(new URL('./og-card.html', import.meta.url).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${staticDir}og-image.png` });

await browser.close();
console.log('Brand assets written to static/');
