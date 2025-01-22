const { test, expect } = require('@playwright/test');

async function writeValidReview(page) {
    const writeReviewButton = page.locator('#writeReview');
    await writeReviewButton.click();

    const reviewModal = page.locator('#writeReviewModal');
    await expect(reviewModal).toBeVisible();

    const ratingInput = page.locator('#rating');
    await ratingInput.fill('5');

    const reviewTextInput = page.locator('#reviewText');
    await reviewTextInput.fill('This is an amazing book!');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
}

async function rentBook(page) {
    const rentBookButton = page.locator('#rentBook');
    await rentBookButton.click();

    const dialogPromise = page.waitForEvent('dialog');
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Book rented successfully! Rented Book: 1984');
    await dialog.dismiss();
}

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/general/html/login.html');

    const emailInput = page.locator('#email');
    await emailInput.fill('test@gmail.com');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('password');

    await page.getByRole('button', { name: 'Login' }).click();

    const dialogPromise = page.waitForEvent('dialog');
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Login successful!');
    await dialog.dismiss();

    await expect(page).toHaveURL('http://localhost:3001/user/html/home.html');

    const navLink = page.locator('a.nav-link[href="displayAllBooks.html"]');
    await navLink.click();
    await page.waitForURL('http://localhost:3001/user/html/displayAllBooks.html');

    const bookCard = page.locator('h4', { hasText: '1984' });
    await bookCard.click();
    await page.waitForURL('http://localhost:3001/user/html/displaySingleBook.html?bookId=2');
});

test.describe('User Review Test', () => {
    test('Create Review Both Fail and Success Case', async ({ page }) => {
        //Testing Failed Case Where the User hasnt read the book before
        const iconContainer = await page.locator('#iconContainer');
        const icon = await iconContainer.locator('i');
        await expect(icon).toHaveClass(/bi-book/);
        await writeValidReview(page);

        const errorMessage = page.locator('#errorMessage');
        await expect(errorMessage).toContainText('You need to rent and read the book before being allowed to review it.');
        const closeButton = page.locator('#writeReviewModal .modal-header .btn-close');
        await closeButton.click();

        //Testing Success Case Where the User read the book before
        rentBook(page);

        await expect(icon).toHaveClass(/bi-book-half/);

        writeValidReview(page);

        const dialogPromise2 = page.waitForEvent('dialog');
        const dialog2 = await dialogPromise2;
        expect(dialog2.message()).toBe('Review submitted successfully!');
        await dialog2.dismiss();
    });

    test('View Review', async ({ page }) => {
        const displayReviewsButton = page.locator('#displayReviews');
        await displayReviewsButton.click();

        const reviewSection = page.locator('#reviewsModal');
        await expect(reviewSection).toBeVisible();

        const reviewCount = await reviewSection.locator('.card-body').count();
        await expect(reviewCount).toBeGreaterThan(0);

        const reviewCard = page.locator('.card.mb-3');
        const ratingStars = await reviewCard.locator('i.bi-star-fill').count();

        await expect(ratingStars).toBeGreaterThan(0);
        await expect(page.getByText('mary')).toBeVisible();
        await expect(page.getByText('A great read, but a bit too dark for me.')).toBeVisible();
    });

    test('Update Review', async ({ page }) => {
        await page.goto('http://localhost:3001/user/html/displaySingleBook.html?bookId=1');

        const displayReviewsButton = page.locator('#displayReviews');
        await displayReviewsButton.click();

        await page.getByRole('button', { name: 'Edit' }).click();

        const dialogPromise = page.waitForEvent('dialog');
        const dialog = await dialogPromise;

        // Handle the dialog based on the message
        if (dialog.message().includes('Enter new rating')) {
            await dialog.accept('4');  // Simulate entering new rating
        } else if (dialog.message().includes('Enter new review text')) {
            await dialog.accept('Updated review text');  // Simulate entering new review text
        }

        await expect(page.getByText('Updated review text')).toBeVisible();
    });

    test('Delete Review', async ({ page }) => {
        await page.goto('http://localhost:3001/user/html/displaySingleBook.html?bookId=1');

        const displayReviewsButton = page.locator('#displayReviews');
        await displayReviewsButton.click();

        await page.getByRole('button', { name: 'Delete' }).click();

        page.on('dialog', async (dialog) => {
            if (dialog.type() === 'confirm') {
                await dialog.accept();
            } else if (dialog.type() === 'alert') {
                expect(dialog.message()).toBe('Review deleted successfully.')
                await dialog.dismiss();
            }
        });

    });
})