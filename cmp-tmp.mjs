import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const res = {};
for (const port of [5188, 5299]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/`); await page.waitForTimeout(3000);
  res[port] = await page.$$eval('article[data-component-slug]', (els) => els.map((e) => [e.dataset.componentSlug, Math.round(e.getBoundingClientRect().height), e.innerText.length]));
  await ctx.close();
}
const b = Object.fromEntries(res[5299].map(([s, h, t]) => [s, [h, t]]));
for (const [s, h, t] of res[5188]) if (!b[s] || b[s][0] !== h || Math.abs(b[s][1] - t) > 3) console.log(s, 'new', h, t, 'base', b[s]);
await browser.close();
