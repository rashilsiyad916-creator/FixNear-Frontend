import { test, expect } from '@playwright/test';

test('Home Nursing provider is visible in UI', async ({ page }) => {
  await page.goto('http://localhost:4200/providers?category=Home%20Nursing', { waitUntil: 'networkidle' });
  await expect(page.getByText('CareAtHome Nursing Services')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Home Nurse Visit & Patient Care')).toBeVisible();
  await page.screenshot({ path: '../.playwright-home-nursing.png', fullPage: true }).catch(() => {});
});

test('Home Nursing quick category pill exists on providers page', async ({ page }) => {
  await page.goto('http://localhost:4200/providers', { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: /Home Nursing/i })).toBeVisible({ timeout: 15000 });
});
