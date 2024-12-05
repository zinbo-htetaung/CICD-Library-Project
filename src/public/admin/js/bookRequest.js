document.addEventListener("DOMContentLoaded", () => {
    fetchAllBookRequests(); // Load all book requests on page load

    // Fetch all book requests
    async function fetchAllBookRequests() {
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

    // Fetch filtered book requests
    async function fetchFilteredBookRequests(filters) {
        try {
            const response = await fetch("/api/requests/filter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(filters)
            });

            if (response.ok) {
                const data = await response.json();
                displayBookRequests(data.requests);
            } else {
                if(response.status==404){
                    alert("No data found");
                }else{
                console.error("Failed to fetch filtered book requests.");
                alert("Failed to load filtered book requests. Please try again later.");}
            }
        } catch (error) {
            console.error("Error fetching filtered book requests:", error);
            alert("An error occurred while fetching filtered book requests.");
        }
    }

    // Display book requests in the table
    function displayBookRequests(requests) {
        const tableBody = document.getElementById("bookRequestTableBody");
        tableBody.innerHTML = ""; // Clear existing rows

        if (requests.length === 0) {
            const noDataRow = document.createElement("tr");
            noDataRow.innerHTML = `<td colspan="7" class="text-center">No book requests available.</td>`;
            tableBody.appendChild(noDataRow);
            return;
        }

        requests.forEach((request) => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td class="text-center">${request.id}</td>
            <td class="text-center">${request.user_id}</td>
            <td>${request.user_name}</td>
            <td>${request.book_name}</td>
            <td>${request.author ? request.author : '-'}</td>
            <td class="text-center">${new Date(request.requested_on).toLocaleDateString()}</td>
            <td class="">
                <div class="d-flex justify-content-center gap-4 px-4">
                    <button class="btn btn-success btn-sm add-btn w-50 border-2 border-black"  
                        data-id="${request.id}" 
                        data-book-name="${encodeURIComponent(request.book_name)}" 
                        data-author="${encodeURIComponent(request.author || '')}">
                        Add
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn w-50 border-2 border-black" data-id="${request.id} ">Delete</button>
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

        document.querySelectorAll(".add-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                
                const bookName = e.target.getAttribute("data-book-name");
                const author = e.target.getAttribute("data-author");
        
                // Redirect to addbook.html with query parameters
                window.location.href = `../addbook.html?bookName=${bookName}&author=${author}`;
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
                fetchAllBookRequests(); // Refresh the table
            } else {
                
                console.error("Failed to delete book request.");
                alert("Failed to delete the book request. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting book request:", error);
            alert("An error occurred while deleting the book request.");
        }
    }

    // Handle filter search button click
    document.getElementById("filterSearchBtn").addEventListener("click", () => {
        const filters = {
            user_id: document.getElementById("filterUserId").value,
            start_date: document.getElementById("filterStartDate").value,
            end_date: document.getElementById("filterEndDate").value,
            sort_order: document.getElementById("sortOrder").value
        };
        fetchFilteredBookRequests(filters);
    });
});
