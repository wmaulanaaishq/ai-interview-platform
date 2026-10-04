import { test, expect } from '@playwright/test';

test.describe('Login Page Visual & Auth Flow', () => {
  test('should display Rakamin official UI elements', async ({ page }) => {
    await page.goto('/login');

    // 1. Verify Fake Logo exists
    await expect(page.locator('text=Rakamin').first()).toBeVisible();

    // 2. Verify Heading
    await expect(page.getByRole('heading', { name: 'Login to Rakamin' })).toBeVisible();

    // 3. Verify Email input
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();

    // 4. Verify primary button matches Rakamin's "Send Link"
    const sendLinkBtn = page.getByRole('button', { name: 'Send Link' });
    await expect(sendLinkBtn).toBeVisible();
  });

  test('should login using Demo Bypass without backend', async ({ page }) => {
    await page.goto('/login');

    // Click the Demo Bypass button
    const bypassBtn = page.getByRole('button', { name: /Masuk Mode Demo/i });
    await expect(bypassBtn).toBeVisible();
    await bypassBtn.click();

    // Should navigate to assessments dashboard and show Hero banner
    await expect(page).toHaveURL(/\/assessments/);
    await expect(page.getByRole('heading', { name: 'Hi Assessor, Selamat Datang!' })).toBeVisible();
    
    // Verify Demo Mode banner is visible
    await expect(page.locator('text=Mode Demo Aktif')).toBeVisible();
  });
});
