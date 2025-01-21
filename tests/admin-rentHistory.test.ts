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
    console.log('Verifying navigation to Rent History page after login...');
    await page.goto(`${appBaseURL}/admin/adminRentHistory.html`);
    await expect(page).toHaveURL(`${appBaseURL}/admin/adminRentHistory.html`);
    console.log('Login successful!');
}


// Test Suite
test.describe('Rent History Page Tests', () => {

    // Log in before each test
    test.beforeEach(async ({ page }) => {
        console.log('Starting login process...');
        await loginAsAdmin(page);
    });

    test('Should populate the Rent History table with data', async ({ page }) => {
        console.log('Checking for table data...');
        const tableRows = page.locator('#rent-history-table-body tr');
        await tableRows.first().waitFor();

        const rowCount = await tableRows.count();
        console.log(`Number of rows found: ${rowCount}`);
        expect(rowCount).toBeGreaterThan(0);
        console.log('Table data populated successfully!');
    });

    test('Should apply filters and show filtered results', async ({ page }) => {
        console.log('Checking for table data...');
        const tableRowsAwait = page.locator('#rent-history-table-body tr');
        await tableRowsAwait.first().waitFor();

        const rowCountAwait = await tableRowsAwait.count();
        console.log(`Number of rows found: ${rowCountAwait}`);

        console.log('Applying filters...');
        await page.locator('#filterName').fill('john');
        await page.locator('#filterEmail').fill('john@gmail.com');
        await page.locator('#filterBookId').fill('5');
        await page.locator('#filterDueStatus').selectOption('Overdue');
        await page.locator('#applyFilters').click();

        console.log('Verifying filtered results...');
        const tableRows = page.locator('#rent-history-table-body tr');
        const rowCount = await tableRows.count();
        console.log(`Filtered rows count: ${rowCount}`);
        expect(rowCount).toBeGreaterThan(0);
    });

    test('Should reset filters to default values', async ({ page }) => {
        console.log('Modifying filters...');
        await page.locator('#filterName').fill('Jane Doe');
        await page.locator('#filterEmail').fill('jane.doe@example.com');
        await page.locator('#filterStartDate').fill('2023-01-01');

        console.log('Resetting filters...');
        await page.locator('#resetFilters').click();

        console.log('Verifying default filter values...');
        const filterName = await page.locator('#filterName').inputValue();
        const filterEmail = await page.locator('#filterEmail').inputValue();
        const filterStartDate = await page.locator('#filterStartDate').inputValue();
        const dueFeesValue = await page.locator('#dueFeesSlider').inputValue();
        console.log(`Filter values after reset: Name=${filterName}, Email=${filterEmail}, StartDate=${filterStartDate}, DueFees=${dueFeesValue}`);

        expect(filterName).toBe('');
        expect(filterEmail).toBe('');
        expect(filterStartDate).toBe('');
        expect(dueFeesValue).toBe('250'); // Default slider value
    });

    test('Should display "No records found" message for unmatched filters', async ({ page }) => {
        console.log('Applying unmatched filters...');
        await page.locator('#filterName').fill('NonExistentUser');
        await page.locator('#applyFilters').click();

        console.log('Checking for "No records found" message...');
        const noRecordsMessage = await page.locator('#no-records-message').isVisible();
        console.log(`"No records found" message visible: ${noRecordsMessage}`);
        expect(noRecordsMessage).toBe(true);
    });

    test('Should interact with sliders and update their values', async ({ page }) => {
        console.log('Interacting with sliders...');
        const dueFeesSlider = page.locator('#dueFeesSlider');
        const dueFeesValue = page.locator('#dueFeesValue');

        await dueFeesSlider.fill('400');
        const sliderValue = await dueFeesValue.textContent();
        console.log(`Slider value updated to: ${sliderValue}`);
        expect(sliderValue).toBe('400');
    });

    test('Should display overdue fees correctly', async ({ page }) => {
        console.log('Verifying overdue fees in the table...');
        const tableRows = page.locator('#rent-history-table-body tr');
        const firstRowFees = tableRows.nth(0).locator('td:nth-child(16)'); // Adjust column index as needed
        const feesText = await firstRowFees.textContent();
        console.log(`First row overdue fees: ${feesText}`);

        expect(feesText).toMatch(/^\$\d+\.\d{2}$/); // Matches a currency format like "$12.34"
    });
});