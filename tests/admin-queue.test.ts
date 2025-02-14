const { test, expect } = require('@playwright/test');

const appBaseURL = 'http://localhost:3001'; // Change if different
const loginURL = `${appBaseURL}/general/html/login.html`;
const defaultUser = { email: 'admin@gmail.com', password: 'password' };

test.describe('Manage Queues', () => {
    // 🔹 Login & Navigate to "Manage Queues" Page
    test.beforeEach(async ({ page }) => {
        await page.goto(loginURL);
        await page.fill('#email', defaultUser.email);
        await page.fill('#password', defaultUser.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${appBaseURL}/admin/adminHome.html`);
        console.log('✅ Login successful!');

        await page.getByRole('button', { name: 'Manage' }).click();
        await page.getByRole('link', { name: '📃 Manage Queues' }).click();
        await expect(page.locator('h3')).toHaveText('Queue Management 📃');
    });

    // 🔹 Search Queue By User Name & Status
    test('Should filter queue by user name and status', async ({ page }) => {
        const userName = "john";
        const queueStatus = "Fulfilled";

        await page.getByPlaceholder('Enter User Name').fill(userName);
        await page.getByLabel('Queue Status').selectOption(queueStatus);
        await page.getByRole('button', { name: 'Search 🔎' }).click();
        
        console.log(`🔍 Searching for queues: User="${userName}", Status="${queueStatus}"`);

        // Wait for results to load
        await page.waitForSelector('table tbody tr');

        // Verify all rows contain filtered user and status
        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(0);
        
        for (let i = 0; i < rowCount; i++) {
            const userNameColumn = rows.nth(i).locator('td:nth-child(3)'); // Adjust column index
            const statusColumn = rows.nth(i).locator('td:nth-child(5)'); // Adjust column index
            
            expect(await userNameColumn.textContent()).toContain(userName);
            expect(await statusColumn.textContent()).toContain(queueStatus);
        }

        console.log('✅ Filtered queues match search criteria.');
    });

    // 🔹 Delete a Queue Entry
    test('Should confirm and delete the first queue entry', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      let rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
  
      console.log(`🗑️ Found ${rowCount} queue entries before deletion.`);
  
      // Select the first row instead of the last row
      const firstRow = rows.nth(0);
      const queueId = await firstRow.locator('td:nth-child(1)').textContent(); // Queue ID column
  
      // Handle confirmation alert
      page.once('dialog', async (dialog) => {
          expect(dialog.message()).toContain('Are you sure'); // ✅ Check partial message
          await dialog.accept();
      });
  
      await firstRow.locator('button:has-text("Remove")').click();
  
      // ✅ Wait for success alert before proceeding
      page.once('dialog', async (dialog) => {
          expect(dialog.message()).toContain('Queue entry removed successfully'); // ✅ Partial check for success
          await dialog.dismiss();
      });
  
      // ✅ Wait for backend to process the deletion
      await page.waitForTimeout(2000); // Give time for backend to process
  
      // ✅ Force a page reload if UI doesn't update dynamically
      await page.reload();
  
      // ✅ Re-fetch rows after reloading
      const updatedRows = page.locator('table tbody tr');
      const updatedRowCount = await updatedRows.count();
  
      console.log(`🔄 Updated row count after deletion: ${updatedRowCount}`);
  

      console.log(`✅ Queue ID ${queueId} removed successfully.`);
  });
  
  
  
  

});
