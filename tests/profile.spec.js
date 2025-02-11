const { test, expect } = require('@playwright/test');

const defaultUserNamePsw = { email: 'abcdef@gmail.com', password: '123456' };
const updatedInfo = {
  name: 'updated-name',
  email: 'updatedEmail@gmail.com',
  address: 'updated address',
  password: 'abcdefg',
};

test.beforeAll(async ({ page }) => {
    // Login once before each test
    await page.goto('http://localhost:3001/general/html/login.html');
    await page.getByPlaceholder('Enter your email').fill(defaultUserNamePsw.email);
    await page.getByPlaceholder('Enter your password').fill(defaultUserNamePsw.password);
    await page.getByRole('button', { name: 'Login' }).click();
  
  });

test.describe('Change Password', () => {

    
  test('Should update password successfully', async ({ page }) => {
    await page.goto('http://localhost:3001/user/html/profile.html');

    // Open the "Change Password" modal
    await page.getByRole('link', { name: 'My Profile ' }).click();
    await page.getByRole('button', { name: 'Change Password' }).click();

    // Fill in the old and new password
    await page.locator('input[name="oldPw"]').fill(defaultUserNamePsw.password);
    await page.locator('input[name="newPw"]').fill(updatedInfo.password);

    // Save the new password
    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for alert and verify success message
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Password updated successfully!');
      await dialog.dismiss();
    });
  });

  test('Should show alert if old password is incorrect', async ({ page }) => {
    // Open the "Change Password" modal
    await page.getByRole('button', { name: 'Actions ' }).click();
    await page.getByRole('button', { name: 'Change Password' }).click();

    // Fill in incorrect old password
    await page.locator('input[name="oldPw"]').fill('wrongpassword');
    await page.locator('input[name="newPw"]').fill(updatedInfo.password);

    // Click Save and verify alert message
    await page.getByRole('button', { name: 'Save' }).click();
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Old password is incorrect');
      await dialog.dismiss();
    });
  });
});

test.describe('Update Profile Info', () => {
  test('Should update name, email, and address with valid inputs', async ({ page }) => {
    // Open the Update Info modal
    await page.getByRole('button', { name: 'Update Info ' }).click();

    // Update fields
    await page.getByPlaceholder('Enter your name').fill(updatedInfo.name);
    await page.getByPlaceholder('Enter your email').fill(updatedInfo.email);
    await page.getByPlaceholder('Enter your address').fill(updatedInfo.address);

    // Save Changes
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify updated info on the profile page
    await expect(page.locator('#profileName')).toContainText(updatedInfo.name);
    await expect(page.locator('#profileEmail')).toContainText(updatedInfo.email);
    await expect(page.locator('#profileAddress')).toContainText(updatedInfo.address);
  });

  test('Should show error for invalid email format', async ({ page }) => {
    // Open the Update Info modal
    await page.getByRole('button', { name: 'Update Info ' }).click();

    // Enter invalid email and try to save
    await page.getByPlaceholder('Enter your email').fill('invalid-email');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Wait for alert and verify message
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Invalid email format');
      await dialog.dismiss();
    });
  });

  test('Should show error for duplicate email', async ({ page }) => {
    // Open the Update Info modal
    await page.getByRole('button', { name: 'Update Info ' }).click();

    // Enter an already registered email and try to save
    await page.getByPlaceholder('Enter your email').fill('admin@gmail.com');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Wait for alert and verify message
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('User with this email already exists');
      await dialog.dismiss();
    });
  });

  test('Should show error for missing fields', async ({ page }) => {
    // Open the Update Info modal
    await page.getByRole('button', { name: 'Update Info ' }).click();

    // Leave the name field empty and try to save
    await page.getByPlaceholder('Enter your name').fill('');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Wait for alert and verify message
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('All fields are required!');
      await dialog.dismiss();
    });
  });
});
