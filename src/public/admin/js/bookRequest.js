// adminBookRequests.js

document.addEventListener("DOMContentLoaded", () => {
    fetchBookRequests(); // Load existing book requests on page load

    // Fetch and display book requests
    async function fetchBookRequests() {
        try {
            const response = await fetch("/api/requests", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                displayBookRequests(data.requests);
            } else {
                console.error("Failed to fetch book requests.");
                alert("Failed to load book requests. Please try again later.");
            }
        } catch (error) {
            console.error("Error fetching book requests:", error);
            alert("An error occurred while fetching book requests.");
        }
    }

    // Display book requests in the table
    function displayBookRequests(requests) {
        const tableBody = document.getElementById("bookRequestTableBody");
        tableBody.innerHTML = ""; // Clear existing rows

        if (requests.length === 0) {
            const noDataRow = document.createElement("tr");
            noDataRow.innerHTML = `<td colspan="5" class="text-center">No book requests available.</td>`;
            tableBody.appendChild(noDataRow);
            return;
        }
        requests.forEach((request) => {
            console.log(request);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="text-center">${request.id}</td>
                <td class="text-center">${request.user_id}</td>
                <td>${request.user_name}</td>
                <td>${request.book_name}</td>
                <td>${request.author ? request.author : '-'}</td>
                <td class="text-center">${new Date(request.requested_on).toLocaleDateString()}</td>
                <td class="">
                    <div class="d-flex justify-content-center">
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${request.id}">Delete</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add delete event listeners to buttons
        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                const requestId = event.target.getAttribute("data-id");
                deleteBookRequest(requestId);
            });
        });
    }

    // Delete a book request
    async function deleteBookRequest(requestId) {
        if (!confirm("Are you sure you want to delete this request?")) return;

        try {
            const response = await fetch(`/api/requests`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ request_id: requestId })
            });

            if (response.ok) {
                alert("Book request deleted successfully.");
                fetchBookRequests(); // Refresh the table
            } else {
                console.error("Failed to delete book request.");
                alert("Failed to delete the book request. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting book request:", error);
            alert("An error occurred while deleting the book request.");
        }
    }
});
