import { expect, test } from '../toy-app/node_modules/@playwright/test';

test('focus-cycle, controls, and daily counter stay consistent across transitions', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __POMODORO_TEST_DURATIONS__?: Record<string, number> }).__POMODORO_TEST_DURATIONS__ = {
      focus: 2,
      shortBreak: 1,
      longBreak: 1,
    };
  });

  await page.goto('/');

  const start = page.getByTestId('start-button');
  const pause = page.getByTestId('pause-button');
  const mode = page.getByTestId('mode-label');
  const time = page.getByTestId('time-display');
  const counter = page.getByTestId('daily-counter');

  await expect(mode).toHaveText('Focus');
  await expect(time).toHaveText('00:02');
  await expect(counter).toHaveText('0');

  await start.click();
  await page.waitForTimeout(1100);
  await pause.click();
  const pausedValue = await time.textContent();

  await page.waitForTimeout(1100);
  await expect(time).toHaveText(pausedValue ?? '00:01');

  await start.click();
  await expect(mode).toHaveText('Short Break');
  await expect(counter).toHaveText('1');

  await start.click();
  await expect(mode).toHaveText('Focus');
  await expect(counter).toHaveText('1');
});
