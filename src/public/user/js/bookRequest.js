// bookRequests.js
document.addEventListener("DOMContentLoaded", () => {

    fetch('../html/user_navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })

    fetch('../../footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })

    fetchBookRequests(); // Load existing book requests

    // Handle form submission for adding a new book request
    const form = document.getElementById("bookRequestForm");
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form default behavior

        const bookName = document.getElementById("bookName").value.trim();
        const author = document.getElementById("author").value.trim();

        if (!bookName) {
            alert("Please fill in book name at least.");
            return;
        }

        try {
            const response = await fetch("/api/requests/user_id", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ book_name: bookName, author: author })
            });

            if (response.ok) {
                alert("Book request submitted successfully!");
                fetchBookRequests(); // Refresh book requests table
                document.getElementById("bookRequestForm").reset(); // Reset form fields

            } else {
                const errorData = await response.json();
                alert(errorData.message || "Error submitting book request.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An unexpected error occurred. Please try again later.");
        }
    });

    document.getElementById("sortOrder").addEventListener("change", () => {
        const sortOrder = document.getElementById("sortOrder").value;
        const userId = localStorage.getItem("user_id");
        const filters = {
            sort_order: sortOrder,
            user_id: userId
        };
        fetchFilteredBookRequests(filters);
    });
});

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
            displayBookRequests(data);
        } else {
            if (response.status == 404) {
                alert("No data found");
            } else {
                console.error("Failed to fetch filtered book requests.");
                alert("Failed to load filtered book requests. Please try again later.");
            }
        }
    } catch (error) {
        console.error("Error fetching filtered book requests:", error);
        alert("An error occurred while fetching filtered book requests.");
    }
}

// Fetch existing book requests and display them in the table
async function fetchBookRequests() {
    try {
        const response = await fetch("/api/requests/user_id", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            const data = await response.json();

            displayBookRequests(data);
        } else {
            const tableBody = document.getElementById("bookRequestTableBody");
            tableBody.innerHTML = "";
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="4" class="text-center">No request found.</td>`;  // Add center alignment to the message
            tableBody.appendChild(row);
            const errorData = await response.json();
        }
    } catch (error) {
        console.error("Error fetching book requests:", error);
        alert("An error occurred while fetching book requests.");
    }
}

// Display book requests in the table
function displayBookRequests(data) {
    const tableBody = document.getElementById("bookRequestTableBody");
    tableBody.innerHTML = ""; // Clear previous content
    data.requests.forEach((request) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${request.id}</td>
                <td>${request.book_name}</td>
                <td>${request.author ? request.author : " - "}</td>
                <td>${new Date(request.requested_on).toLocaleDateString()}</td>
            `;
        tableBody.appendChild(row);
    });
}

