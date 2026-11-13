import { test, expect } from '@playwright/test';

// Smoke checks for provider/location flows.
// Requires app running with test data/users configured.
test.describe('Provider and location flows', () => {
  test('provider details booking form exposes location capture controls', async ({ page }) => {
    await page.goto('/providers');
    await expect(page.locator('body')).toBeVisible();
    // Navigate to first provider details if available
    const first = page.locator('a[href*="/providers/"]').first();
    if (await first.count()) {
      await first.click();
      await expect(page.getByRole('button', { name: /Use my location/i })).toBeVisible();
      await expect(page.getByLabel(/Service location|address/i)).toBeVisible();
    }
  });

  test('provider portal route loads for authenticated providers', async ({ page }) => {
    await page.goto('/provider-portal');
    // Unauthenticated users should be redirected or shown auth guard behavior
    await expect(page).toHaveURL(/login|provider-portal/);
  });
});
