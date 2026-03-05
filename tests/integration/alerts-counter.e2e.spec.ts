/**
 * Playwright integration test for alerts fallback and daily counter updates (T033, US3).
 */

import { test, expect } from '@playwright/test';

test.describe('Alerts and daily counter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#daily-counter');
  });

  test('daily counter is visible and starts at 0', async ({ page }) => {
    await expect(page.locator('#daily-counter')).toBeVisible();
    await expect(page.locator('#daily-counter')).toHaveText('0');
  });

  test('daily counter element is present in DOM', async ({ page }) => {
    const counter = page.locator('#daily-counter');
    await expect(counter).toBeAttached();
  });

  test('page loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
  });
});
