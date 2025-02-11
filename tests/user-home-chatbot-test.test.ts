import { test, expect } from '@playwright/test';

const appBaseURL = 'http://localhost:3001'; // Replace with your actual base URL if different
const loginURL = appBaseURL + '/general/html/login.html';
const userCredentials = {
  email: 'john@gmail.com',
  password: 'password',
};

// Utility Function for Admin Login
async function loginAsAdmin(page) {
  await page.goto(loginURL);
  await page.fill('#email', userCredentials.email);
  await page.fill('#password', userCredentials.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(`${appBaseURL}/user/html/home.html`);
}



test.describe('Library System Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Should be able to login as a user', async ({ page }) => {
    await expect(page).toHaveURL('http://localhost:3001/user/html/home.html');
  });

  test('Should open chatbot, interact, and navigate to book details', async ({ page }) => {
    // Step 1: Navigate to the home page
    await page.goto('http://localhost:3001/user/html/home.html'); // Replace with your home page URL
    await expect(page).toHaveTitle(/Home/); // Verify the page title contains 'Home'

    // Step 2: Open the chatbot
    const toggleButton = page.locator('#chatbot-toggle-btn');
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toBeEnabled();

    await toggleButton.waitFor({ state: 'visible', timeout: 10000 });

    await toggleButton.dblclick({ force: true });

    const chatbotCont = page.locator('#chatbot-container');
    await chatbotCont.waitFor({ state: 'visible', timeout: 10000 });

    // Verify chatbot container is visible
    const chatbotContainer = page.locator('#chatbot-container');
    await expect(chatbotContainer).toBeVisible();

    // Step 3: Send a greeting message
    const chatbotInput = page.locator('#chatbot-input');
    await chatbotInput.fill('Hello');
    await page.locator('#chatbot-send-btn').click();

    // Verify chatbot responded with the expected greeting
    const botMessage = page.locator('#chatbot-messages .bot-message:last-child');
    await expect(botMessage).toContainText('Hello! How can I assist you today?');

    // Step 4: Interact with predefined options
    await page.locator('button:has-text("Library Hours")').click();

    // Verify response for "Library Hours"
    const libraryHoursMessage = page.locator('#chatbot-messages .bot-message:last-child');
    await expect(libraryHoursMessage).toContainText('We are open from 9 AM to 6 PM every day!');

    // Interact with other options
    await page.locator('button:has-text("Membership")').click();
    const membershipMessage = page.locator('#chatbot-messages .bot-message:last-child');
    await expect(membershipMessage).toContainText('Sign up for membership on our website or visit the library with an ID.');

    // Step 5: Search for a book
    await page.locator('button:has-text("Search Book")').click();
    // Verify book search response
    const searchResponse = page.locator('#chatbot-messages .bot-message:last-child');
    await expect(searchResponse).toContainText('Please type the name of the book you\'re searching for.');

    await page.waitForTimeout(2000);
    await chatbotInput.fill('Gatsby');
    await page.locator('#chatbot-send-btn').click();

    // Step 6: Navigate to book details
    const page1Promise = page.waitForEvent('popup'); // Wait for a new page to open
    await page.getByRole('link', { name: 'Click here to view details ^^' }).click();
    const newPage = await page1Promise;
    await newPage.waitForLoadState();

    // Verify the new page contains expected book details
    await expect(newPage).toHaveURL(/.*displaySingleBook\.html\?bookId=.*/);
    const bookDetailsHeader = newPage.locator('.card-title'); // Select by class
    await expect(bookDetailsHeader).toContainText('The Great Gatsby');
  });

  test('Should open chatbot and navigate to book collection', async ({ page }) => {
    await page.goto('http://localhost:3001/user/html/home.html'); // Replace with the correct URL

    const toggleButton = page.locator('#chatbot-toggle-btn');
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toBeEnabled();

    await toggleButton.waitFor({ state: 'visible', timeout: 10000 });

    await toggleButton.dblclick({ force: true });

    const chatbotContainer = page.locator('#chatbot-container');
    await chatbotContainer.waitFor({ state: 'visible', timeout: 10000 });

    const bookCollectionButton = page.locator('button', { hasText: 'Book Collection' });
    await bookCollectionButton.click();

    await page.click('a[href="displayAllBooks.html"]');

    await expect(page).toHaveURL('http://localhost:3001/user/html/displayAllBooks.html');
  });

  test('Should be able to rent a book and return it', async ({ page }) => {
    await page.goto('http://localhost:3001/user/html/home.html');

    await page.click('a[href="displayAllBooks.html"]');
    await expect(page).toHaveURL('http://localhost:3001/user/html/displayAllBooks.html');

    const bookLink = page.locator('a:has-text("The Great Gatsby")');
    await expect(bookLink).toBeVisible();
    await bookLink.click();
    await expect(page).toHaveURL(/.*displaySingleBook\.html\?bookId=.*/);

    await page.waitForSelector('#bookDetailsCard', { state: 'visible', timeout: 20000 });

    await page.waitForTimeout(2000); // Wait for 2000 milliseconds (2 seconds)

    await page.reload(); // Reload the current tab
    const rentButton = page.locator('#rentBook');
    await page.waitForSelector('#rentBook', { state: 'visible', timeout: 20000 });
    await expect(rentButton).toBeVisible();

    await rentButton.click();

    page.once('dialog', async dialog => {
      // expect(dialog.message()).toContain('Book rented successfully! Rented Book: The Great Gatsby');
      await dialog.accept();
    });

    const navBar = page.locator('nav');
    await expect(navBar).toBeVisible({ timeout: 10000 });
    const rentedBooksLink = await page.locator('a.nav-link:has-text("Rented Books")');
    await expect(rentedBooksLink).toBeVisible();
    await rentedBooksLink.click();
    await page.waitForSelector('#currentlyRentedBooksSection', { state: 'visible', timeout: 10000 });
    await expect(page).toHaveURL('http://localhost:3001/user/html/rentedBooks.html');

    // Return the book
    await page.waitForTimeout(2000); // Wait for 2000 milliseconds (2 seconds)

    await page.reload(); // Reload the current tab
    const returnButton = await page.locator('button:has-text("Return")');
    await expect(returnButton).toBeVisible(); // Ensure the button is visible

    await Promise.all([
      // Handle the dialog
      page.waitForEvent('dialog').then(async dialog => {
        const dialogMessage = dialog.message(); // Capture the dialog message
        expect(dialogMessage).toContain('Book returned successfully - Due Fee $0 (No overdue)'); // Validate the dialog message
        await dialog.accept(); // Accept and close the dialog
      }),
      // Click the return button
      returnButton.click(),
    ]);

  });
});


