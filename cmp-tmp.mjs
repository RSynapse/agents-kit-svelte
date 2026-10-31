import { chromium } from '@playwright/test';
const browser = await chromium.launch();
for (const port of [5188, 5299]) {
  for (const [name, path] of [['github-lifecycle','/github/'],['home','/']]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}${path}`); await page.waitForTimeout(2500);
    if (name === 'home') { await page.getByRole('tab', { name: /GitHub Cards/ }).click(); await page.waitForTimeout(1500); }
    await page.screenshot({ path: `/tmp/cmp/${name}-${port}.png`, fullPage: true }); await ctx.close();
  }
}
await browser.close();
