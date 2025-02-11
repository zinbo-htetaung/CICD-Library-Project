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
    test('Successful user search', async ({ page }) => {
      await page.goto('http://localhost:3001/admin/userManagement.html');

      const searchInput = await page.getByPlaceholder('Search Users...');
      await searchInput.fill('mary'); 

      await page.waitForFunction(() => {
        const visibleRows = Array.from(document.querySelectorAll('#userTable tbody tr'))
          .filter(row => row.offsetParent !== null); 
        return visibleRows.length > 0; 
      });

      const rows = await page.locator('#userTable tbody tr').filter({ hasText: 'mary' });

      // Validate that all visible rows contain "mary"
      for (let i = 0; i < await rows.count(); i++) {
        const nameColumn = await rows.nth(i).locator('td:nth-child(2)');
        const nameText = await nameColumn.textContent();
        expect(nameText.toLowerCase().trim()).toContain('mary');
      }
    });

    // Test for unsuccessful user search 
    // test('Unsuccessful user search', async ({ page }) => {
    //   await page.goto('http://localhost:3001/admin/userManagement.html');
    
    //   const searchInput = await page.getByPlaceholder('Search Users...');
    //   await searchInput.fill('xyz'); // This user does not exist
    
    //   await page.waitForFunction(() => {
    //     return [...document.querySelectorAll('#userTable tbody tr')]
    //       .every(row => row.offsetParent === null); // Ensure all rows are hidden
    //   });
    
    //   const rows = await page.locator('#userTable tbody tr');
    //   for (let i = 0; i < await rows.count(); i++) {
    //     await expect(rows.nth(i)).not.toBeVisible(); // Check each row is not visible
    //   }
    // }); 

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