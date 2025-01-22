// import { test, expect } from '@playwright/test';

// test('test', async ({ page }) => {
//   await page.goto('http://localhost:3001/general/html/login.html');
//   await page.getByPlaceholder('Enter your email').click();
//   await page.getByPlaceholder('Enter your email').fill('john@gmail.com');
//   await page.getByPlaceholder('Enter your email').press('Tab');
//   await page.getByPlaceholder('Enter your password').fill('password');
//   await page.getByPlaceholder('Enter your password').press('Enter');
//   await page.getByPlaceholder('Enter your password').dblclick();
//   await page.getByPlaceholder('Enter your password').fill('password');
//   await page.getByRole('button', { name: 'Login' }).click();

//   const page1Promise = page.waitForEvent('popup');
//   await page.getByRole('link', { name: 'Explore here.' }).click();
//   const page1 = await page1Promise;
//   await page1.getByRole('link', { name: 'The Great Gatsby Book Image' }).click();
//   page1.once('dialog', dialog => {
//     console.log(`Dialog message: ${dialog.message()}`);
//     dialog.dismiss().catch(() => {});
//   });
//   await page1.getByRole('button', { name: ' Rent Book' }).click();
//   await page1.getByRole('link', { name: 'Rented Books' }).click();
//   page1.once('dialog', dialog => {
//     console.log(`Dialog message: ${dialog.message()}`);
//     dialog.dismiss().catch(() => {});
//   });
//   await page1.getByRole('button', { name: 'Return ' }).click();
// });

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
  console.log('Login successful!');
}



