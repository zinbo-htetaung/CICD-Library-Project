const { test, expect } = require('@playwright/test');

const appBaseURL = 'http://localhost:3001/general/html/login.html';
const adminDashboardURL = 'http://localhost:3001/admin/adminHome.html';

const adminCredentials = {
    email: 'admin@gmail.com',
    password: 'password',
};

// Reusable helper function for admin login
async function loginAsAdmin(page) {
    await page.goto(appBaseURL);
    await page.fill('#email', adminCredentials.email);
    await page.fill('#password', adminCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await expect(page).toHaveURL(adminDashboardURL);
}

test.describe('Admin Dashboard Tests', () => {
    test('Should redirect to login page if not logged in', async ({ page }) => {
        // Listen for and handle the alert dialog
        page.on('dialog', async (dialog) => {
            // Verify the alert message
            expect(dialog.message()).toBe('Please log in to access these webpages');
            // Dismiss the alert
            await dialog.dismiss();
        });

        // Attempt to access the admin dashboard without being logged in
        await page.goto(adminDashboardURL);

        // Verify redirection to the login page
        await expect(page).toHaveURL('http://localhost:3001/general/html/home.html');
    });

    test('Should login as admin and access the dashboard', async ({ page }) => {
        await loginAsAdmin(page);
        // Verify dashboard header or unique element
        const dashboardHeader = page.locator('h1:has-text("Admin Dashboard")'); // Adjust if necessary
        await expect(dashboardHeader).toBeVisible();
    });

    test('Should logout successfully and redirect to login page', async ({ page }) => {
        await loginAsAdmin(page);

        // Click logout button
        const logoutButton = page.locator('#logout-button');
        await logoutButton.click();

        // Verify redirection to login page
        await expect(page).toHaveURL(appBaseURL);
        const loginForm = page.locator('form');
        await expect(loginForm).toBeVisible();
    });

    test('Should navigate to Books page', async ({ page }) => {
        await loginAsAdmin(page);
        await page.click('text=Go to Books');
        await expect(page).toHaveURL('http://localhost:3001/admin/displayAllBooks.html');
    });

    test('Should navigate to Requests page', async ({ page }) => {
        await loginAsAdmin(page);
        await page.click('text=Go to Requests');
        await expect(page).toHaveURL('http://localhost:3001/admin/bookRequest.html');
    });

    test('Should navigate to History page', async ({ page }) => {
        await loginAsAdmin(page);
        await page.click('text=Go to History');
        await expect(page).toHaveURL('http://localhost:3001/admin/adminRentHistory.html');
    });

    test('Should navigate to Users page', async ({ page }) => {
        await loginAsAdmin(page);
        await page.click('text=Go to Users');
        await expect(page).toHaveURL('http://localhost:3001/admin/userManagement.html');
    });

    test('Should navigate to Rent history page', async ({ page }) => {
        await loginAsAdmin(page);
        await page.click('text=Go to Reports');
        await expect(page).toHaveURL('http://localhost:3001/admin/adminRentHistory.html');
    });

    test('Should interact with Books by Category chart', async ({ page }) => {
        await loginAsAdmin(page);
        const chart = page.locator('#booksByCategoryChart');
        await expect(chart).toBeVisible();

        // Simulate a click on specific positions
        const positions = [
            { x: 362, y: 48 },
            { x: 480, y: 52 },
            { x: 207, y: 50 },
        ];

        for (const position of positions) {
            await chart.click({ position });
        }
    });

    test('Should be able to filter by date', async ({ page }) => {
        await loginAsAdmin(page);
        // Interact with the "Monthly Rentals" chart
        await page.locator('#monthlyRentalsChart').click({
            position: { x: 220, y: 68 },
        });

        // Verify "View Rentals By" dropdown visibility and functionality
        const viewByDropdown = page.getByLabel('View Rentals By:');
        await expect(viewByDropdown).toBeVisible();

        // Change view to "Yearly" and back to "Monthly"
        await viewByDropdown.selectOption('yearly');
        await viewByDropdown.selectOption('monthly');

        await page.waitForSelector('#year-filter');

        // Filter rentals by specific years and verify results
        const yearDropdown = page.locator('#year-filter'); // Use the correct selector

        const options = await page.locator('#year-filter option').allTextContents();
        const yearsToTest = ['2019', '2020', '2021', '2022', '2023'];

        for (const year of yearsToTest) {
            await yearDropdown.selectOption(year);

            await page.waitForTimeout(1000); // Adjust based on app response time

            const chartCanvas = page.locator('#monthlyRentalsChart');
            await expect(chartCanvas).toBeVisible();
        }
    });
});

