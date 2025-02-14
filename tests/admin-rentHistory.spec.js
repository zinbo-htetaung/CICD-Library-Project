import { test, expect } from '@playwright/test';

// Constants
const appBaseURL = 'http://localhost:3001'; // Replace with your actual base URL if different
const loginURL = appBaseURL + '/general/html/login.html';
const adminCredentials = {
    email: 'admin@gmail.com',
    password: 'password',
};

// Utility Function for Admin Login
async function loginAsAdmin(page) {
    await page.goto(loginURL);
    await page.fill('#email', adminCredentials.email);
    await page.fill('#password', adminCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await page.goto(`${appBaseURL}/admin/adminRentHistory.html`);
    await expect(page).toHaveURL(`${appBaseURL}/admin/adminRentHistory.html`);
}


// Test Suite
test.describe('Rent History Page Tests', () => {

    // Log in before each test
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('Should populate the Rent History table with data', async ({ page }) => {
        const tableRows = page.locator('#rent-history-table-body tr');
        await tableRows.first().waitFor();

        const rowCount = await tableRows.count();
        expect(rowCount).toBeGreaterThan(0);
    });

    test('Should apply filters and show filtered results', async ({ page }) => {
        const tableRowsAwait = page.locator('#rent-history-table-body tr');
        await tableRowsAwait.first().waitFor();

        const rowCountAwait = await tableRowsAwait.count();

        await page.locator('#filterName').fill('john');
        await page.locator('#filterEmail').fill('john@gmail.com');
        await page.locator('#filterBookId').fill('5');
        await page.locator('#filterDueStatus').selectOption('Overdue');
        await page.locator('#applyFilters').click();

        const tableRows = page.locator('#rent-history-table-body tr');
        const rowCount = await tableRows.count();
        expect(rowCount).toBeGreaterThan(0);
    });

    test('Should reset filters to default values', async ({ page }) => {
        await page.locator('#filterName').fill('Jane Doe');
        await page.locator('#filterEmail').fill('jane.doe@example.com');
        await page.locator('#filterStartDate').fill('2023-01-01');

        await page.locator('#resetFilters').click();

        const filterName = await page.locator('#filterName').inputValue();
        const filterEmail = await page.locator('#filterEmail').inputValue();
        const filterStartDate = await page.locator('#filterStartDate').inputValue();
        const dueFeesValue = await page.locator('#dueFeesSlider').inputValue();

        expect(filterName).toBe('');
        expect(filterEmail).toBe('');
        expect(filterStartDate).toBe('');
        expect(dueFeesValue).toBe('250'); // Default slider value
    });

    test('Should display "No records found" message for unmatched filters', async ({ page }) => {
        await page.waitForTimeout(2000); // Wait for the table to update

        await page.locator('#filterName').fill('NonExistentUser');
        await page.getByRole('button', { name: 'Apply Filters' }).click();

        await page.waitForTimeout(2000); // Wait for the table to update

        const noRecordsMessage = await page.locator('#no-records-message').isVisible();
        expect(noRecordsMessage).toBe(true);
    });

    test('Should interact with sliders and update their values', async ({ page }) => {
        const dueFeesSlider = page.locator('#dueFeesSlider');
        const dueFeesValue = page.locator('#dueFeesValue');

        await dueFeesSlider.fill('400');
        const sliderValue = await dueFeesValue.textContent();
        expect(sliderValue).toBe('400');
    });

    test('Should display overdue fees correctly', async ({ page }) => {
        const tableRows = page.locator('#rent-history-table-body tr');
        const firstRowFees = tableRows.nth(0).locator('td:nth-child(16)'); // Adjust column index as needed
        const feesText = await firstRowFees.textContent();

        expect(feesText).toMatch(/^\$\d+\.\d{2}$/); // Matches a currency format like "$12.34"
    });
});