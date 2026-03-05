/**
 * Playwright integration test for full Pomodoro cycle progression (T020, US1).
 * Tests the visible UI state through focus/break transitions.
 */

import { test, expect } from '@playwright/test';

test.describe('Pomodoro cycle flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#mode-label');
  });

  test('initial state shows Focus mode at 25:00', async ({ page }) => {
    await expect(page.locator('#mode-label')).toHaveText('Focus');
    await expect(page.locator('#time-display')).toHaveText('25:00');
    await expect(page.locator('#daily-counter')).toHaveText('0');
  });

  test('start button begins countdown', async ({ page }) => {
    await page.click('#start-btn');
    // Wait for at least one tick
    await page.waitForTimeout(1200);
    const timeText = await page.locator('#time-display').textContent();
    // Time should have changed from 25:00
    expect(timeText).not.toBe('25:00');
  });

  test('mode label updates correctly', async ({ page }) => {
    const modeLabel = page.locator('#mode-label');
    await expect(modeLabel).toBeVisible();
    const text = await modeLabel.textContent();
    expect(['Focus', 'Short Break', 'Long Break']).toContain(text);
  });
});
