/**
 * Full flow regression test: focus-cycle + controls + counter continuity (T040).
 * Verifies all three user stories work together without regression.
 */

import { test, expect } from '@playwright/test';

test.describe('Full flow regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#mode-label');
  });

  test('complete app renders all required UI elements', async ({ page }) => {
    await expect(page.locator('#mode-label')).toBeVisible();
    await expect(page.locator('#time-display')).toBeVisible();
    await expect(page.locator('#start-btn')).toBeVisible();
    await expect(page.locator('#pause-btn')).toBeVisible();
    await expect(page.locator('#reset-btn')).toBeVisible();
    await expect(page.locator('#daily-counter')).toBeVisible();
  });

  test('start → pause → reset cycle does not break the app', async ({ page }) => {
    await page.click('#start-btn');
    await page.waitForTimeout(1200);
    await page.click('#pause-btn');
    await page.click('#reset-btn');

    await expect(page.locator('#time-display')).toHaveText('25:00');
    await expect(page.locator('#mode-label')).toHaveText('Focus');
    await expect(page.locator('#daily-counter')).toHaveText('0');
  });

  test('reset after start maintains correct mode', async ({ page }) => {
    await page.click('#start-btn');
    await page.waitForTimeout(500);
    await page.click('#reset-btn');
    await expect(page.locator('#mode-label')).toHaveText('Focus');
  });
});
