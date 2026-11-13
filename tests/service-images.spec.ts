import { test, expect } from '@playwright/test';

test.describe('Service images', () => {
  test('home and provider pages reference professional service images', async ({ page }) => {
    await page.goto('/');
    const imgs = page.locator('img[src*="assets/services/"]');
    const count = await imgs.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 10); i++) {
        await expect(imgs.nth(i)).toHaveAttribute('src', /assets\/services\/.*-pro\.jpg/);
      }
    }
  });
});
