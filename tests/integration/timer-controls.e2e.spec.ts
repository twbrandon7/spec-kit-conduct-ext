import { expect, test } from '../toy-app/node_modules/@playwright/test';

test('start pause reset controls work deterministically', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __POMODORO_TEST_DURATIONS__?: Record<string, number> }).__POMODORO_TEST_DURATIONS__ = {
      focus: 4,
      shortBreak: 1,
      longBreak: 1,
    };
  });

  await page.goto('/');

  const start = page.getByTestId('start-button');
  const pause = page.getByTestId('pause-button');
  const reset = page.getByTestId('reset-button');
  const time = page.getByTestId('time-display');

  await expect(time).toHaveText('00:04');

  await start.click();
  await page.waitForTimeout(1200);
  await pause.click();

  const frozen = await time.textContent();
  await page.waitForTimeout(1200);
  await expect(time).toHaveText(frozen ?? '00:03');

  await reset.click();
  await expect(time).toHaveText('00:04');
});
