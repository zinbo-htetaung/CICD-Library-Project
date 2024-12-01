document.addEventListener("DOMContentLoaded", () => {
    const reviewsTableBody = document.getElementById("reviewsTableBody"); // Target table body for appending reviews
    const userId = 1; // Example: Replace with dynamic user ID as needed

    // Function to fetch reviews from backend
    async function fetchReviews() {
        try {
            const response = await fetch(`/api/reviews/user`); // Dynamic URL with userId
            
            if (!response.ok) {
                if (response.status === 404) {
                    reviewsTableBody.innerHTML = `<tr><td colspan="5">No reviews found for this user.</td></tr>`;
                } else {
                    throw new Error("Failed to fetch reviews. Please try again later.");
                }
                return;
            }

            const data = await response.json();
            console.log(data)
            if (data.reviews) {
                appendReviewsToTable(data.reviews); // Append reviews to the table
            } else {
                reviewsTableBody.innerHTML = `<tr><td colspan="5">No reviews found for this user.</td></tr>`;
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            reviewsTableBody.innerHTML = `<tr><td colspan="5">Error loading reviews.</td></tr>`;
        }
    }

    // Function to append reviews into the table
    function appendReviewsToTable(reviews) {
        reviewsTableBody.innerHTML = ""; // Clear existing table rows
        console.log(reviews)
        reviews.forEach((review) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${review.id}</td>
                <td>${review.book_name}</td>
                <td>${review.rating}</td>
                <td>${review.review_text || "N/A"}</td>
                <td>${new Date(review.posted_on).toLocaleString()}</td>
            `;

            reviewsTableBody.appendChild(row);
        });
    }

    // Initial fetch
    fetchReviews();
});
