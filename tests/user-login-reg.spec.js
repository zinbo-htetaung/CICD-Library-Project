const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3001/general/html/login.html');
});

test.describe('Login Page Tests', () => {
  // Test for successful login
  test('Successful login redirects user to homepage', async ({ page }) => {
    // Enter valid login credentials
    const emailInput = page.locator('#email');
    await emailInput.fill('john@gmail.com');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('password');

    // Submit the form
    await page.getByRole('button', { name: 'Login' }).click();

    page.on('dialog', async (dialog) => {
      // Verify alert message
      expect(dialog.message()).toBe('Login successful!');
      await dialog.dismiss(); 
    });

    // Wait for navigation to user homepage
    await page.waitForURL('http://localhost:3001/user/html/home.html');

    // Verify URL is correct
    await expect(page).toHaveURL('http://localhost:3001/user/html/home.html');
  });

  // Test for failed login with incorrect credentials
  test('Failed login shows alert', async ({ page }) => {
    // Enter wrong login credentials
    const emailInput = page.locator('#email');
    await emailInput.fill('wrong@gmail.com');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('wrong-password');

    // Listen for the alert dialog
    page.on('dialog', async (dialog) => {
      // Verify alert message
      expect(dialog.message()).toBe('Login attempt failed. Please check your credentials.');
      await dialog.dismiss(); 
    });

    // await page.click('button[type="submit"]');
  });

  test('Empty input fields show alert', async ({ page }) => {
    // Enter empty login credentials
    const emailInput = page.locator('#email');
    await emailInput.fill('');

    const passwordInput = page.locator('#password');
    await passwordInput.fill(''); 
  
    // Listen for the alert dialog
    page.on('dialog', async (dialog) => {
      // Verify alert message
      expect(dialog.message()).toBe('Please provide email and password');
      await dialog.dismiss(); 
    });
  });

});
