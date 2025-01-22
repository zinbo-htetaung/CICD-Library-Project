const { test, expect } = require('@playwright/test');

const appBaseURL = 'http://localhost:3001'; // Replace with your actual base URL if different
const loginURL = appBaseURL + '/general/html/login.html';
const defaultUserNamePsw = {name:"tester",address:'address', email: 'tester@gmail.com', password: 'tester' };
const updatedInfo = {
    name: 'update-name',
    email: 'updated@gmail.com',
    address: 'updated address',
    password: 'updated',
};


test.describe('Update Profile Info', () => {
    //login to the page and redirect to profile page
    test.beforeEach(async ({ page }) => {
        await page.goto(loginURL);
        await page.fill('#email', defaultUserNamePsw.email);
        await page.fill('#password', defaultUserNamePsw.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${appBaseURL}/user/html/home.html`);
        console.log('Login successful!');
        await page.getByRole('link', { name: 'My Profile ' }).click();
    })
    // //change data back to original data
    // test.afterEach(async ({ page }) => {
    //     try {
    //       console.log('Resetting profile info and password to default...');
    //       await page.goto(`${appBaseURL}/user/html/home.html`)
    //       await page.getByRole('link', { name: 'My Profile ' }).click();
    //     await page.getByRole('button', { name: 'Update Info' }).click();
    //     await page.getByLabel('Name:').fill(defaultUserNamePsw.name);
    //     await page.getByLabel('Email:').fill(defaultUserNamePsw.email);
    //     await page.getByLabel('Address:').fill(defaultUserNamePsw.address);
    //     await page.getByRole('button', { name: 'Save Changes' }).click();
    //     await page.goto(`${appBaseURL}/user/html/home.html`)
    //     await page.getByRole('link', { name: 'My Profile ' }).click();
    //     await page.getByRole('button', { name: 'Actions ' }).click();
    //     await page.getByRole('button', { name: 'Change Password' }).click();
    //     await page.locator('input[name="oldPw"]').fill(updatedInfo.password);
    //     await page.locator('input[name="newPw"]').fill(defaultUserNamePsw.password, );
    //     console.log("changed back to original data")
    //       console.log('Reset complete: Profile info and password restored to default.');
    //     } catch (error) {
    //       console.error('Error during reset:', error);
    //     }
    //   });
    
    test('Should update name, email, and address with valid inputs', async ({ page }) => {

        await page.getByRole('button', { name: 'Update Info' }).click();
        // Open the Update Info modal

        // Update fields
        await page.getByLabel('Name:').fill(defaultUserNamePsw.name);
        await page.getByLabel('Email:').fill(defaultUserNamePsw.email);
        await page.getByLabel('Address:').fill(defaultUserNamePsw.address);

        // Save Changes
        await page.getByRole('button', { name: 'Save Changes' }).click();


        // Verify updated info on the profile page
        await expect(page.locator('#profileName')).toContainText(defaultUserNamePsw.name);
        await expect(page.locator('#profileEmail')).toContainText(defaultUserNamePsw.email);
        await expect(page.locator('#profileAddress')).toContainText(defaultUserNamePsw.address);
        console.log('Info updated successfully!')
    });

    test('Should show error for invalid email format', async ({ page }) => {


        await page.getByRole('button', { name: 'Update Info' }).click();

        // Enter invalid email and try to save
        await page.getByLabel('Email:').fill('invalid-email');
        await page.getByRole('button', { name: 'Save Changes' }).click();

        // Wait for alert and verify message
        page.on('dialog', async (dialog) => {
            expect(dialog.message()).toBe('Invalid email format');
            await dialog.dismiss();
        });
        console.log("Showed error response for invalid email")
    });

    test('Should show error for duplicate email', async ({ page }) => {

        await page.getByRole('button', { name: 'Update Info' }).click();

        // Enter an already registered email and try to save
        await page.getByLabel('Email:').fill('admin@gmail.com');
        await page.getByRole('button', { name: 'Save Changes' }).click();

        // Wait for alert and verify message
        page.on('dialog', async (dialog) => {
            expect(dialog.message()).toBe('User with this email already exists');
            await dialog.dismiss();
        });
        console.log("Showed error response for duplicated email")

    });

    test('Should show error for missing fields', async ({ page }) => {

        await page.getByRole('button', { name: 'Update Info' }).click();

        // Leave the name field empty and try to save
        await page.getByLabel('Email:').fill('');
        await page.getByRole('button', { name: 'Save Changes' }).click();

        // Wait for alert and verify message
        page.on('dialog', async (dialog) => {
            expect(dialog.message()).toBe('All fields are required!');
            await dialog.dismiss();
        });
        console.log("Showed error response for missing input field")

    });
});

test.describe('Update Password', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(loginURL);
        await page.fill('#email', defaultUserNamePsw.email);
        await page.fill('#password', defaultUserNamePsw.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${appBaseURL}/user/html/home.html`);
        console.log('Login successful!');
        await page.getByRole('link', { name: 'My Profile ' }).click();
    })
    test('Should update password successfully', async ({ page }) => {

        await page.getByRole('button', { name: 'Actions ' }).click();

        await page.getByRole('button', { name: 'Change Password' }).click();

        // Fill in the old and new password
        await page.locator('input[name="oldPw"]').fill(defaultUserNamePsw.password);
        await page.locator('input[name="newPw"]').fill(updatedInfo.password);

        // Save the new password
        await page.getByRole('button', { name: 'Save' }).click();

        // Wait for alert and verify success message
        page.on('dialog', async (dialog) => {
            expect(dialog.message()).toBe('Password updated successfully!');
            console.log("Password updated successfully!")
            await dialog.dismiss();
        });
    });
    test('Should show alert if old password is incorrect', async ({ page }) => {
        // Open the "Change Password" modal
        await page.getByRole('button', { name: 'Actions ' }).click();

        await page.getByRole('button', { name: 'Change Password' }).click();
    
        // Fill in incorrect old password
        await page.locator('input[name="oldPw"]').fill('wrongpassword');
        await page.locator('input[name="newPw"]').fill(updatedInfo.password);
    
        // Click Save and verify alert message
        await page.getByRole('button', { name: 'Save' }).click();
        page.on('dialog', async (dialog) => {
          expect(dialog.message()).toBe('Old password is incorrect');
          await dialog.dismiss();
        });
        console.log("Showed error response for incorrect password")

      });
});
