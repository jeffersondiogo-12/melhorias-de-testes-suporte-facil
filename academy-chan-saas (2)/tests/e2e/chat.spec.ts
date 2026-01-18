import { test, expect } from '@playwright/test';

test('chat flow smoke', async ({ page }) => {
  await page.goto('/');
  // Este é apenas um esqueleto; requer Playwright instalado para rodar.
  await expect(page).toHaveTitle(/Academy-chan/);
});
