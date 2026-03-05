/**
 * Playwright integration test for control interactions (T027, US2).
 * Tests Start, Pause, and Reset button behavior in the browser.
 */

import { test, expect } from '@playwright/test';

test.describe('Timer controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#start-btn');
  });

  test('Start button begins countdown', async ({ page }) => {
    await page.click('#start-btn');
    await page.waitForTimeout(1200);
    const time = await page.locator('#time-display').textContent();
    expect(time).not.toBe('25:00');
  });

  test('Pause button stops countdown', async ({ page }) => {
    await page.click('#start-btn');
    await page.waitForTimeout(1200);
    await page.click('#pause-btn');

    const timePaused = await page.locator('#time-display').textContent();
    await page.waitForTimeout(2000);
    const timeAfterWait = await page.locator('#time-display').textContent();

    expect(timePaused).toBe(timeAfterWait);
  });

  test('Reset button restores to full duration', async ({ page }) => {
    await page.click('#start-btn');
    await page.waitForTimeout(2000);
    await page.click('#reset-btn');
    await expect(page.locator('#time-display')).toHaveText('25:00');
  });

  test('Start is disabled when running', async ({ page }) => {
    await page.click('#start-btn');
    await expect(page.locator('#start-btn')).toBeDisabled();
  });

  test('Pause is disabled when not running', async ({ page }) => {
    await expect(page.locator('#pause-btn')).toBeDisabled();
  });
});
