import { expect, test } from '../toy-app/node_modules/@playwright/test';

test('full cycle progression includes long break on fourth focus completion', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __POMODORO_TEST_DURATIONS__?: Record<string, number> }).__POMODORO_TEST_DURATIONS__ = {
      focus: 1,
      shortBreak: 1,
      longBreak: 1,
    };
  });

  await page.goto('/');

  const modeLabel = page.getByTestId('mode-label');
  const start = page.getByRole('button', { name: 'Start' });

  for (let i = 0; i < 3; i += 1) {
    await start.click();
    await expect(modeLabel).toHaveText('Short Break');
    await start.click();
    await expect(modeLabel).toHaveText('Focus');
  }

  await start.click();
  await expect(modeLabel).toHaveText('Long Break');
});
