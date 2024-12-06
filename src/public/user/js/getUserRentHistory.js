document.addEventListener("DOMContentLoaded", () => {
    const rentHistoryTableBody = document.getElementById("rentHistoryTableBody"); // Target table body for appending rent history
    const userId = 1; // Example: Replace with dynamic user ID as needed

    // Function to fetch rent history from backend
    async function fetchRentHistory() {
        try {
            const response = await fetch(`/api/rentHistory/user/review`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    rentHistoryTableBody.innerHTML = `<tr><td colspan="6">No rent history found for this user.</td></tr>`;
                } else {
                    throw new Error("Failed to fetch rent history. Please try again later.");
                }
                return;
            }

            const responseData = await response.json();
            const data = responseData.history;
            console.log(data);
            if (data) {
                appendRentHistoryToTable(data); // Append rent history to the table
            } else {
                rentHistoryTableBody.innerHTML = `<tr><td colspan="6">No rent history found for this user.</td></tr>`;
            }
        } catch (error) {
            console.error("Error fetching rent history:", error);
            rentHistoryTableBody.innerHTML = `<tr><td colspan="6">Error loading rent history.</td></tr>`;
        }
    }

    // Function to append rent history into the table
    function appendRentHistoryToTable(rentHistory) {
        rentHistoryTableBody.innerHTML = ""; // Clear existing table rows
        console.log(rentHistory);
        rentHistory.forEach((rent) => {
            const row = document.createElement("tr");
            console.log(rent.due_status);
            let reviewStatus=false;
            if(rent.book.review.length>0){
                reviewStatus=true
            }
            let buttonHTML = '';
            if (!rent.return_date) {
                // Book hasn't been returned, redirect to the return page
                buttonHTML = '<button class="btn btn-warning border-1 border-black w-75" onclick="window.location.href=\'../html/rentedBooks.html\'">Return Book</button>';
            } else {
                // Book has been returned, redirect to the review page
                if(reviewStatus){
                    buttonHTML = '<button class="btn btn-secondary border-1 border-black w-75">Review Given</button>';
                }
                else{
                    buttonHTML = '<button class="btn border-1 border-black w-75" onclick="window.location.href=\'../html/displaySingleBook.html?bookId=' + rent.book_id + '#writeReviewModal\'" style="background-color: #DBE2EF;">Give Review</button>';
                }
            } 
            row.innerHTML = `
                <td  class="text-center">${rent.id}</td>
                <td>${rent.book.book_name}</td>
                <td class="text-center">${new Date(rent.start_date).toLocaleDateString()}</td>
                <td class="text-center">${rent.return_date ? new Date(rent.return_date).toLocaleDateString() : "N/A"}</td>
                <td class="text-center">
                    ${
                        rent.due_status!=null
                    ? rent.due_status? '<i class="bi bi-check-circle-fill text-danger"></i>'
                    : '<i class="bi bi-x-circle-fill text-success"></i>':'-'}
                </td>
                <td>
                <div class="d-flex justify-content-center"> ${buttonHTML}</div>
                </td>
            `;

            rentHistoryTableBody.appendChild(row);
        });
    }

    // Initial fetch
    fetchRentHistory();
});
