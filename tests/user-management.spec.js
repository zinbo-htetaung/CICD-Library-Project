const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/general/html/login.html');

    const emailInput = page.locator('#email');
    await emailInput.fill('admin@gmail.com');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('password');

    await page.getByRole('button', { name: 'Login' }).click();

    const dialogPromise = page.waitForEvent('dialog'); 
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Login successful!');
    await dialog.dismiss();

    await expect(page).toHaveURL('http://localhost:3001/admin/adminHome.html');
    await page.goto('http://localhost:3001/admin/userManagement.html');

});

test.describe('User Management Page', () => {
    // Test for loading of navbar and footer  
    test('Loading of footer and navbar', async ({ page }) => {
      const navbar = await page.waitForSelector('#navbar-container');
      const footer = await page.waitForSelector('#footer-container');
      expect(navbar).not.toBeNull();
      expect(footer).not.toBeNull();
    });
  
    // Test for fetching and displaying users
    test('Fetch and display users', async ({ page }) => {
      await page.waitForSelector('#userTable tbody tr');
      const rows = await page.$$('#userTable tbody tr');
      expect(rows.length).toBeGreaterThan(0);
    });
  
    // Test for searching users successfully
    test('Successful user search', async ({ page }) => {
      const searchInput = await page.getByPlaceholder('Search Users...');
      await searchInput.type('mary');

      await page.waitForTimeout(1000);
      const rows = await page.$$('#userTable tbody tr');

      let visibleRowCount = 0;
      for (const row of rows) {
        const isVisible = await row.isVisible();
        if (isVisible) visibleRowCount++;
      }
      expect(visibleRowCount).toBeGreaterThan(0);

      for (const row of rows) {
        if (await row.isVisible()) {
          const nameColumn = await row.$('td:nth-child(2)'); 
          const nameText = await nameColumn.textContent();
          expect(nameText.toLowerCase().trim()).toContain('mary');
        }
      }
    });

    // Test for searching users unsuccessfully
    test('Unsuccessful user search', async ({ page }) => {
      const searchInput = await page.getByPlaceholder('Search Users...');
      await searchInput.type('xyz');

      await page.waitForTimeout(1000);
      const rows = await page.$$('#userTable tbody tr');

      let visibleRowCount = 0;
      for (const row of rows) {
        const isVisible = await row.isVisible();
        if (isVisible) visibleRowCount++;
      }
      expect(visibleRowCount).toBe(0);
    });

    // Test for banning a user
    test('Ban a user', async ({ page }) => {
      await page.waitForSelector('#userTable tbody tr');
    
      const deleteButton = page.locator('button[onclick="deleteUser(3)"]');;
      await expect(deleteButton).toBeVisible();

      page.on('dialog', async (dialog) => {
        if (dialog.message() === 'Are you sure you want to delete this user?') {
          await dialog.accept(); // Accept the confirmation dialog
        } else if (dialog.message() === 'User successfully deleted!') {
          await dialog.dismiss(); // Dismiss the success alert 
        } else {
          throw new Error(`Unexpected dialog message: ${dialog.message()}`);
        }
      });

      await deleteButton.click();
      await page.waitForTimeout(1000);
    
    });
  
});