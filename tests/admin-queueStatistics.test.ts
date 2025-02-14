const { test, expect } = require('@playwright/test');

const appBaseURL = 'http://localhost:3001';
const loginURL = `${appBaseURL}/general/html/login.html`;
const statisticsURL = `${appBaseURL}/admin/queueStatistics.html`;
const queueManagementURL = `${appBaseURL}/admin/queueManagement.html`;

const adminCredentials = {
    email: 'admin@gmail.com',
    password: 'password',
};

// Reusable helper function for admin login
async function loginAsAdmin(page) {
    await page.goto(loginURL);
    await page.fill('#email', adminCredentials.email);
    await page.fill('#password', adminCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await expect(page).toHaveURL(`${appBaseURL}/admin/adminHome.html`);
}

test.describe('Queue Statistics Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(statisticsURL);
        await expect(page).toHaveURL(statisticsURL);
        console.log('✅ Navigated to Queue Statistics Page');
    });

    test('Should load all charts correctly', async ({ page }) => {
        // Verify Most Queued Books chart
        const mostQueuedBooksChart = page.locator('#mostQueuedBooksChart');
        await expect(mostQueuedBooksChart).toBeVisible();
        console.log('📊 Most Queued Books chart is visible');

        // Verify Most Queued Genre chart
        const mostQueuedGenreChart = page.locator('#mostQueuedGenreChart');
        await expect(mostQueuedGenreChart).toBeVisible();
        console.log('📖 Most Queued Genre chart is visible');

        // Verify Queue Trends Over Time chart
        const queueTrendsChart = page.locator('#queueTrendsChart');
        await expect(queueTrendsChart).toBeVisible();
        console.log('📈 Queue Trends Over Time chart is visible');
    });

    test('Should update the Most Queued Books chart when input changes', async ({ page }) => {
        const numBooksInput = page.locator('#numBooks');
        const updateButton = page.locator('#fetchBooksBtn');
        const mostQueuedBooksChart = page.locator('#mostQueuedBooksChart');

        await numBooksInput.fill('3');
        await updateButton.click();
        await page.waitForTimeout(2000); // Wait for chart update

        // Ensure chart is still visible
        await expect(mostQueuedBooksChart).toBeVisible();
        console.log('✅ Most Queued Books chart updated after changing input');
    });

    test('Should load top 3 most queued books and genres', async ({ page }) => {
        const topQueuedBooks = page.locator('#topBooksList');
        await expect(topQueuedBooks).toBeVisible();
        await expect(topQueuedBooks.locator('.list-group-item')).toHaveCount(3);
        console.log('🏆 Top 3 Most Queued Books loaded successfully');

        const topQueuedGenres = page.locator('#topGenresList');
        await expect(topQueuedGenres).toBeVisible();
        await expect(topQueuedGenres.locator('.list-group-item')).toHaveCount(3);
        console.log('📖 Top 3 Most Queued Genres loaded successfully');
    });

    test('Should return to Queue Management when clicking "Back to Queue Management"', async ({ page }) => {
        const backButton = page.locator('#backToQueueBtn');
        await backButton.click();
        await expect(page).toHaveURL(queueManagementURL);
        console.log('🔄 Successfully navigated back to Queue Management');
    });

    test('Should interact with Queue Trends Over Time chart', async ({ page }) => {
        const queueTrendsChart = page.locator('#queueTrendsChart');
        await expect(queueTrendsChart).toBeVisible();

        // Simulate clicks on different points of the chart
        await queueTrendsChart.click({ position: { x: 120, y: 90 } });
        await queueTrendsChart.click({ position: { x: 240, y: 50 } });
        await queueTrendsChart.click({ position: { x: 360, y: 120 } });

        console.log('✅ Successfully interacted with Queue Trends chart');
    });
});
