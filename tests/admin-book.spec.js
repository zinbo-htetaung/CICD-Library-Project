const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });

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
    await page.goto('http://localhost:3001/admin/displayAllBooks.html');

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
    await expect(cardTitle).not.toBeNull();   // ensure the card title is not null at least
  });

  // Test for successful display of books
  test('First book details page', async ({ page }) => {
    const bookCardsContainer = page.locator('#bookCardsContainer');
    await expect(bookCardsContainer).toBeVisible();

    const specificBookCard = page.locator('.card-link[href*="bookId=1"]');
    await specificBookCard.click();

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

  // Test for filter book by name
  test('Filter book by name', async ({ page }) => {
    const filterTarget = page.getByLabel('Filter Target:');
    await filterTarget.selectOption('name');

    const keywords = 'To Kill a Mockingbird';
    const filterKeyword = page.getByLabel('Enter Keyword:');
    await filterKeyword.fill(keywords);

    await page.locator('#filterSubmit').click();

    await expect(page.locator('.alert-info')).toHaveText(`Showing results for "${keywords}" (Name)`);
    
    const bookCardsContainer = page.locator('#bookCardsContainer');
    await expect(bookCardsContainer).toBeVisible();

    const bookCards = bookCardsContainer.locator('.card');
    const firstCard = bookCards.first();
    const cardName = await firstCard.locator('.card-header h4').textContent();
    await expect(cardName).toBe(`${keywords}`);
  });

  // Test for filter book by author
  test('Filter book by author', async ({ page }) => {
    const filterTarget = page.getByLabel('Filter Target:');
    await filterTarget.selectOption('author');

    const keywords = 'Harper Lee';
    const filterKeyword = page.getByLabel('Enter Keyword:');
    await filterKeyword.fill(keywords);

    await page.locator('#filterSubmit').click();

    await expect(page.locator('.alert-info')).toHaveText(`Showing results for "${keywords}" (author)`);
    
    const bookCardsContainer = page.locator('#bookCardsContainer');
    await expect(bookCardsContainer).toBeVisible();

    const bookCards = bookCardsContainer.locator('.card');
    const firstCard = bookCards.first();
    const cardTitle = await firstCard.locator('.card-title').textContent();
    await expect(cardTitle).toBe(`By : ${keywords}`);
  });

  // Test for filter book by category
  test('Filter book by category', async ({ page }) => {
    const filterTarget = page.getByLabel('Filter Target:');
    await filterTarget.selectOption('category');

    const keywords = 'Biography';
    const filterKeyword = page.getByLabel('Enter Keyword:');
    await filterKeyword.fill(keywords);

    await page.locator('#filterSubmit').click();

    await expect(page.locator('.alert-info')).toHaveText(`Showing results for "${keywords}" (category)`);
    
    const bookCardsContainer = page.locator('#bookCardsContainer');
    await expect(bookCardsContainer).toBeVisible();

    const bookCards = bookCardsContainer.locator('.card');
    const firstCard = bookCards.first();
    await expect(firstCard).toBeVisible();
  });

  // Test for unsuccessful filter book by category
  test('Filter book not found', async ({ page }) => {
    const filterTarget = page.getByLabel('Filter Target:');
    await filterTarget.selectOption('category');

    const keywords = 'Gibberish';
    const filterKeyword = page.getByLabel('Enter Keyword:');
    await filterKeyword.fill(keywords);

    await page.locator('#filterSubmit').click();

    await expect(page.locator('.alert-danger')).toHaveText(`No book found`);
  });

  // Test for adding a new book
  test('Add book', async ({ page }) => {
    await page.getByRole('link', { name: 'Add New Book' }).click();
    
    await expect(page).toHaveURL('http://localhost:3001/admin/addBook.html');

    const bookName = page.getByLabel('Book Name');
    await bookName.fill('Harry Potter');
    const authorName = page.getByLabel('Author');
    await authorName.fill('JK Rowling');
    const description = page.getByLabel('Description');
    await description.fill('A magical book about Hogwarts magical academy');
    const noCopies = page.getByLabel('Number of Copies');
    await noCopies.type('5');
    await page.getByLabel('Romance').check();
    await page.getByLabel('Fantasy').check();

    await page.getByRole('button', { name: 'Add Book' }).click();

    const dialogPromise = page.waitForEvent('dialog'); 
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Book and categories successfully added');
    await dialog.dismiss();
  });

  // Test for book details update
  test('Update Book Details', async ({ page }) => {
    const bookCardsContainer = page.locator('#bookCardsContainer');
    const bookCards = bookCardsContainer.locator('.card');
    
    const specificBookCard = page.locator('.card-link[href*="bookId=6"]');
    await specificBookCard.click();

    // await expect(page).toHaveURL('http://localhost:3001/admin/displaySingleBook.html?bookId=1');
    await page.getByRole('link', { name: 'Update Book Details' }).click();
    // await expect(page).toHaveURL('http://localhost:3001/admin/updateBookDetails.html?bookId=1');

    const bookName = page.getByLabel('Book Name');
    await bookName.fill('MockingBird');
    const authorName = page.getByLabel('Author');
    await authorName.fill('Lee Harper');
    const description = page.getByLabel('Description');
    await description.fill('A novel about racial injustice in the American South long time ago...');
    const noCopies = page.getByLabel('Number Of New Book Copies');
    await noCopies.type('5');

    await page.getByRole('button', { name: 'Update Book' }).click();

    const dialogPromise = page.waitForEvent('dialog'); 
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Book details successfully updated');
    await dialog.dismiss();

  });

  // Test for book categories update
  test('Update Book Categories', async ({ page }) => {
    const bookCardsContainer = page.locator('#bookCardsContainer');
    await expect(bookCardsContainer).toBeVisible();

    const specificBookCard = page.locator('.card-link[href*="bookId=6"]');
    await specificBookCard.click();

    // await expect(page).toHaveURL('http://localhost:3001/admin/displaySingleBook.html?bookId=1');
    await page.getByRole('button', { name: 'Update Book Categories' }).click();
    
    const modal = page.locator('#updateCategoriesModal');
    await expect(modal).toBeVisible();

    const categoryThriller = page.getByRole('checkbox', { name: 'Thriller' });
    await categoryThriller.check();
    await page.getByRole('button', { name: 'Update Categories' }).click();
    
    await expect(modal).toBeHidden();

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Book categories successfully updated');
      await dialog.dismiss(); 
    });

  });

  test('Delete Book', async ({ page }) => {
    const bookCardsContainer = page.locator('#bookCardsContainer');
    await expect(bookCardsContainer).toBeVisible();
  
    const specificBookCard = page.locator('.card-link[href*="bookId=6"]');
    await specificBookCard.click();
  
    page.on('dialog', async (dialog) => {
      if (dialog.message() === 'Are you sure you want to delete this book?') {
        await dialog.accept(); // Accept the confirmation dialog
      } else if (dialog.message() === 'Book successfully deleted') {
        await dialog.dismiss(); // Dismiss the success alert 
      } else {
        throw new Error(`Unexpected dialog message: ${dialog.message()}`);
      }
    });
  
    await page.getByRole('button', { name: 'Delete Book' }).click();

    await page.waitForTimeout(1000);  // Give the dialogs a moment to appear
  
    await page.waitForURL('http://localhost:3001/admin/displayAllBooks.html');
    await expect(page).toHaveURL('http://localhost:3001/admin/displayAllBooks.html');
  
  });
  
});


