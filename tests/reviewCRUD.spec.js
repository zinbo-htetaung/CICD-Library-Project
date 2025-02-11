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

    await page.getByRole('button', { name: 'Submit Review' }).click();
}

async function rentBook(page) {
    const rentBookButton = page.locator('#rentBook');
    await rentBookButton.click();

    const dialogPromise = page.waitForEvent('dialog');
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Book rented successfully!');
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
        await page.waitForTimeout(3000);
    
        // Count total stars before updating
        const totalStarsBefore = await page.locator('i.bi-star-fill').count();
    
        // Click edit button
        await page.getByRole('button', { name: 'Edit' }).click();
    
        // Wait for update modal to be visible
        const updateModal = page.locator('#updateReviewModal');
        await expect(updateModal).toBeVisible();
    
        // Update the review
        const updateRatingInput = page.locator('#updateRating');
        await updateRatingInput.fill('4');
    
        const updateReviewTextInput = page.locator('#updateReviewText');
        await updateReviewTextInput.fill('Updated review text for testing');
    
        // Submit the updated review
        await page.locator('#updateReviewForm button[type="submit"]').click();
    
        // Check for success message
        const dialogPromise = page.waitForEvent('dialog');
        const dialog = await dialogPromise;
        expect(dialog.message()).toBe('Review updated successfully');
        await dialog.dismiss();
    
        // Verify the updated content is visible after reload
        await displayReviewsButton.click();
        await page.waitForTimeout(3000);
    
        // Count total stars after updating
        const totalStarsAfter = await page.locator('i.bi-star-fill').count();
        const expectedStars = totalStarsBefore - totalStarsAfter;
    
        // The number of stars should be reduced by 1
        expect(expectedStars).toBe(1);
    });

    test('Delete Review', async ({ page }) => {
        await page.goto('http://localhost:3001/user/html/displaySingleBook.html?bookId=3');
        await rentBook(page);
        await writeValidReview(page);

        const displayReviewsButton = page.locator('#displayReviews');
        await displayReviewsButton.click();
        await page.waitForTimeout(2000);

        // Store initial review count
        const initialReviewCount = await page.locator('.card.mb-3').count();

        // Setup dialog handlers
        page.on('dialog', async (dialog) => {
            if (dialog.type() === 'confirm') {
                await dialog.accept();
            } else if (dialog.type() === 'alert') {
                expect(dialog.message()).toBe('Review deleted successfully.')
                await dialog.dismiss();
            }
        });

        // Click delete button
        await page.getByRole('button', { name: 'Delete' }).click();

        // Wait for page to reload and open reviews modal again
        await displayReviewsButton.click();
        await page.waitForTimeout(2000);

        // Verify review count has decreased
        const finalReviewCount = await page.locator('.card.mb-3').count();
        expect(finalReviewCount).toBe(initialReviewCount - 1);
    });

    test('Filter Reviews', async ({ page }) => {
        await page.goto('http://localhost:3001/user/html/displaySingleBook.html?bookId=2');

        const displayReviewsButton = page.locator('#displayReviews');
        await displayReviewsButton.click();
        await page.waitForTimeout(1000);

        // Test rating filter
        await page.locator('#ratingFilter').selectOption('5');
        await page.locator('#applyFilters').click();
        await page.waitForTimeout(1000); // Wait for filter to apply

        // Verify all visible reviews have 5 stars
        const reviewCards = page.locator('.card.mb-3');
        const reviewCount = await reviewCards.count();
        for (let i = 0; i < reviewCount; i++) {
            const starCount = await reviewCards.nth(i).locator('i.bi-star-fill').count();
            expect(starCount).toBe(5);
        }

        // Test date sort (descending)
        await page.locator('#dateFilter').selectOption('desc');
        await page.locator('#applyFilters').click();
        await page.waitForTimeout(1000);

        // Get all review dates
        const dates = await page.$$eval('.text-muted', elements => 
            elements.map(el => new Date(el.textContent.replace('Posted On: ', '')).getTime())
        );

        // Verify dates are in descending order
        for (let i = 1; i < dates.length; i++) {
            expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
        }

        // Test "My Reviews" filter
        await page.locator('#reviewType').selectOption('my');
        await page.locator('#applyFilters').click();
        await page.waitForTimeout(1000);

        // Verify all visible reviews have edit/delete buttons (indicating they're user's reviews)
        const visibleReviews = await page.locator('.card.mb-3').count();
        for (let i = 0; i < visibleReviews; i++) {
            const review = page.locator('.card.mb-3').nth(i);
            await expect(review.locator('button.update-review-btn')).toBeVisible();
            await expect(review.locator('button.delete-review-btn')).toBeVisible();
        }

        await page.reload();
        await displayReviewsButton.click();

        // Test date range filter
        const today = new Date();
        const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
        
        await page.locator('#startDate').fill(lastMonth.toISOString().split('T')[0]);
        await page.locator('#endDate').fill(new Date().toISOString().split('T')[0]);
        await page.locator('#applyFilters').click();
        await page.waitForTimeout(1000);

        // Verify all visible reviews are within the date range
        const filteredDates = await page.$$eval('.text-muted', elements => 
            elements.map(el => {
                const dateText = el.textContent.replace('Posted On: ', '').trim();
                const parsedDate = new Date(dateText);
                return isNaN(parsedDate) ? null : parsedDate.getTime();
            }).filter(date => date !== null)
        );

        console.log(filteredDates);
        for (const date of filteredDates) {
            console.log(date);
        }
        console.log(lastMonth.getTime());
        console.log(new Date().getTime());

        for (const date of filteredDates) {
            expect(date).toBeGreaterThanOrEqual(lastMonth.getTime());
            expect(date).toBeLessThanOrEqual(new Date().getTime());
        }
    });
})