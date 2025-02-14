const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3001/general/html/register.html');
});

test.describe('Registration Page Tests', () => {
  // Test for successful registration
  test('Successful registration', async ({ page, request }) => {
    // send the registration request directly to the backend
    const response = await request.post('http://localhost:3001/api/users/register', {
      data: {
        name: 'Test User',
        email: 'testuser@gmail.com',
        password: 'password123',
        confirmPassword: 'password123',
        address: '1 Test Street',
        dob: '2000-01-01',
        'g-recaptcha-response': 'test-captcha-token',     // pass test token
      },
    });

    const responseBody = await response.json();

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Account created successfully Please log into your account.');
      await dialog.dismiss(); 
    });

  });

  // Test for failed registration due to password mismatch
  test('Failed registration', async ({ page }) => {
    const nameInput = page.locator('#name');
    await nameInput.fill('doe');
    const emailInput = page.locator('#email');
    await emailInput.fill('doe@gmail.com');
    const passwordInput = page.locator('#password');
    await passwordInput.fill('1password');
    const confirmPasswordInput = page.locator('#confirmPassword');
    await confirmPasswordInput.fill('wrongpassword');
    const addressInput = page.locator('#address');
    await addressInput.fill('1 Tampines');
    const dobInput = page.locator('#dob');
    await dobInput.fill('2000-02-02');
    const termsInput = page.locator("#checker");
    await termsInput.check();

    await page.getByRole('button', { name: 'Register' }).click();
    
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Passwords do not match. Please try again.');
      await dialog.dismiss(); 
    });
  });

    // Test for failed registration due to incorrect data type
    test('Incorrect data type shows alert', async ({ page }) => {
      const nameInput = page.locator('#name');
      await nameInput.fill('xavier');
      const emailInput = page.locator('#email');
      await emailInput.fill('xavier');
      const passwordInput = page.locator('#password');
      await passwordInput.fill('password');
      const confirmPasswordInput = page.locator('#confirmPassword');
      await confirmPasswordInput.fill('password');
      const addressInput = page.locator('#address');
      await addressInput.fill('1 Changi');
      const dobInput = page.locator('#dob');
      await dobInput.fill('2000-03-03');
      const termsInput = page.locator("#checker");
      await termsInput.check();
  
      await page.getByRole('button', { name: 'Register' }).click();
      
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toBe('Please input correct type of data');
        await dialog.dismiss(); 
      });
    });
});    