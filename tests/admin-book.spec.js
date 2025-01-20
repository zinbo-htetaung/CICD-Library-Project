const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/general/html/login.html');

    const emailInput = page.locator('#email');
    await emailInput.fill('admin@gmail.com');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('password');

    await page.getByRole('button', { name: 'Login' }).click();

    const dialogPromise = page.waitForEvent('dialog'); // Listen for the alert dialog
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Login successful!');
    await dialog.dismiss();

    await expect(page).toHaveURL('http://localhost:3001/admin/adminHome.html');

    const navLink = page.locator('a.nav-link[href="/admin/displayAllBooks.html"]');
    await navLink.click(); 
    await page.waitForURL('http://localhost:3001/admin/displayAllBooks.html'); 

});

test.describe('Admin Book Tests', () => {
  // Test for successful display of books
  test('Successful Book Display', async ({ page }) => {
    const bookCardsContainer = page.locator('#bookCardsContainer');
    await expect(bookCardsContainer).toBeVisible();

    const bookCards = bookCardsContainer.locator('.card');
    await expect(bookCards).toHaveCount(5); 

    const firstCard = bookCards.first();
    const cardTitle = await firstCard.locator('.card-header h4').textContent();
    expect(cardTitle).not.toBeNull();   // Ensure the card title is not null
  });

  // Test for successful display of books
  test('First book details page', async ({ page }) => {
    const bookCardsContainer = page.locator('#bookCardsContainer');
    await expect(bookCardsContainer).toBeVisible();

    const bookCards = bookCardsContainer.locator('.card');
    await expect(bookCards).toHaveCount(5); 

    const firstCard = bookCards.first();
    await firstCard.click();

    await expect(page).toHaveURL('http://localhost:3001/admin/displaySingleBook.html?bookId=1');

    const bookTitle = page.locator('h3');
    await expect(bookTitle).toHaveText('To Kill a Mockingbird');

    const backLink = page.getByRole('link', { name: 'Back' });
    await expect(backLink).toBeVisible();
    const updateBookLink = page.getByRole('link', { name: 'Update Book Details' });
    await expect(updateBookLink).toBeVisible();
    const updateBookCatLink = await page.getByRole('button', { name: 'Update Book Categories' });
    await expect(updateBookCatLink).toBeVisible();
    const deleteBookLink = page.getByRole('button', { name: 'Delete Book' });
    await expect(deleteBookLink).toBeVisible();
  });

  // Test for successful display of books
  test('Filter book by name', async ({ page }) => {
    const filterTarget = page.getByLabel('filterTarget');
    // await expect(filterTarget).toBeVisible();
    await filterTarget.selectOption('name');

    const keywordInput = page.getByLabel('Keyword');
    const filterKeyword = page.getByLabel('filterKeyword');
    // await expect(filterKeyword).toBeVisible();
    await filterTarget.fill('To Kill a Mockingbird');

    await page.locator('#filterSubmit').click();
    
  });

});


