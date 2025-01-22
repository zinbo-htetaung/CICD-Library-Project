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

    const navLink = page.locator('a.nav-link[href="/admin/userManagement.html"]');
    await navLink.click(); 
    await page.waitForURL('http://localhost:3001/admin/userManagement.html'); 

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
    // test('Successful user search', async ({ page }) => {
    //   const searchInput = await page.getByPlaceholder('Search Users...');
    //   await searchInput.fill('john');
    //   const rows = await page.$$('#userTable tbody tr');
    //   for (const row of rows) {
    //     const name = await row.$eval('td:nth-child(1)', el => el.textContent);
    //     expect(name).toContain('john');
    //   }
    // });
  
});