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
  
    // Test for successful user search
    test('Successfully user search', async ({ page }) => {
      const searchInput = page.locator("#searchInput");
      await searchInput.fill("john");

      const submitBtn = page.getByRole('button', { name: 'Submit' });
      await submitBtn.click();

      await page.waitForResponse(response =>
          response.url().includes('/api/users/search/john') && response.status() === 200
      );

      const rows = page.locator('#userTable tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      for (let i = 0; i < await rows.count(); i++) {
          const nameCell = await rows.nth(i).locator('td:nth-child(2)').textContent();
          expect(nameCell.toLowerCase().trim()).toContain("john");
      }
    });

    // Test for unsuccessful user search 
    test('Unsuccessful user search', async ({ page }) => {
      const searchInput = page.locator("#searchInput");
    await searchInput.fill("nonexistentuser");

    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await submitBtn.click();

    await page.waitForFunction(() => {
        const rows = document.querySelectorAll("#userTable tbody tr");
        return rows.length === 0; 
    });

    const rows = page.locator('#userTable tbody tr');
    await expect(rows).toHaveCount(0);

    const alertMessage = page.locator("#alert-container .alert");
    await expect(alertMessage).toHaveText("No users found");
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