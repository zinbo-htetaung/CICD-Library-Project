const { test, expect } = require('@playwright/test');

const appBaseURL = 'http://localhost:3001'; // Replace with your actual base URL if different
const loginURL = appBaseURL + '/general/html/login.html';
const defaultUserNamePsw = { name: "tester", address: 'address', email: 'admin@gmail.com', password: 'password' };

test.describe('Manage Book Request', () => {
    //login to the page and redirect to book request page
    test.beforeEach(async ({ page }) => {
        await page.goto(loginURL);
        await page.fill('#email', defaultUserNamePsw.email);
        await page.fill('#password', defaultUserNamePsw.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${appBaseURL}/admin/adminHome.html`);
        console.log('Login successful!');
        await page.getByRole('button', { name: 'Manage' }).click();
        await page.getByRole('link', { name: '📩 Manage Book Requests' }).click();
        await expect(page.getByRole('cell', { name: 'To Kill a Mockingbird' })).toBeVisible();

    })
    // test('Should redirect to new page when add button is clicked', async ({ page }) => {
    //     await expect(page.getByRole('cell', { name: '1984' })).toBeVisible();
    //     await page.getByRole('row', { name: '2 2 mary 1984 George Orwell' }).getByRole('button').first().click();
    //     await expect(page).toHaveURL(`${appBaseURL}/admin/addbook.html?bookName=1984&author=George%20Orwell`);
    //     await expect(page.locator('body')).toMatchAriaSnapshot(`
    //             - heading "Add a New Book" [level=2]
    //             - text: Book Name
    //             - textbox "Book Name"
    //             - text: Author
    //             - textbox "Author": George Orwell
    //             - text: Description
    //             - textbox "Description"
    //             - text: Number of Copies
    //             - spinbutton "Number of Copies"
    //             - text: Categories
    //             - checkbox "Fiction"
    //             - text: Fiction
    //             - checkbox "Non-Fiction"
    //             - text: Non-Fiction
    //             - checkbox "Mystery"
    //             - text: Mystery
    //             - checkbox "Fantasy"
    //             - text: Fantasy
    //             - checkbox "Science Fiction"
    //             - text: Science Fiction
    //             - checkbox "Romance"
    //             - text: Romance
    //             - checkbox "Thriller"
    //             - text: Thriller
    //             - checkbox "Historical Fiction"
    //             - text: Historical Fiction
    //             - checkbox "Biography"
    //             - text: Biography
    //             - checkbox "Self-Help"
    //             - text: Self-Help
    //             - button "Reset"
    //             - button "Add Book"
    //             `);
    //     console.log("page redirected to new page passing required info")
    // })
    test('Should pop up alert and delete when delete button is clicked', async ({ page }) => {
        // Get all rows in the table
        const rows = page.locator('table tr');

        // Ensure there is at least one row in the table
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(0);
        console.log("Current row count :"+rowCount)
        // Get data of the last row before deletion
        const lastRow = rows.nth(rowCount - 1);
        console.log("Current last row :"+lastRow)
        const lastRowDataBefore = await lastRow.textContent();

        // Handle confirmation alert
        page.once('dialog', async (dialog) => {
            expect(dialog.message()).toBe('Are you sure you want to delete this request?'); // Update the message based on your app
            await dialog.accept(); // Confirm deletion
        });

        // Click the delete button in the last row
        await lastRow.locator('button:has-text("Delete")').click();

        // Handle success alert
        page.once('dialog', async (dialog) => {
            expect(dialog.message()).toBe('Book request deleted successfully.');
            await dialog.dismiss(); // Dismiss the success alert
        });

        // Wait for the table to update
        await page.waitForTimeout(1000); // Optional, ensure UI has time to update if no dynamic reload is present

        // Verify that the row count has decreased by 1
        const updatedRowCount = await rows.count();
        console.log("Updated row countr:"+updatedRowCount);
        expect(updatedRowCount).toBe(rowCount - 1);

        // Get data of the new last row
        const newLastRow = rows.nth(updatedRowCount - 1);
        const lastRowDataAfter = await newLastRow.textContent();

        // Verify that the last row data has changed
        expect(lastRowDataAfter).not.toBe(lastRowDataBefore);

        console.log('Last row deleted and table updated successfully!');
    })
    test('Should show request by specific user when filter is used', async ({ page }) => {
        const userId="2";
        await page.getByPlaceholder('Enter User ID').fill(userId);
        await page.getByRole('button', { name: 'Search ' }).click();

        await page.waitForTimeout(3000);

        // Wait for table rows to appear
    await page.waitForSelector('table tbody tr');

    // Locate all rows in the table body
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();

    // Ensure there are rows
    expect(rowCount).toBeGreaterThan(0);

    // Verify that all rows have "1" in the user ID column (first column)
    for (let i = 0; i < rowCount; i++) {
        const userIdColumn = rows.nth(i).locator('td:nth-child(2)'); // Adjust to the correct column index
        const userId = await userIdColumn.textContent();
        expect(userId.trim()).toBe(userId); // Verify user ID matches the filter
    }

    console.log('All rows display user ID 1 after filtering.');
    })
})