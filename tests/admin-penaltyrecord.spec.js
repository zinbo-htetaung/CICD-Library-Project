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
    await page.goto('http://localhost:3001/admin/penaltyRecords.html');
});

test.describe('Penalty Record Page Tests', () => {
    // Test for displaying penalty records
    test('Successful penalty records display', async ({ page }) => {
        await expect(page).toHaveTitle('User Penalty Records');
        await expect(page.locator('h1')).toHaveText('User Penalty Records');

        await page.waitForFunction(() => {
            const rows = document.querySelectorAll("#penaltyRecordsTable tr");
            return rows.length > 1; 
        });

        const rows = await page.locator('#penaltyRecordsTable tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(1); 
    });

    // Test for filtering penalty records successfully
    test('Successful penalty records filtering', async ({ page }) => {
        const nameFilter = await page.getByLabel("Username:");
        await nameFilter.fill("john");
        const statusFilter = await page.getByLabel("Status:");
        await statusFilter.selectOption('true');
        const startDateFilter = await page.getByLabel("Start Date:");
        await startDateFilter.fill("2022-10-10");

        const submitBtn = await page.getByRole('button', { name: 'Submit' });
        await submitBtn.click();

        // Verify that all displayed records match the filter criteria
        const rows = await page.locator("#penaltyRecordsTable tr");
        const rowCount = await rows.count();
        await expect(rowCount).toBeGreaterThan(0); 

        for (let i = 0; i < await rows.count(); i++) {
            const nameColumn = await rows.nth(i).locator("td:nth-child(4)");
            const nameText = await nameColumn.textContent();
            expect(nameText.toLowerCase().trim()).toContain("john");

            const statusColumn = await rows.nth(i).locator("td:nth-child(6)");
            const statusText = await statusColumn.textContent();
            expect(statusText).toContain("Paid"); 
        }
    });

    // Test for filtering penalty records with no match
    test('No records found for invalid filters', async ({ page }) => {
        const nameFilter = await page.getByLabel("Username:");
        await nameFilter.fill("xyz");
        const endDateFilter = await page.getByLabel("End Date:");
        await endDateFilter.fill("2021-11-11");

        await page.getByRole('button', { name: 'Submit' }).click();

        await expect(page.locator("#penaltyRecordsTable")).toHaveText(/No penalty records found matching the filters/);
    });


});