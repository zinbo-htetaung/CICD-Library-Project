const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/general/html/login.html');

    const emailInput = page.locator('#email');
    await emailInput.fill('test@gmail.com');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('password');

    await page.getByRole('button', { name: 'Login' }).click();

    const dialogPromise = page.waitForEvent('dialog');
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Login successful!');
    await dialog.dismiss();

    await expect(page).toHaveURL('http://localhost:3001/user/html/home.html');

    const navLink = page.locator('a.nav-link[href="displayAllBooks.html"]');
    await navLink.click();
    await page.waitForURL('http://localhost:3001/user/html/displayAllBooks.html');

    const bookCard = page.locator('h4', { hasText: 'To Kill a Mockingbird' });
    await bookCard.click();
    await page.waitForURL('http://localhost:3001/user/html/displaySingleBook.html?bookId=1');
});

test.describe('User Review Test', () => {
    test('Create Review Both Fail and Success Case', async ({ page }) => {
        const iconContainer = await page.locator('#iconContainer');
        const icon = await iconContainer.locator('i');
        await expect(icon).toHaveClass(/bi-book/); //Expect the Read Status Icon to be Not Filled

        
    });
})