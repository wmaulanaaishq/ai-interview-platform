import { test, expect } from '@playwright/test';

test.describe('Assessment Form - LevelRadio DOM Collision Fix', () => {
  // Use a simulated logged-in state by setting the token before tests
  test.beforeEach(async ({ page }) => {
    // Login menggunakan kredensial asli
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@rakamin.com');
    await page.click('button:has-text("Masuk dengan kata sandi")');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/assessments');
    
    // Pergi ke halaman New Assessment
    await page.goto('/assessments/new');
  });

  test('should not cause radio collision when clicking between multiple skills', async ({ page }) => {
    // 1. Add first skill
    await page.getByRole('button', { name: /Add Custom Skill/i }).click();
    
    // Fill first skill label
    await page.locator('input[placeholder="e.g. Communication"]').first().fill('Skill A');

    // 2. Add second skill
    await page.getByRole('button', { name: /Add Custom Skill/i }).click();
    
    // Fill second skill label
    await page.locator('input[placeholder="e.g. Communication"]').nth(1).fill('Skill B');

    // 3. The BUG (before fix): Clicking Level 3 on Skill B would actually select Level 3 on Skill A
    
    // Select "L3" for Skill B (using the exact text "L3" in the second radio group)
    // We locate the second skill card, and click the label containing "L3"
    const skillBGroup = page.locator('.space-y-4 > div').nth(1);
    await skillBGroup.locator('label', { hasText: /^L3$/ }).click();

    // 4. Verification
    // Verify Skill B's L3 radio is checked
    const skillBRadio3 = skillBGroup.locator('input[type="radio"][value="3"]');
    await expect(skillBRadio3).toBeChecked();

    // Verify Skill A's L3 radio is NOT checked (which proves collision is fixed!)
    const skillAGroup = page.locator('.space-y-4 > div').nth(0);
    const skillARadio3 = skillAGroup.locator('input[type="radio"][value="3"]');
    await expect(skillARadio3).not.toBeChecked();
  });
});
