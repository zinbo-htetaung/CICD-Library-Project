const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3001/general/html/login.html');
});

test.describe('Login Page Tests', () => {
  // Test for successful login
  test('Successful login redirects to homepage', async ({ page }) => {
    const emailInput = page.locator('#email');
    await emailInput.fill('john@gmail.com');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('password');

    await page.getByRole('button', { name: 'Login' }).click();

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Login successful!');
      await dialog.dismiss(); 
    });

    await expect(page).toHaveURL('http://localhost:3001/user/html/home.html');
  });

  // Test for failed login with incorrect credentials
  test('Failed login shows alert', async ({ page }) => {
    const emailInput = page.locator('#email');
    await emailInput.fill('wrong@gmail.com');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('wrong-password');

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Login attempt failed. Please check your credentials.');
      await dialog.dismiss(); 
    });
  });

  // Test for failed login with empty input fields
  test('Empty input fields show alert', async ({ page }) => {
    const emailInput = page.locator('#email');
    await emailInput.fill('');

    const passwordInput = page.locator('#password');
    await passwordInput.fill(''); 
  
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Please provide email and password');
      await dialog.dismiss(); 
    });
  });

});