test.describe('Library System Flow', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Starting login process...');
    await loginAsAdmin(page);
  });

  test('Should be able to login as a user', async ({ page }) => {
    expect(page).toHaveURL('http://localhost:3001/user/html/home.html');
  });

  test('Should open chatbot, interact, and navigate to book details', async ({ page }) => {
    // Step 1: Navigate to the home page
    console.log('Navigating to the home page...');
    await page.goto('http://localhost:3001/user/html/home.html'); // Replace with your home page URL
    await expect(page).toHaveTitle(/Home/); // Verify the page title contains 'Home'

    // Step 2: Open the chatbot
    console.log('Checking chatbot toggle button...');
    const toggleButton = page.locator('#chatbot-toggle-btn');
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toBeEnabled();
    console.log('Chatbot toggle button is visible and enabled.');

    console.log('Waiting for the chatbot toggle button to be stable...');
    await toggleButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Chatbot toggle button is stable.');

    console.log('Forcing click on the chatbot toggle button...');
    await toggleButton.click({ force: true });
    console.log('Chatbot toggle button clicked.');

    console.log('Waiting for chatbot container to open...');
    const chatbotCont = page.locator('#chatbot-container');
    await chatbotCont.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Chatbot container is open.');

    // Verify chatbot container is visible
    const chatbotContainer = page.locator('#chatbot-container');
    await expect(chatbotContainer).toBeVisible();
    console.log('Chatbot container is visible.');

    // Step 3: Send a greeting message
    console.log('Sending a greeting message...');
    const chatbotInput = page.locator('#chatbot-input');
    await chatbotInput.fill('Hello');
    await page.locator('#chatbot-send-btn').click();
    console.log('Greeting message sent.');

    // Verify chatbot responded with the expected greeting
    const botMessage = page.locator('#chatbot-messages .bot-message:last-child');
    await expect(botMessage).toContainText('Hello! How can I assist you today?');
    console.log('Verified chatbot greeting.');

    // Step 4: Interact with predefined options
    console.log('Interacting with chatbot options...');
    await page.locator('button:has-text("Library Hours")').click();

    // Verify response for "Library Hours"
    const libraryHoursMessage = page.locator('#chatbot-messages .bot-message:last-child');
    await expect(libraryHoursMessage).toContainText('We are open from 9 AM to 6 PM every day!');
    console.log('Verified "Library Hours" response.');

    // Interact with other options
    await page.locator('button:has-text("Membership")').click();
    const membershipMessage = page.locator('#chatbot-messages .bot-message:last-child');
    await expect(membershipMessage).toContainText('Sign up for membership on our website or visit the library with an ID.');
    console.log('Verified "Membership" response.');

    // Step 5: Search for a book
    console.log('Initiating book search...');
    await page.locator('button:has-text("Search Book")').click();
    await chatbotInput.fill('Gatsby');
    await page.locator('#chatbot-send-btn').click();
    console.log('Book search performed.');

    // Verify book search response
    const searchResponse = page.locator('#chatbot-messages .bot-message:last-child');
    await expect(searchResponse).toContainText('Please type the name of the book you\'re searching for.');
    console.log('Verified book search response.');

    // Step 6: Navigate to book details
    console.log('Navigating to book details...');
    const page1Promise = page.waitForEvent('popup'); // Wait for a new page to open
    await page.locator('a:has-text("Click here to view details ^^")').click();
    const newPage = await page1Promise;
    await newPage.waitForLoadState();
    console.log('Navigated to book details.');

    // Verify the new page contains expected book details
    await expect(newPage).toHaveURL(/.*displaySingleBook\.html\?bookId=.*/);
    const bookDetailsHeader = newPage.locator('.card-title'); // Select by class
    await expect(bookDetailsHeader).toContainText('The Great Gatsby');
    console.log('Book details page verified.');
  });

  test('Should open chatbot and navigate to book collection', async ({ page }) => {
    console.log('Navigating to the home page...');
    await page.goto('http://localhost:3001/user/html/home.html'); // Replace with the correct URL

    console.log('Checking chatbot toggle button...');
    const toggleButton = page.locator('#chatbot-toggle-btn');
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toBeEnabled();
    console.log('Chatbot toggle button is visible and enabled.');

    console.log('Waiting for the chatbot toggle button to be stable...');
    await toggleButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Chatbot toggle button is stable.');

    console.log('Forcing click on the chatbot toggle button...');
    await toggleButton.click({ force: true });
    console.log('Chatbot toggle button clicked.');

    console.log('Waiting for chatbot container to open...');
    const chatbotContainer = page.locator('#chatbot-container');
    await chatbotContainer.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Chatbot container is open.');

    console.log('Clicking on "Book Collection"...');
    const bookCollectionButton = page.locator('button', { hasText: 'Book Collection' });
    await bookCollectionButton.click();
    console.log('Clicked on "Book Collection".');

    await page.click('a[href="displayAllBooks.html"]');
    console.log('Verifying redirection to book collection...');

    await expect(page).toHaveURL('http://localhost:3001/user/html/displayAllBooks.html');
    console.log('Redirection to book collection verified.');
  });

  test('Should be able to rent a book and return it', async ({ page }) => {
    console.log('Navigating to the home page...');
    await page.goto('http://localhost:3001/user/html/home.html');

    console.log('Navigating to book collection...');
    await page.click('a[href="displayAllBooks.html"]');
    await expect(page).toHaveURL('http://localhost:3001/user/html/displayAllBooks.html');
    console.log('Navigated to book collection.');

    console.log('Selecting a book to rent...');
    const bookLink = page.locator('a:has-text("The Great Gatsby")');
    await expect(bookLink).toBeVisible();
    await bookLink.click();
    await expect(page).toHaveURL(/.*displaySingleBook\.html\?bookId=.*/);
    console.log('Navigated to book details.');

    console.log('Waiting for book details to load...');
    await page.waitForSelector('#bookDetailsCard', { state: 'visible', timeout: 20000 });
    console.log('Book details loaded.');

    console.log('Waiting before interacting with the rent button...');
    const rentButton = page.locator('#rentBook');
    await page.waitForSelector('#rentBook', { state: 'visible', timeout: 20000 });
    await expect(rentButton).toBeVisible();
    await rentButton.click();
    console.log('Rent button clicked.');

    console.log('Waiting for rent confirmation dialog...');
    page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      expect(dialog.message()).toContain('Book rented successfully! Rented Book: The Great Gatsby');
      await dialog.accept();
      console.log('Dialog accepted.');
    });

    console.log('Navigating to rented books...');
    const navBar = page.locator('nav');
    await expect(navBar).toBeVisible({ timeout: 10000 });
    const rentedBooksLink = await page.locator('a.nav-link:has-text("Rented Books")');
    await expect(rentedBooksLink).toBeVisible();
    await rentedBooksLink.click();
    await page.waitForSelector('#currentlyRentedBooksSection', { state: 'visible', timeout: 10000 });
    console.log('Currently Rented Books section is visible.');
    await expect(page).toHaveURL('http://localhost:3001/user/html/rentedBooks.html');
    console.log('Navigated to rented books.');

    // Return the book
    console.log('Returning the book...');
    const returnButton = await page.locator('button:has-text("Return")');
    await expect(returnButton).toBeVisible(); // Ensure the button is visible

    await Promise.all([
      // Handle the dialog
      page.waitForEvent('dialog').then(async dialog => {
        const dialogMessage = dialog.message(); // Capture the dialog message
        console.log(`Return dialog message: ${dialogMessage}`);
        expect(dialogMessage).toContain('Book returned successfully - Due Fee $0 (No overdue)'); // Validate the dialog message
        await dialog.accept(); // Accept and close the dialog
        console.log('Return dialog accepted and closed.');
      }),
      // Click the return button
      returnButton.click(),
    ]);

    console.log('Book returned successfully.');
  });
});


